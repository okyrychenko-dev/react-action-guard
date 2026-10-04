import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const repository = fileURLToPath(new URL("../", import.meta.url));
const temporary = mkdtempSync(join(tmpdir(), "action-guard-compatibility-"));
const packageNames = ["core", "ui", "devtools", "tanstack", "router"];
const targets = {
  "react-18": { react: "18.0.0", "react-dom": "18.0.0", "@types/react": "18.0.0" },
  "react-19-floor": { react: "19.0.0", "react-dom": "19.0.0", "@types/react": "19.0.0" },
  "react-19": {
    react: "19.2.8",
    "react-dom": "19.2.8",
    "@types/react": "19.2.18",
    zustand: "5.0.15",
  },
  "react-router-floor": { "react-router-dom": "6.19.0" },
  "react-router-7-floor": { "react-router-dom": "7.0.0" },
  "react-router-current": { "react-router-dom": "7.14.2" },
  "tanstack-router-floor": { "@tanstack/react-router": "1.170.41" },
  "next-13-floor": { next: "13.4.0", react: "18.2.0", "react-dom": "18.2.0" },
  "next-14-floor": { next: "14.0.0", react: "18.2.0", "react-dom": "18.2.0" },
  "next-15-floor": { next: "15.0.0", react: "18.2.0", "react-dom": "18.2.0" },
  "next-current": { next: "15.5.23" },
  "query-floor": { "@tanstack/react-query": "5.90.10" },
};
const selected = process.argv.slice(2);
const cases = selected.length ? selected : Object.keys(targets);
for (const name of cases)
  assert.ok(Object.hasOwn(targets, name), `Unknown compatibility target ${name}`);
