import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { build } from "esbuild";
import { preparePackedCohort } from "./compatibility/cohort.utils.mjs";

const repository = fileURLToPath(new URL("../", import.meta.url));
const temporary = mkdtempSync(join(tmpdir(), "action-guard-efficiency-"));
const output = resolve(process.argv[2] ?? temporary);
mkdirSync(output, { recursive: true });
assert.equal(readdirSync(output).length, 0, "Use an empty evidence directory for each run");
const { tarballs } = preparePackedCohort(repository, temporary);
const consumer = join(temporary, "consumer");
mkdirSync(consumer);
const localVersion = (path) =>
  JSON.parse(readFileSync(join(repository, path, "package.json"), "utf8")).version;
const dependencies = {
  react: localVersion("packages/core/node_modules/react"),
  "react-dom": localVersion("packages/core/node_modules/react-dom"),
  zustand: localVersion("packages/core/node_modules/zustand"),
  "@okyrychenko-dev/type-utils": localVersion(
    "packages/core/node_modules/@okyrychenko-dev/type-utils"
  ),
  "@okyrychenko-dev/react-zustand-toolkit": localVersion(
    "packages/core/node_modules/@okyrychenko-dev/react-zustand-toolkit"
  ),
  "happy-dom": localVersion("node_modules/happy-dom"),
  "@types/react": localVersion("packages/core/node_modules/@types/react"),
};
for (const id of ["core", "ui"]) dependencies[tarballs[id].name] = `file:${tarballs[id].tarball}`;
writeFileSync(
  join(consumer, "package.json"),
  JSON.stringify({ private: true, type: "module", dependencies }, null, 2)
);
execFileSync(
  "npm",
  ["install", "--strict-peer-deps", "--ignore-scripts", "--no-audit", "--no-fund"],
  {
    cwd: consumer,
    stdio: "inherit",
    timeout: 240_000,
  }
);
cpSync(join(repository, "scripts/efficiency"), join(consumer, "fixtures"), { recursive: true });
cpSync(
  join(repository, "scripts/compatibility/provider.test.mjs"),
  join(consumer, "fixtures/provider.test.mjs")
);
execFileSync(process.execPath, ["--test", "fixtures/provider.test.mjs"], {
  cwd: consumer,
  env: { ...process.env, NODE_ENV: "development" },
  stdio: "inherit",
});
execFileSync(
  process.execPath,
  [
    join(repository, "node_modules/typescript/bin/tsc"),
    "fixtures/narrowing.utils.ts",
    "--noEmit",
    "--strict",
    "--noUncheckedIndexedAccess",
    "--skipLibCheck",
    "--module",
    "NodeNext",
    "--target",
    "ES2022",
  ],
  { cwd: consumer, stdio: "inherit" }
);

for (const mode of ["production", "development"]) {
  execFileSync(process.execPath, ["fixtures/subscriptions.mjs", join(output, `${mode}.json`)], {
    cwd: consumer,
    env: { ...process.env, NODE_ENV: mode },
    stdio: "inherit",
    timeout: 120_000,
  });
}
execFileSync(process.execPath, ["fixtures/toolkit.mjs"], {
  cwd: consumer,
  env: { ...process.env, NODE_ENV: "production" },
  stdio: "inherit",
});

