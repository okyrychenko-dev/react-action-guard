import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { assertReleaseContext } from "./gate.utils.mjs";
import { restorePackageBuilds, sourceCommit } from "../compatibility/cohort.utils.mjs";
import { contentHashes } from "../compatibility/artifact.utils.mjs";

const repository = process.cwd();
assertReleaseContext({
  event: process.env.GITHUB_EVENT_NAME,
  ref: process.env.GITHUB_REF,
  commit: sourceCommit(repository),
  verifiedCommit: process.env.VERIFIED_COMMIT,
});
assert.equal(process.env.GITHUB_SHA, process.env.VERIFIED_COMMIT, "Workflow commit mismatch");
assert.ok(process.env.ACTION_GUARD_COHORT, "Verified publication requires a cohort");
const { tarballs } = restorePackageBuilds(repository, resolve(process.env.ACTION_GUARD_COHORT));
const temporary = mkdtempSync(join(tmpdir(), "action-guard-publish-inputs-"));
function run(command, args, cwd = repository) {
  return execFileSync(command, args, { cwd, stdio: "inherit", timeout: 240_000 });
}
for (const [id, { name, version, tarball }] of Object.entries(tarballs)) {
  const directory = join(repository, "packages", id);
  const source = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"));
  assert.equal(source.name, name);
  assert.equal(
    source.version,
    version,
    "Pending candidate versions cannot be published from unversioned source"
  );
  const packed = join(temporary, `${id}.tgz`);
  run("pnpm", ["pack", "--out", packed], directory);
  const expected = join(temporary, `${id}-expected`);
  const actual = join(temporary, `${id}-actual`);
  mkdirSync(expected);
  mkdirSync(actual);
  run("tar", ["-xzf", tarball, "-C", expected]);
  run("tar", ["-xzf", packed, "-C", actual]);
  assert.deepEqual(
    contentHashes(actual),
    contentHashes(expected),
    `Publication inputs differ from verified ${name}`
  );
}
console.log(`Publication inputs match the verified cohort: ${temporary}`);
if (!process.argv.includes("--dry-run")) {
  run("pnpm", ["exec", "changeset", "publish"]);
  // A successful retry may publish nothing. Reconcile all current versions and tags,
  // including versions published before an earlier run failed to push their tags.
  for (const { name, version } of Object.values(tarballs)) {
    const published = execFileSync("npm", ["view", `${name}@${version}`, "version", "--json"], {
      encoding: "utf8",
      timeout: 60_000,
    }).trim();
    assert.equal(JSON.parse(published), version, `Registry version missing: ${name}@${version}`);
  }
  run("pnpm", ["exec", "changeset", "tag"]);
  for (const { name, version } of Object.values(tarballs)) {
    run("git", ["push", "origin", `refs/tags/${name}@${version}`]);
  }
}
