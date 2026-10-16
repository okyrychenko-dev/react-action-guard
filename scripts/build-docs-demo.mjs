import { execFileSync } from "node:child_process";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const destination = join(root, "packages/docs/src/public/demo/coordination");
// The docs workspace depends on this example, so recursive builds finish Core first.
// Standalone docs commands require Core to be built, as documented in the README.
execFileSync("pnpm", ["--filter", "react-action-guard-core-example", "run", "build"], {
  cwd: root,
  stdio: "inherit",
});
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(join(root, "examples/core-coordination/dist"), destination, { recursive: true });
const manifest = JSON.parse(await readFile(join(root, "packages/core/package.json"), "utf8"));
const revision = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const differences = execFileSync("git", ["status", "--porcelain"], {
  cwd: root,
  encoding: "utf8",
}).trim();
await writeFile(
  join(destination, "provenance.json"),
  JSON.stringify(
    {
      distribution: "workspace source; not a registry release",
      coreManifestVersion: manifest.version,
      revision,
      workingTree: differences,
    },
    null,
    2
  ) + "\n"
);
console.log("Prepared shared coordination demo and source provenance for VitePress.");
