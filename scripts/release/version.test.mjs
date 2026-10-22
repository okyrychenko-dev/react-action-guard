import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { syncReleaseState } from "./state.utils.mjs";
import { applyReleaseVersions } from "./version.utils.mjs";

const repository = fileURLToPath(new URL("../../", import.meta.url));
const ids = ["core", "devtools", "router", "tanstack", "ui"];
const core = "@okyrychenko-dev/react-action-guard";

function fixture(run) {
  const root = mkdtempSync(join(tmpdir(), "release-version-"));
  try {
    for (const file of [
      "package.json",
      "pnpm-workspace.yaml",
      "RELEASE-HANDOFF.md",
      "packages/docs/src/versions.md",
      "packages/docs/package.json",
      ".changeset/config.json",
    ]) {
      mkdirSync(join(root, file, ".."), { recursive: true });
      cpSync(join(repository, file), join(root, file));
    }
    symlinkSync(join(repository, "node_modules"), join(root, "node_modules"), "dir");
    for (const id of ids) {
      mkdirSync(join(root, "packages", id), { recursive: true });
      for (const file of ["package.json", "CHANGELOG.md"]) {
        cpSync(join(repository, "packages", id, file), join(root, "packages", id, file));
      }
    }
    // Keep the regression scenario stable after the generated version PR lands.
    for (const id of ids) {
      const value = manifest(root, id);
      value.version = "1.0.0";
      if (id === "core") value.version = "2.0.0";
      if (id === "tanstack") value.version = "0.4.0";
      writeFileSync(join(root, "packages", id, "package.json"), JSON.stringify(value));
    }
    run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function manifest(root, id) {
  return JSON.parse(readFileSync(join(root, "packages", id, "package.json"), "utf8"));
}

function changeset(root, type) {
  const releases = ids.map((id) => {
    const { name } = manifest(root, id);
    const bump = id === "core" ? type : "patch";
    return `"${name}": ${bump}`;
  });
  writeFileSync(
    join(root, ".changeset/regression.md"),
    `---\n${releases.join("\n")}\n---\n\nRelease regression fixture.\n`
  );
}

test("should preserve adapter patches and Core peer floors for a compatible Core minor", () => {
  fixture((root) => {
    changeset(root, "minor");
    syncReleaseState(root);
    syncReleaseState(root, { check: true });
    const documents = ["RELEASE-HANDOFF.md", "packages/docs/src/versions.md"];
    const originals = documents.map((file) => readFileSync(join(root, file), "utf8"));
    applyReleaseVersions(root);
    syncReleaseState(root, { check: true });
    for (const [index, file] of documents.entries()) {
      const outsideState = (content) =>
        content.replace(
          /<!-- release-source-state:start -->[\s\S]*?<!-- release-source-state:end -->/,
          ""
        );
      assert.equal(
        outsideState(readFileSync(join(root, file), "utf8")),
        outsideState(originals[index])
      );
    }
    for (const id of ids) {
      const actual = manifest(root, id);
      let expected = "1.0.1";
      if (id === "core") expected = "2.1.0";
      if (id === "tanstack") expected = "0.4.1";
      assert.equal(actual.version, expected, id);
      if (id !== "core") {
        const scope = join(root, "packages", id, "node_modules/@okyrychenko-dev");
        mkdirSync(scope, { recursive: true });
        symlinkSync(join(root, "packages/core"), join(scope, "react-action-guard"), "dir");
        assert.equal(actual.peerDependencies[core], "^2.0.0", id);
        const tarball = join(root, `${id}.tgz`);
        execFileSync("pnpm", ["pack", "--out", tarball], {
          cwd: join(root, "packages", id),
          stdio: "inherit",
        });
        const packed = JSON.parse(
          execFileSync("tar", ["-xOf", tarball, "package/package.json"], { encoding: "utf8" })
        );
        assert.equal(packed.peerDependencies[core], "^2.0.0", id);
      }
    }
    for (const file of ["RELEASE-HANDOFF.md", "packages/docs/src/versions.md"]) {
      const content = readFileSync(join(root, file), "utf8");
      assert.match(content, /\| Core \| 2\.1\.0 \|/);
      assert.match(content, /No pending package Changesets remain/);
      assert.match(content, /2026-10-21/);
      assert.doesNotMatch(
        content,
        /Pending Changesets have not yet been applied|The version PR will apply/
      );
    }
    const before = readFileSync(join(root, "RELEASE-HANDOFF.md"), "utf8");
    applyReleaseVersions(root);
    assert.equal(readFileSync(join(root, "RELEASE-HANDOFF.md"), "utf8"), before);
  });
});

test("should raise adapter majors and peer floors for an incompatible Core major", () => {
  fixture((root) => {
    changeset(root, "major");
    applyReleaseVersions(root);
    assert.equal(manifest(root, "core").version, "3.0.0");
    for (const id of ids.filter((id) => id !== "core")) {
      const actual = manifest(root, id);
      let expected = "2.0.0";
      if (id === "tanstack") expected = "1.0.0";
      assert.equal(actual.version, expected, id);
      assert.equal(actual.peerDependencies[core], "^3.0.0", id);
    }
  });
});

test("should reject stale versions or pending Changesets in source documentation", () => {
  fixture((root) => {
    syncReleaseState(root);
    syncReleaseState(root, { check: true });
    changeset(root, "minor");
    assert.throws(() => syncReleaseState(root, { check: true }), /Stale source release state/);
    syncReleaseState(root);
    const value = manifest(root, "core");
    value.version = "2.1.0";
    writeFileSync(join(root, "packages/core/package.json"), JSON.stringify(value));
    assert.throws(() => syncReleaseState(root, { check: true }), /Stale source release state/);
    syncReleaseState(root);
    syncReleaseState(root, { check: true });
  });
});