const external = ["react", "react-dom", "react-dom/*"];
const measurements = [];
for (const id of ["core", "ui"]) {
  for (const variant of ["retained", "type-utils-external", "toolkit-external"]) {
    const outfile = join(consumer, `${id}-${variant}.mjs`);
    const selectedExternal = [...external];
    if (variant === "type-utils-external") selectedExternal.push("@okyrychenko-dev/type-utils");
    if (variant === "toolkit-external")
      selectedExternal.push("@okyrychenko-dev/react-zustand-toolkit");
    const result = await build({
      entryPoints: [join(consumer, "fixtures", `${id}-consumer.mjs`)],
      outfile,
      bundle: true,
      minify: true,
      format: "esm",
      platform: "browser",
      target: "es2022",
      external: selectedExternal,
      metafile: true,
      define: { "process.env.NODE_ENV": '"production"' },
    });
    const bytes = readFileSync(outfile);
    measurements.push({
      id,
      variant,
      bytes: bytes.length,
      gzipBytes: gzipSync(bytes).length,
      external: selectedExternal,
    });
    writeFileSync(
      join(output, `${id}-${variant}-metafile.json`),
      JSON.stringify(result.metafile, null, 2) + "\n"
    );
    // SSR smoke is not a substitute for the client workload; it proves these retained
    // entries execute actual hooks and lifecycle guards, rather than typeof imports.
    if (variant === "retained") {
      execFileSync(
        process.execPath,
        [
          "--input-type=module",
          "-e",
          `
        import assert from "node:assert/strict";
        import { createElement } from "react";
        import { renderToString } from "react-dom/server";
        import * as consumer from "./${id}-${variant}.mjs";
        assert.match(renderToString(createElement(consumer.App)), /button/);
        if (consumer.exercise) assert.equal(consumer.exercise(), true);
      `,
        ],
        { cwd: consumer, env: { ...process.env, NODE_ENV: "production" }, stdio: "inherit" }
      );
    }
  }
}
const typeUtilsEntry = join(consumer, "type-utils-entry.mjs");
writeFileSync(
  typeUtilsEntry,
  `
import { isNonEmptyArray, isDefined, isUndefined, isString, isArray, isInstanceOf } from "@okyrychenko-dev/type-utils";
export function guards(value) {
  return [isNonEmptyArray(value), isDefined(value), isUndefined(value), isString(value), isArray(value), isInstanceOf(value, Error)];
}
`
);
const guardsBundle = join(consumer, "guards.mjs");
await build({
  entryPoints: [typeUtilsEntry],
  outfile: guardsBundle,
  bundle: true,
  minify: true,
  format: "esm",
  platform: "browser",
});
const guardsBytes = readFileSync(guardsBundle);
execFileSync(
  process.execPath,
  [
    "--input-type=module",
    "-e",
    `
  import assert from "node:assert/strict";
  import { guards } from "./guards.mjs";
  assert.deepEqual(guards(["reason"]), [true, true, false, false, true, false]);
  assert.deepEqual(guards([]), [false, true, false, false, true, false]);
  assert.deepEqual(guards(undefined), [false, false, true, false, false, false]);
  assert.equal(guards(new Error("failure"))[5], true);
  assert.equal(guards("checkout")[3], true);
`,
  ],
  { cwd: consumer, stdio: "inherit" }
);
const lock = readFileSync(join(consumer, "package-lock.json"), "utf8");
cpSync(join(consumer, "package-lock.json"), join(output, "consumer-lock.json"));
writeFileSync(
  join(output, "bundles.json"),
  JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: repository,
        encoding: "utf8",
      }).trim(),
      sourceDirty: execFileSync("git", ["status", "--porcelain"], {
        cwd: repository,
        encoding: "utf8",
      }).trim(),
      node: process.version,
      esbuild: localVersion("node_modules/esbuild"),
      packages: Object.fromEntries(
        ["core", "ui"].map((id) => [id, { name: tarballs[id].name, version: tarballs[id].version }])
      ),
      resolvedVersions: Object.fromEntries(
        Object.entries(JSON.parse(lock).packages).map(([name, entry]) => [name, entry.version])
      ),
      method:
        "Minified ESM browser/es2022 actual-hook consumers from versioned tarballs; React/DOM external, Zustand included. gzipSync defaults. External variants estimate included cost only: they do not implement dependency replacement or prove equivalent behavior; gzip deltas are not additive. Sibling modal benchmarks informed warmup/setup separation, no sibling sizes reused.",
      measurements,
      guardSet: {
        bytes: guardsBytes.length,
        gzipBytes: gzipSync(guardsBytes).length,
        runtime: "passed",
        strictNarrowing: "passed",
      },
      retainedConsumerSSR: "passed",
      providerIsolationAndHydration: "passed (existing packed provider suite)",
      toolkitMiddlewareHandle: "passed",
    },
    null,
    2
  ) + "\n"
);
assert.equal(measurements.length, 6);
console.log(`Efficiency evidence: ${output}\nIsolated consumer and bundles: ${consumer}`);