function run(command, args, cwd = repository) {
  return execFileSync(command, args, { cwd, stdio: "inherit", timeout: 240_000 });
}
const tarballs = {};
for (const name of packageNames) {
  const directory = join(temporary, "packs", name);
  mkdirSync(directory, { recursive: true });
  const manifest = JSON.parse(
    readFileSync(join(repository, "packages", name, "package.json"), "utf8")
  );
  const tarball = join(directory, "package.tgz");
  run("pnpm", ["pack", "--out", tarball], join(repository, "packages", name));
  tarballs[name] = { name: manifest.name, tarball };
}
for (const name of cases) {
  console.log(`\nChecking packed consumer: ${name}`);
  const consumer = join(temporary, name);
  mkdirSync(consumer);
  const dependencies = {
    ...targets["react-19"],
    zustand: "5.0.0",
    "@okyrychenko-dev/react-zustand-toolkit": "1.0.0",
    "@okyrychenko-dev/type-utils": "0.1.2",
    semver: "7.7.2",
    typescript: "5.6.3",
    "happy-dom": "20.0.10",
    ...targets[name],
  };
  const modules = ["core", "ui", "devtools", "router"];
  if (name === "query-floor") modules.push("tanstack");
  for (const module of modules)
    dependencies[tarballs[module].name] = `file:${tarballs[module].tarball}`;
  writeFileSync(
    join(consumer, "package.json"),
    JSON.stringify({ private: true, type: "module", dependencies }, null, 2)
  );
  // Pending Changesets release the cohort together; current source versions do not
  // yet satisfy Devtools/Query core peers. Explicit peers also prevent npm from
  // installing optional router adapters. This is not a strict-peer install check.
  run(
    "npm",
    [
      "install",
      "--legacy-peer-deps",
      "--ignore-scripts",
      "--omit=optional",
      "--no-audit",
      "--no-fund",
    ],
    consumer
  );
  const requireConsumer = createRequire(join(consumer, "package.json"));
  const { satisfies } = requireConsumer("semver");
  for (const module of modules) {
    const packageRoot = join(consumer, "node_modules", tarballs[module].name);
    const manifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
    for (const field of ["main", "module", "types", "style"]) {
      if (manifest[field])
        assert.ok(
          existsSync(join(packageRoot, manifest[field])),
          `${manifest.name} missing ${field}: ${manifest[field]}`
        );
    }
    for (const [peer, range] of Object.entries(manifest.peerDependencies ?? {})) {
      if (peer === tarballs.core.name) continue; // Pending release-cohort versioning.
      if (dependencies[peer])
        assert.ok(
          satisfies(dependencies[peer], range),
          `${name}: ${peer}@${dependencies[peer]} is outside ${range}`
        );
      else
        assert.equal(
          manifest.peerDependenciesMeta?.[peer]?.optional,
          true,
          `${name}: required peer ${peer} was not supplied`
        );
    }
    for (const [dependency, range] of Object.entries(manifest.dependencies ?? {})) {
      if (dependencies[dependency])
        assert.ok(satisfies(dependencies[dependency], range), `${dependency} is outside ${range}`);
    }
  }
  const optionalPeers = [
    "react-router-dom",
    "@tanstack/react-router",
    "next",
    "@tanstack/react-query",
  ];
  for (const peer of optionalPeers) {
    if (!dependencies[peer])
      assert.equal(
        existsSync(join(consumer, "node_modules", peer)),
        false,
        `${peer} must be absent in ${name}`
      );
  }
  const entries = [
    {
      path: tarballs.core.name,
      exports: ["UIBlockingProvider", "useActionBlocker", "useIsBlocked"],
    },
    { path: tarballs.ui.name, exports: ["useGuardedButton", "GuardedScopeProvider"] },
    {
      path: tarballs.devtools.name,
      exports: ["ActionGuardDevtools", "ActionGuardDevtoolsProvider"],
    },
    { path: tarballs.router.name, exports: ["useBeforeUnload", "useDialogState"] },
  ];
  if (dependencies["react-router-dom"])
    entries.push({
      path: `${tarballs.router.name}/react-router`,
      exports: ["useNavigationBlocker"],
    });
  if (dependencies["@tanstack/react-router"])
    entries.push({
      path: `${tarballs.router.name}/tanstack-router`,
      exports: ["useNavigationBlocker"],
    });
  if (dependencies.next)
    entries.push({
      path: `${tarballs.router.name}/nextjs`,
      exports: ["usePagesRouterBlocker", "useAppRouterBlocker"],
    });
  if (dependencies["@tanstack/react-query"])
    entries.push({
      path: tarballs.tanstack.name,
      exports: ["useBlockingQuery", "useBlockingMutation"],
    });
  writeFileSync(join(consumer, "entries.json"), JSON.stringify(entries));
  cpSync(join(repository, "scripts/compatibility/consumer.mjs"), join(consumer, "consumer.mjs"));
  run("node", ["consumer.mjs"], consumer);
  const commonTypes = readFileSync(
    join(repository, "scripts/compatibility/consumer.typecheck.ts"),
    "utf8"
  );
  const typeSource =
    commonTypes +
    "\n" +
    entries
      .map(
        ({ path, exports: names }, index) =>
          `import { ${names.map((value) => `${value} as export${index}_${value}`).join(", ")} } from "${path}";\n${names.map((value) => `const check${index}_${value}: Function = export${index}_${value};`).join("\n")}`
      )
      .join("\n");
  for (const extension of ["mts", "cts"])
    writeFileSync(join(consumer, `consumer.${extension}`), typeSource);
  run(
    resolve(consumer, "node_modules/.bin/tsc"),
    [
      "--noEmit",
      "--strict",
      "--skipLibCheck",
      "--module",
      "NodeNext",
      "--moduleResolution",
      "NodeNext",
      "--target",
      "ES2022",
      "consumer.mts",
      "consumer.cts",
    ],
    consumer
  );
  if (["react-18", "react-19-floor", "react-19"].includes(name)) {
    cpSync(
      join(repository, "scripts/compatibility/provider.test.mjs"),
      join(consumer, "provider.test.mjs")
    );
    run("node", ["--test", "provider.test.mjs"], consumer);
  }
  for (const adapter of ["react-router", "tanstack-router"]) {
    const peer = adapter === "react-router" ? "react-router-dom" : "@tanstack/react-router";
    if (dependencies[peer]) {
      cpSync(
        join(repository, "scripts/compatibility/navigation.test.mjs"),
        join(consumer, "navigation.test.mjs")
      );
      run("node", ["--conditions=development", "--test", "navigation.test.mjs"], consumer);
    }
  }
  const evaluated = Object.fromEntries(
    Object.keys(dependencies).map((dependency) => [
      dependency,
      JSON.parse(readFileSync(join(consumer, "node_modules", dependency, "package.json"), "utf8"))
        .version,
    ])
  );
  writeFileSync(
    join(consumer, "result.json"),
    JSON.stringify(
      { target: name, date: new Date().toISOString(), node: process.version, evaluated },
      null,
      2
    )
  );
}
console.log(`Compatibility results and isolated consumers: ${temporary}`);
