import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, symlinkSync } from "node:fs";
import { join } from "node:path";

// Apply the actual pending Changesets in a disposable workspace. Source manifests
// stay untouched; only this versioned cohort is packed and installed by consumers.
export function preparePackedCohort(repository, temporary) {
  const cohort = join(temporary, "cohort");
  mkdirSync(cohort, { recursive: true });
  for (const file of ["package.json", "pnpm-workspace.yaml", ".changeset"]) {
    cpSync(join(repository, file), join(cohort, file), { recursive: true });
  }
  const packages = [];
  for (const entry of readdirSync(join(repository, "packages"), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const source = join(repository, "packages", entry.name);
    if (!existsSync(join(source, "package.json"))) continue;
    const directory = join(cohort, "packages", entry.name);
    mkdirSync(directory, { recursive: true });
    for (const file of ["package.json", "README.md", "LICENSE", "CHANGELOG.md", "dist"]) {
      if (existsSync(join(source, file))) {
        cpSync(join(source, file), join(directory, file), { recursive: true });
      }
    }
    const manifest = JSON.parse(readFileSync(join(source, "package.json"), "utf8"));
    if (!manifest.private) packages.push({ directory, id: entry.name });
  }
  // Tooling only: tested consumers never link workspace packages or dependencies.
  symlinkSync(join(repository, "node_modules"), join(cohort, "node_modules"), "dir");
  execFileSync(
    process.execPath,
    [join(repository, "node_modules/@changesets/cli/bin.js"), "version"],
    {
      cwd: cohort,
      stdio: "inherit",
      timeout: 60_000,
    }
  );
  const workspacePackages = new Map(
    packages.map(({ directory }) => {
      const { name } = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"));
      return [name, directory];
    })
  );
  for (const { directory } of packages) {
    const manifest = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"));
    const dependencies = [
      ...Object.entries(manifest.dependencies ?? {}),
      ...Object.entries(manifest.devDependencies ?? {}),
      ...Object.entries(manifest.peerDependencies ?? {}),
    ];
    for (const [name, range] of dependencies) {
      if (!range.startsWith("workspace:")) continue;
      const target = workspacePackages.get(name);
      if (!target) throw new Error(`Missing versioned workspace dependency ${name}`);
      const link = join(directory, "node_modules", name);
      mkdirSync(join(link, ".."), { recursive: true });
      if (!existsSync(link)) symlinkSync(target, link, "dir");
    }
  }
  const tarballs = {};
  for (const { directory, id } of packages) {
    const manifest = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"));
    const tarball = join(temporary, `${id}.tgz`);
    execFileSync("pnpm", ["pack", "--out", tarball], {
      cwd: directory,
      stdio: "inherit",
      timeout: 60_000,
    });
    tarballs[id] = { name: manifest.name, version: manifest.version, directory, tarball };
  }
  return { cohort, tarballs };
}
