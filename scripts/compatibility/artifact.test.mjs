import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { writeCohortArtifact, readCohortArtifact } from "./artifact.utils.mjs";

test("should reuse a cohort after transport and reject stale, incomplete and corrupt inputs", () => {
  const root = mkdtempSync(join(tmpdir(), "cohort-contract-"));
  try {
    const artifact = join(root, "artifact");
    mkdirSync(join(artifact, "builds/core"), { recursive: true });
    writeFileSync(join(artifact, "builds/core/index.js"), "export const value = 42;");
    const packed = join(root, "package");
    mkdirSync(packed);
    writeFileSync(
      join(packed, "package.json"),
      JSON.stringify({ name: "@example/core", version: "1.2.3" })
    );
    execFileSync("tar", ["-czf", join(artifact, "core.tgz"), "-C", root, "package"]);
    const packages = { core: { name: "@example/core", version: "1.2.3", tarball: "core.tgz" } };
    writeCohortArtifact(artifact, "commit-a", packages);
    const downloaded = join(root, "downloaded");
    cpSync(artifact, downloaded, { recursive: true });
    const result = readCohortArtifact(downloaded, "commit-a", { core: "@example/core" });
    assert.equal(result.tarballs.core.version, "1.2.3");
    assert.equal(result.tarballs.core.tarball, join(downloaded, "core.tgz"));
    assert.throws(
      () => readCohortArtifact(downloaded, "commit-b", { core: "@example/core" }),
      /commit/
    );
    assert.throws(
      () => readCohortArtifact(downloaded, "commit-a", { ui: "@example/ui" }),
      /package/
    );
    writeFileSync(join(downloaded, "core.tgz"), "tampered");
    assert.throws(
      () => readCohortArtifact(downloaded, "commit-a", { core: "@example/core" }),
      /hash/
    );
    cpSync(artifact, downloaded, { recursive: true });
    writeCohortArtifact(downloaded, "commit-a", { core: { ...packages.core, version: "9.9.9" } });
    assert.throws(
      () => readCohortArtifact(downloaded, "commit-a", { core: "@example/core" }),
      /version mismatch/
    );
    cpSync(artifact, downloaded, { recursive: true });
    rmSync(join(downloaded, "builds/core/index.js"));
    assert.throws(
      () => readCohortArtifact(downloaded, "commit-a", { core: "@example/core" }),
      /files/
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
