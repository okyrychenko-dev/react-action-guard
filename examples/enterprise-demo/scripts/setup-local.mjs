import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const demoRoot = fileURLToPath(new URL("..", import.meta.url));
const sourceRoot = resolve(process.argv[2] ?? resolve(demoRoot, "../.."));
const artifactRoot = resolve(demoRoot, ".cache/local-packages");
const packages = ["core", "router", "tanstack", "ui"];

function run(command, args, cwd) {
  return execFileSync(command, args, { cwd, encoding: "utf8" });
}

mkdirSync(artifactRoot, { recursive: true });
// Build the dependency first, then the adapters against its declarations.
for (const name of packages) {
  process.stdout.write(run("pnpm", ["--filter", `./packages/${name}`, "run", "build"], sourceRoot));
}
const { preparePackedCohort } = await import(
  pathToFileURL(resolve(sourceRoot, "scripts/compatibility/cohort.utils.mjs"))
);
const { tarballs } = preparePackedCohort(sourceRoot, mkdtempSync(resolve(artifactRoot, "cohort-")));
const artifacts = packages.map((id) => {
  const { name, version, tarball: path } = tarballs[id];
  return {
    name,
    version,
    path,
    sha256: createHash("sha256").update(readFileSync(path)).digest("hex"),
  };
});
// Install copies, not links, so the browser and tests use one React and one core instance.
process.stdout.write(
  run(
    "npm",
    [
      "install",
      "--strict-peer-deps",
      "--no-save",
      "--package-lock=false",
      ...artifacts.map(({ path }) => path),
    ],
    demoRoot
  )
);
const evidence = {
  sourceCommit: run("git", ["rev-parse", "HEAD"], sourceRoot).trim(),
  sourceDirty:
    run("git", ["status", "--porcelain", "--untracked-files=no"], sourceRoot).trim().length > 0,
  evaluatedAt: new Date().toISOString(),
  artifacts,
};
writeFileSync(resolve(artifactRoot, "evidence.json"), JSON.stringify(evidence, null, 2) + "\n");
console.log(
  `Evaluated local package artifacts from ${evidence.sourceCommit}. Evidence: .cache/local-packages/evidence.json`
);
