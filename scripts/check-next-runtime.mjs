import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { preparePackedCohort } from "./compatibility/cohort.utils.mjs";

const repository = fileURLToPath(new URL("../", import.meta.url));
const temporary = mkdtempSync(join(tmpdir(), "action-guard-next-runtime-"));
console.log(`Next runtime consumer and evidence: ${temporary}`);
const { tarballs } = preparePackedCohort(repository, temporary);
const consumer = join(temporary, "consumer");
mkdirSync(consumer);
cpSync(join(repository, "scripts/next-runtime/fixture"), consumer, { recursive: true });
const fixtureHash = createHash("sha256");
for (const path of readdirSync(consumer, { recursive: true }).sort()) {
  // Hash the copied fixture before installation or Next modifies generated config.
  if (!/\.(tsx|mjs|json)$/.test(path)) continue;
  fixtureHash.update(path).update(readFileSync(join(consumer, path)));
}
const dependencies = {
  next: "15.5.23",
  react: "19.2.8",
  "react-dom": "19.2.8",
  zustand: "5.0.0",
  "@okyrychenko-dev/react-zustand-toolkit": "1.0.0",
  "@okyrychenko-dev/type-utils": "0.1.2",
  "@types/react": "19.2.18",
  "@types/react-dom": "19.2.7",
  "@types/node": "22.20.0",
  typescript: "5.6.3",
  "@playwright/test": "1.63.0",
};
for (const id of ["core", "router"])
  dependencies[tarballs[id].name] = `file:${tarballs[id].tarball}`;
writeFileSync(
  join(consumer, "package.json"),
  JSON.stringify({ private: true, type: "module", dependencies }, null, 2)
);
function run(command, args) {
  execFileSync(command, args, {
    cwd: consumer,
    stdio: "inherit",
    timeout: 240000,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
}
run("npm", ["install", "--strict-peer-deps", "--ignore-scripts", "--no-audit", "--no-fund"]);
run(process.execPath, ["node_modules/next/dist/bin/next", "build"]);
run(process.execPath, ["node_modules/typescript/bin/tsc", "--noEmit"]);
run(process.execPath, ["node_modules/@playwright/test/cli.js", "test"]);
const results = JSON.parse(readFileSync(join(consumer, "browser-results.json"), "utf8"));
assert.equal(results.stats.unexpected, 0);
assert.equal(results.stats.skipped, 0);
assert.ok(results.stats.expected > 0, "Browser suite must execute tests");
const scenarios = results.suites.flatMap(({ file, specs }) =>
  specs.map(({ title, ok, tests }) => ({
    file,
    title,
    passed: ok,
    browserVersion: tests[0].annotations.find(({ type }) => type === "browser-version")
      ?.description,
  }))
);
for (const file of ["pages.pw.mjs", "app.pw.mjs", "unload.pw.mjs"]) {
  assert.ok(
    scenarios.some((scenario) => scenario.file === file),
    `Missing ${file} evidence`
  );
}
for (const scenario of scenarios) {
  assert.equal(scenario.passed, true);
  assert.ok(scenario.browserVersion, "Browser version must be recorded");
}
const evaluated = Object.fromEntries(
  Object.keys(dependencies).map((name) => [
    name,
    JSON.parse(readFileSync(join(consumer, "node_modules", name, "package.json"), "utf8")).version,
  ])
);
const packages = ["core", "router"].map((id) => {
  const { name, version, tarball } = tarballs[id];
  return {
    name,
    version,
    sha256: createHash("sha256").update(readFileSync(tarball)).digest("hex"),
  };
});
const evidence = {
  sourceBase: execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repository,
    encoding: "utf8",
  }).trim(),
  packageSourceDiffSha256: createHash("sha256")
    .update(
      execFileSync(
        "git",
        ["diff", "HEAD", "--", "packages/core", "packages/router", ".changeset", "pnpm-lock.yaml"],
        { cwd: repository }
      )
    )
    .digest("hex"),
  date: new Date().toISOString(),
  node: process.version,
  strictPeers: true,
  evaluated,
  packages,
  build: "next build and tsc --noEmit passed",
  server: "next start (production)",
  fixtureSha256: fixtureHash.digest("hex"),
  browser: { channel: "chrome", version: scenarios[0].browserVersion },
  scenarios,
  results: results.stats,
  scope:
    "Selected Next peer only; Pages and App cases recorded independently in browser-results.json. Planned Changesets cohort, no registry publication.",
};
writeFileSync(join(temporary, "result.json"), JSON.stringify(evidence, null, 2));
console.log(`Successful Next runtime evidence: ${temporary}/result.json`);
