import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { it } from "node:test";
import { applyReleaseVersions } from "./version.utils.mjs";

it("should synchronize Core requirements through release versioning and preserve repeated runs", () => {
  const repository = fileURLToPath(new URL("../../", import.meta.url));
  const fixture = mkdtempSync(join(tmpdir(), "action-guard-versioning-test-"));
  const coreName = "@okyrychenko-dev/react-action-guard";
  const dependents = ["devtools", "router", "tanstack", "ui"];
  const writeJson = (path, value) => writeFileSync(path, JSON.stringify(value, null, 2) + "\n");
  const readme = (range) =>
    `# Consumer\n\n- [${coreName}](https://www.npmjs.com/package/${coreName}) ${range} - Core dependency\n\nExample version: 2.0.0\n`;

  try {
    mkdirSync(join(fixture, ".changeset"));
    writeJson(join(fixture, "package.json"), { name: "release-fixture", private: true });
    writeFileSync(join(fixture, "pnpm-workspace.yaml"), 'packages:\n  - "packages/*"\n');
    const config = JSON.parse(readFileSync(join(repository, ".changeset/config.json"), "utf8"));
    writeJson(join(fixture, ".changeset/config.json"), { ...config, ignore: [] });
    writeFileSync(
      join(fixture, ".changeset/core-patch.md"),
      `---\n"${coreName}": patch\n---\n\nFix Core.\n`
    );
    symlinkSync(join(repository, "node_modules"), join(fixture, "node_modules"), "dir");

    for (const id of ["core", ...dependents]) {
      const directory = join(fixture, "packages", id);
      mkdirSync(directory, { recursive: true });
      let name = coreName;
      let peerDependencies = {};
      let devDependencies = {};
      if (id !== "core") {
        name += `-${id}`;
        let range = "^2.0.0";
        if (id === "ui") range = "workspace:^";
        peerDependencies = { [coreName]: range };
        devDependencies = { [coreName]: "workspace:*" };
      }
      writeJson(join(directory, "package.json"), {
        name,
        version: "2.0.0",
        peerDependencies,
        devDependencies,
      });
      writeFileSync(join(directory, "README.md"), readme("^2.0.0"));
      writeFileSync(join(directory, "CHANGELOG.md"), "# Changelog\n\n## 2.0.0\n\nInitial.\n");
    }

    applyReleaseVersions(fixture);
    assert.equal(
      JSON.parse(readFileSync(join(fixture, "packages/core/package.json"), "utf8")).version,
      "2.0.1"
    );
    for (const id of dependents) {
      const { peerDependencies } = JSON.parse(
        readFileSync(join(fixture, "packages", id, "package.json"), "utf8")
      );
      if (id === "ui") assert.equal(peerDependencies[coreName], "workspace:^");
      else assert.equal(peerDependencies[coreName], "^2.0.1");
      assert.equal(
        readFileSync(join(fixture, "packages", id, "README.md"), "utf8"),
        readme("^2.0.1"),
        `README requirement for ${id}`
      );
    }
    const snapshots = ["core", ...dependents].flatMap((id) =>
      ["package.json", "README.md", "CHANGELOG.md"].map((file) => {
        const path = join(fixture, "packages", id, file);
        return { path, contents: readFileSync(path, "utf8") };
      })
    );
    applyReleaseVersions(fixture);
    for (const { path, contents } of snapshots) assert.equal(readFileSync(path, "utf8"), contents);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
