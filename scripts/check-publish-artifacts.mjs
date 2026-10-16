import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Release builds run in workspace dependency order before concurrent publication.
// Lifecycle hooks validate those artifacts without deleting another package's output.
const directory = process.cwd();
const { name, exports: entrypoints } = JSON.parse(
  readFileSync(resolve(directory, "package.json"), "utf8")
);

function checkEntrypoints(value) {
  if (typeof value === "string") {
    if (!existsSync(resolve(directory, value))) {
      throw new Error(
        `${name}: missing ${value}. Run pnpm run build from the repository root before publishing.`
      );
    }
    return;
  }
  if (value && typeof value === "object") {
    for (const entrypoint of Object.values(value)) checkEntrypoints(entrypoint);
  }
}

if (!entrypoints) throw new Error(`${name}: no package exports to validate.`);
checkEntrypoints(entrypoints);
