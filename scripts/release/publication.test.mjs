import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { writeCohortArtifact } from "../compatibility/artifact.utils.mjs";

const publisher = fileURLToPath(new URL("./publish-verified.mjs", import.meta.url));

test("should compare real publication inputs without publishing and reject changed source", () => {
  const root = mkdtempSync(join(tmpdir(), "publication-contract-"));
  try {
    const source = join(root, "source");
    const artifact = join(root, "artifact");
    const directory = join(source, "packages/core");
    mkdirSync(join(directory, "dist"), { recursive: true });
    mkdirSync(artifact);
    writeFileSync(join(source, "package.json"), JSON.stringify({ private: true }));
    writeFileSync(
      join(directory, "package.json"),
      JSON.stringify({
        name: "cohort-test-package",
        version: "1.2.3",
        files: ["dist", "README.md"],
      })
    );
    writeFileSync(join(directory, "README.md"), "Verified documentation\n");
    writeFileSync(join(directory, "dist/index.js"), "export const value = 42;\n");
    function git(args) {
      return execFileSync("git", args, {
        cwd: source,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim();
    }
    git(["init", "-b", "main"]);
    git(["add", "."]);
    git([
      "-c",
      "user.name=Cohort Test",
      "-c",
      "user.email=cohort@example.invalid",
      "-c",
      "core.hooksPath=/dev/null",
      "commit",
      "-m",
      "Publication fixture",
    ]);
    const commit = git(["rev-parse", "HEAD"]);
    execFileSync("pnpm", ["pack", "--out", join(artifact, "core.tgz")], {
      cwd: directory,
      stdio: "pipe",
    });
    cpSync(join(directory, "dist"), join(artifact, "builds/core"), { recursive: true });
    writeCohortArtifact(artifact, commit, {
      core: { name: "cohort-test-package", version: "1.2.3", tarball: "core.tgz" },
    });
    const env = {
      ...process.env,
      ACTION_GUARD_COHORT: artifact,
      VERIFIED_COMMIT: commit,
      GITHUB_SHA: commit,
      GITHUB_REF: "refs/heads/main",
      GITHUB_EVENT_NAME: "push",
    };
    function dryRun() {
      return execFileSync(process.execPath, [publisher, "--dry-run"], {
        cwd: source,
        env,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    }
    assert.match(dryRun(), /Publication inputs match/);
    writeFileSync(join(directory, "README.md"), "Unverified documentation\n");
    assert.throws(dryRun, /Publication inputs differ/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
