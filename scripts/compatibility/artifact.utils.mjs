import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { isPlainObject, isRecordOf, isString } from "@okyrychenko-dev/type-utils";

// A canonical inventory covers both consumer tarballs and restorable package builds.
export function contentHashes(directory) {
  const files = {};
  function visit(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      const key = relative(directory, path).split("\\").join("/");
      assert.ok(!entry.isSymbolicLink(), `Unexpected artifact symlink: ${key}`);
      if (entry.isDirectory()) visit(path);
      else if (key !== "cohort.json") {
        files[key] = createHash("sha256").update(readFileSync(path)).digest("hex");
      }
    }
  }
  visit(directory);
  return Object.fromEntries(
    Object.entries(files).sort(([left], [right]) => left.localeCompare(right))
  );
}

export function writeCohortArtifact(directory, commit, packages) {
  const metadata = { schema: 1, commit, packages, files: contentHashes(directory) };
  writeFileSync(join(directory, "cohort.json"), JSON.stringify(metadata, null, 2) + "\n");
  return metadata;
}

export function readCohortArtifact(directory, commit, expectedPackages) {
  const metadata = JSON.parse(readFileSync(join(directory, "cohort.json"), "utf8"));
  assert.ok(isPlainObject(metadata) && metadata.schema === 1, "Invalid cohort schema");
  assert.equal(metadata.commit, commit, "Cohort source commit mismatch");
  const { packages, files } = metadata;
  assert.ok(isPlainObject(packages), "Invalid cohort packages");
  assert.ok(isRecordOf(files, isString), "Invalid cohort file hashes");
  assert.deepEqual(
    Object.keys(packages).sort(),
    Object.keys(expectedPackages).sort(),
    "Cohort package set mismatch"
  );
  const actual = contentHashes(directory);
  assert.deepEqual(
    Object.keys(actual),
    Object.keys(files).sort(),
    "Cohort files missing or unexpected"
  );
  for (const [file, hash] of Object.entries(actual))
    assert.equal(hash, files[file], `Cohort hash mismatch: ${file}`);
  const tarballs = {};
  for (const [id, name] of Object.entries(expectedPackages)) {
    const item = packages[id];
    assert.ok(isPlainObject(item) && isString(item.version), `Invalid package ${id}`);
    assert.equal(item.name, name, `Cohort package name mismatch: ${id}`);
    assert.equal(item.tarball, `${id}.tgz`, `Invalid package tarball: ${id}`);
    assert.ok(Object.hasOwn(files, item.tarball), `Missing package tarball: ${id}`);
    assert.ok(
      Object.keys(files).some((file) => file.startsWith(`builds/${id}/`)),
      `Missing package build: ${id}`
    );
    const tarball = join(directory, item.tarball);
    const packedManifest = JSON.parse(
      execFileSync("tar", ["-xOf", tarball, "package/package.json"], { encoding: "utf8" })
    );
    assert.equal(packedManifest.name, name, `Packed package name mismatch: ${id}`);
    assert.equal(packedManifest.version, item.version, `Packed package version mismatch: ${id}`);
    tarballs[id] = { ...item, tarball };
  }
  return { tarballs, metadata };
}
