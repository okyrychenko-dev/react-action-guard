import { readFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";

// Empty release notes satisfy PR checks but must not suppress publication.
const statusPath = process.argv[2];
if (!statusPath) throw new Error("Pass the Changesets status JSON path.");
const { changesets } = JSON.parse(readFileSync(statusPath, "utf8"));

for (const { id, releases } of changesets) {
  if (releases.length !== 0) continue;
  if (!/^[\w-]+$/.test(id)) throw new Error(`Invalid changeset ID: ${id}`);
  unlinkSync(join(".changeset", `${id}.md`));
  console.log(`Consumed empty changeset: ${id}`);
}
