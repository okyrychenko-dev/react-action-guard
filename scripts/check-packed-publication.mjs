import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { build } from "esbuild";
import { preparePackedCohort } from "./compatibility/cohort.utils.mjs";

const repository = fileURLToPath(new URL("../", import.meta.url));
const temporary = mkdtempSync(join(tmpdir(), "action-guard-publication-"));
const { tarballs } = preparePackedCohort(repository, temporary);
const checks = [];
for (const [id, { name, version, tarball }] of Object.entries(tarballs)) {
  execFileSync(join(repository, "node_modules/.bin/publint"), [tarball, "--strict"], {
    stdio: "inherit",
    timeout: 60_000,
  });
  const attwArguments = [tarball, "--no-definitely-typed", "--format", "json"];
  const profile = id === "router" ? "node16" : "strict";
  attwArguments.push("--profile", profile);
  const excludedEntrypoints = id === "devtools" ? ["./styles.css"] : [];
  if (excludedEntrypoints.length)
    attwArguments.push("--exclude-entrypoints", ...excludedEntrypoints);
  const analysis = spawnSync(
    process.execPath,
    [
      join(
        repository,
        "node_modules/@arethetypeswrong/cli",
        JSON.parse(
          readFileSync(join(repository, "node_modules/@arethetypeswrong/cli/package.json"), "utf8")
        ).bin.attw
      ),
      ...attwArguments,
    ],
    { encoding: "utf8", timeout: 60_000, maxBuffer: 20_000_000 }
  );
  assert.ifError(analysis.error);
  const report = JSON.parse(analysis.stdout);
  assert.ok(report.analysis?.types, `${name} analyzer must inspect bundled types`);
  writeFileSync(join(temporary, `${name.split("/").at(-1)}-attw.json`), analysis.stdout);
  assert.equal(
    analysis.status,
    0,
    `${name} declaration analysis failed: ${analysis.stdout}\n${analysis.stderr}`
  );
  checks.push({ name, version, publint: "passed", attw: "passed", profile, excludedEntrypoints });
}
const consumer = join(temporary, "consumer");
mkdirSync(consumer);
const dependencies = {
  react: "19.2.8",
  "react-dom": "19.2.8",
  "@types/react": "19.2.18",
  zustand: "5.0.15",
  "@okyrychenko-dev/react-zustand-toolkit": "1.0.0",
  "@okyrychenko-dev/type-utils": "0.1.2",
  "@tanstack/react-query": "5.90.10",
  "react-router-dom": "7.14.2",
  "@tanstack/react-router": "1.170.41",
  next: "15.5.23",
};
for (const { name, tarball } of Object.values(tarballs)) dependencies[name] = `file:${tarball}`;
writeFileSync(
  join(consumer, "package.json"),
  JSON.stringify({ private: true, type: "module", dependencies }, null, 2)
);
execFileSync(
  "npm",
  [
    "install",
    "--strict-peer-deps",
    "--ignore-scripts",
    "--omit=optional",
    "--no-audit",
    "--no-fund",
  ],
  { cwd: consumer, stdio: "inherit", timeout: 240_000 }
);
const measuredEntries = [
  { id: "core", path: tarballs.core.name, symbol: "createBlockingLifecycle" },
  { id: "ui", path: tarballs.ui.name, symbol: "useGuardedButton" },
  { id: "devtools", path: tarballs.devtools.name, symbol: "ActionGuardDevtools" },
  { id: "tanstack", path: tarballs.tanstack.name, symbol: "useBlockingMutation" },
  { id: "router", path: tarballs.router.name, symbol: "useDialogState" },
  {
    id: "react-router",
    path: `${tarballs.router.name}/react-router`,
    symbol: "useNavigationBlocker",
  },
  {
    id: "tanstack-router",
    path: `${tarballs.router.name}/tanstack-router`,
    symbol: "useNavigationBlocker",
  },
  { id: "nextjs", path: `${tarballs.router.name}/nextjs`, symbol: "usePagesRouterBlocker" },
];
const external = [
  "react",
  "react-dom",
  "react-router-dom",
  "@tanstack/react-router",
  "@tanstack/react-query",
  "next",
];
const measurements = [];
function size(file) {
  const contents = readFileSync(file);
  return { bytes: contents.byteLength, gzipBytes: gzipSync(contents).byteLength };
}
for (const { id, path, symbol } of measuredEntries) {
  const bundleEntry = join(consumer, `${id}-minimal-entry.js`);
  const bundle = join(consumer, `${id}-minimal.mjs`);
  writeFileSync(
    bundleEntry,
    `import { ${symbol} } from "${path}";\nconsole.log(typeof ${symbol});\n`
  );
  await build({
    entryPoints: [bundleEntry],
    bundle: true,
    external,
    format: "esm",
    minify: true,
    outfile: bundle,
  });
  const module = Object.values(tarballs).find(
    ({ name }) => path === name || path.startsWith(`${name}/`)
  );
  assert.ok(module, `Unknown packed module ${path}`);
  const packageRoot = join(consumer, "node_modules", module.name);
  const manifestPath = join(packageRoot, "package.json");
  const originalManifest = readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(originalManifest);
  const subpath = path.slice(module.name.length);
  const exportPath = subpath ? `.${subpath}` : ".";
  const declared = manifest.exports[exportPath];
  const artifacts = Object.fromEntries(
    [
      declared.import.default,
      declared.require.default,
      declared.import.types,
      declared.require.types,
    ].map((file) => [file, size(join(packageRoot, file))])
  );
  const sideEffectEntry = join(consumer, `${id}-side-effect-entry.js`);
  const sideEffectBundle = join(consumer, `${id}-side-effect.mjs`);
  writeFileSync(
    sideEffectEntry,
    `const before = new Set(Reflect.ownKeys(globalThis));\nawait import("${path}");\nconst added = Reflect.ownKeys(globalThis).filter((key) => !before.has(key));\nif (added.length) throw new Error("Import added globals: " + added.join(", "));\n`
  );
  // Prevent tree shaking from hiding initialization under test. Preserve the CSS
  // exception in the real manifest by restoring it after this isolated probe.
  manifest.sideEffects = true;
  writeFileSync(manifestPath, JSON.stringify(manifest));
  try {
    await build({
      entryPoints: [sideEffectEntry],
      bundle: true,
      external,
      format: "esm",
      minify: true,
      outfile: sideEffectBundle,
    });
    const execution = spawnSync(process.execPath, [sideEffectBundle], {
      cwd: consumer,
      encoding: "utf8",
      timeout: 5_000,
    });
    assert.ifError(execution.error);
    assert.equal(execution.status, 0, `${path} import failed: ${execution.stderr}`);
    assert.equal(execution.stdout, "", `${path} import wrote stdout`);
    assert.equal(execution.stderr, "", `${path} import wrote stderr`);
  } finally {
    writeFileSync(manifestPath, originalManifest);
  }
  measurements.push({
    path,
    symbol,
    artifacts,
    minimalConsumer: size(bundle),
    importSideEffects: "passed",
    external,
  });
}
assert.ok(
  existsSync(join(consumer, "node_modules", tarballs.devtools.name, "dist/index.css")),
  "Devtools stylesheet must remain published"
);
const result = {
  date: new Date().toISOString(),
  node: process.version,
  tools: Object.fromEntries(
    ["publint", "@arethetypeswrong/cli", "esbuild"].map((name) => [
      name,
      JSON.parse(readFileSync(join(repository, "node_modules", name, "package.json"), "utf8"))
        .version,
    ])
  ),
  checks,
  measurements,
};
writeFileSync(join(temporary, "publication.json"), JSON.stringify(result, null, 2));
console.log(`Publication results, ATTW reports and isolated consumer: ${temporary}`);
