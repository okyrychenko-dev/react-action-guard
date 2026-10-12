import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { applyReleaseVersions } from "./release/version.utils.mjs";

const repository = fileURLToPath(new URL("../", import.meta.url));
applyReleaseVersions(repository);
// Changesets stages these generated references in its version PR together with
// the updated manifests, so API headings describe the actual release versions.
const documentation = join(repository, "packages/docs");
for (const packageId of ["core", "devtools", "tanstack"]) {
  execFileSync(
    process.execPath,
    [
      join(documentation, "node_modules/typedoc/bin/typedoc"),
      "--options",
      `src/typedoc.${packageId}.json`,
    ],
    {
      cwd: documentation,
      stdio: "inherit",
      timeout: 120_000,
    }
  );
}
