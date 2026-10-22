import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const documents = ["RELEASE-HANDOFF.md", "packages/docs/src/versions.md"];
const start = "<!-- release-source-state:start -->";
const end = "<!-- release-source-state:end -->";

export function syncReleaseState(repository, { check = false } = {}) {
  // Disposable packing workspaces contain packages only, without the site/handoff.
  if (documents.every((file) => !existsSync(join(repository, file)))) return;
  const rows = [];
  for (const [id, label] of [
    ["core", "Core"],
    ["ui", "UI"],
    ["devtools", "Devtools"],
    ["tanstack", "Query adapter"],
    ["router", "Router adapter"],
  ]) {
    const { version } = JSON.parse(
      readFileSync(join(repository, "packages", id, "package.json"), "utf8")
    );
    rows.push(`| ${label} | ${version} |`);
  }
  const pending = readdirSync(join(repository, ".changeset")).filter((file) => {
    if (!file.endsWith(".md") || file === "README.md") return false;
    const content = readFileSync(join(repository, ".changeset", file), "utf8");
    return /^.+:\s*(patch|minor|major)\s*$/m.test(content.split(/^---\s*$/m)[1] ?? "");
  });
  let status = "No pending package Changesets remain; source versions have been applied.";
  if (pending.length)
    status = `${pending.length} pending package Changesets remain; the next versioning run may change these versions.`;
  const block = [
    start,
    "",
    "## Source release state",
    "",
    "Generated from workspace manifests and remaining Changesets. These are source versions,",
    "not evidence of npm publication. Dated registry evidence remains historical.",
    "",
    "| Package | Source manifest version |",
    "| --- | --- |",
    ...rows,
    "",
    status,
    "",
    end,
  ].join("\n");
  for (const file of documents) {
    const path = join(repository, file);
    const content = readFileSync(path, "utf8");
    const from = content.indexOf(start);
    const to = content.indexOf(end);
    if (from < 0 || to < from) throw new Error(`Missing release source state markers in ${file}`);
    const updated = content.slice(0, from) + block + content.slice(to + end.length);
    if (check && updated !== content)
      throw new Error(
        `Stale source release state in ${file}; run node scripts/check-release-state.mjs --write`
      );
    if (!check && updated !== content) writeFileSync(path, updated);
  }
}
