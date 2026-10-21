import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const repositoryUrl = "https://github.com/okyrychenko-dev/react-action-guard";

function updateCoreRequirement(directory, peerRange, coreVersion) {
  let publishedRange = peerRange.replace(/^workspace:/, "");
  if (publishedRange === "^") publishedRange = `^${coreVersion}`;

  const readmePath = join(directory, "README.md");
  const readme = readFileSync(readmePath, "utf8");
  const updated = readme.replace(
    /^(- \[@okyrychenko-dev\/react-action-guard\]\([^)]+\)[ \t]+)\S+/m,
    (_match, prefix) => prefix + publishedRange
  );
  if (updated !== readme) writeFileSync(readmePath, updated);
}

// Shared by the release command and disposable packed-cohort verification.
export function applyReleaseVersions(repository) {
  const packages = [];
  for (const entry of readdirSync(join(repository, "packages"))) {
    const directory = join(repository, "packages", entry);
    const manifestPath = join(directory, "package.json");
    if (!existsSync(manifestPath)) continue;
    const { name, version, private: isPrivate } = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (isPrivate) continue;
    const changelogPath = join(directory, "CHANGELOG.md");
    let previousComparison;
    if (existsSync(changelogPath)) {
      const changelog = readFileSync(changelogPath, "utf8");
      previousComparison = changelog.match(/^\[Unreleased\]: (.+)$/m)?.[1];
    }
    packages.push({ directory, name, version, manifestPath, changelogPath, previousComparison });
  }

  execFileSync(
    process.execPath,
    [join(repository, "node_modules/@changesets/cli/bin.js"), "version"],
    {
      cwd: repository,
      stdio: "inherit",
      timeout: 60_000,
    }
  );

  const { version: coreVersion } = JSON.parse(
    readFileSync(join(repository, "packages/core/package.json"), "utf8")
  );
  for (const {
    directory,
    name,
    version,
    manifestPath,
    changelogPath,
    previousComparison,
  } of packages) {
    const { version: releasedVersion, peerDependencies } = JSON.parse(
      readFileSync(manifestPath, "utf8")
    );
    const corePeer = peerDependencies?.["@okyrychenko-dev/react-action-guard"];
    if (corePeer) updateCoreRequirement(directory, corePeer, coreVersion);
    if (version === releasedVersion) continue;
    const tag = `${name}@${releasedVersion}`;
    let versionUrl = `${repositoryUrl}/releases/tag/${tag}`;
    // Legacy adapter repositories have no preceding tag in this monorepo.
    if (previousComparison?.startsWith(`${repositoryUrl}/compare/`)) {
      versionUrl = previousComparison.replace(/\.\.\.HEAD$/, `...${tag}`);
    }
    let changelog = readFileSync(changelogPath, "utf8");
    // changesets/action v1 locates release notes by the plain version heading.
    changelog = changelog.replace(
      `## ${releasedVersion}\n`,
      `## ${releasedVersion}\n\n[Release history](${versionUrl})\n`
    );
    const unreleasedUrl = `${repositoryUrl}/compare/${tag}...HEAD`;
    changelog = changelog.replace(/^\[Unreleased\]: .+$/m, `[Unreleased]: ${unreleasedUrl}`);
    if (!changelog.includes("[Unreleased]:")) changelog += `\n[Unreleased]: ${unreleasedUrl}\n`;
    changelog += `[${releasedVersion}]: ${versionUrl}\n`;
    writeFileSync(changelogPath, changelog);
  }
}
