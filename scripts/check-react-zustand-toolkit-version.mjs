import { readFile } from "node:fs/promises";
import { parse } from "yaml";

const dependencyName = "@okyrychenko-dev/react-zustand-toolkit";
const expectedRange = "^1.0.0";
const packagePaths = ["packages/core/package.json", "packages/devtools/package.json"];

const workspaceConfig = await readFile("pnpm-workspace.yaml", "utf8");
const workspace = parse(workspaceConfig);
if (workspace?.overrides?.[dependencyName] !== undefined) {
  throw new Error(`${dependencyName} must not be pinned by a workspace override`);
}

for (const packagePath of packagePaths) {
  const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
  const actualRange = packageJson.dependencies?.[dependencyName];

  if (actualRange !== expectedRange) {
    throw new Error(
      `${packagePath} must depend on ${dependencyName} ${expectedRange}; found ${String(
        actualRange
      )}`
    );
  }
}

const lockfile = await readFile("pnpm-lock.yaml", "utf8");
if (lockfile.includes(`${dependencyName}@0.4.2`)) {
  throw new Error(`${dependencyName} 0.4.2 must not remain in pnpm-lock.yaml`);
}
