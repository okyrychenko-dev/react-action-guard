import { describe, expect, it } from "vitest";
import { resolveConfig } from "prettier";

import prettierConfig from "../prettier.config.mjs";
import coreEslintConfig from "../packages/core/eslint.config.mjs";
import coreTsupConfig from "../packages/core/tsup.config";
import coreVitestConfig from "../packages/core/vitest.config";
import devtoolsEslintConfig from "../packages/devtools/eslint.config.mjs";
import devtoolsTsupConfig from "../packages/devtools/tsup.config";
import devtoolsVitestConfig from "../packages/devtools/vitest.config";
import routerEslintConfig from "../packages/router/eslint.config.mjs";
import routerTsupConfig from "../packages/router/tsup.config";
import routerVitestConfig from "../packages/router/vitest.config";
import tanstackEslintConfig from "../packages/tanstack/eslint.config.mjs";
import tanstackTsupConfig from "../packages/tanstack/tsup.config";
import tanstackVitestConfig from "../packages/tanstack/vitest.config";
import uiEslintConfig from "../packages/ui/eslint.config.mjs";
import uiTsupConfig from "../packages/ui/tsup.config";
import uiVitestConfig from "../packages/ui/vitest.config";

const packageConfigs = [
  {
    name: "core",
    eslint: coreEslintConfig,
    tsup: coreTsupConfig,
    vitest: coreVitestConfig,
  },
  {
    name: "devtools",
    eslint: devtoolsEslintConfig,
    tsup: devtoolsTsupConfig,
    vitest: devtoolsVitestConfig,
  },
  {
    name: "router",
    eslint: routerEslintConfig,
    tsup: routerTsupConfig,
    vitest: routerVitestConfig,
  },
  {
    name: "tanstack",
    eslint: tanstackEslintConfig,
    tsup: tanstackTsupConfig,
    vitest: tanstackVitestConfig,
  },
  {
    name: "ui",
    eslint: uiEslintConfig,
    tsup: uiTsupConfig,
    vitest: uiVitestConfig,
  },
];

describe.each(packageConfigs)("$name configuration adapters", ({ eslint, tsup, vitest }) => {
  it("should load the ESLint adapter", () => {
    expect(eslint.length).toBeGreaterThan(0);
  });

  it("should load the tsup adapter", () => {
    expect(tsup.entry).toBeDefined();
  });

  it("should load the Vitest adapter", () => {
    expect(vitest.test?.environment).toBe("happy-dom");
    expect(vitest.test?.globals).toBe(true);
  });
});

describe("Prettier configuration", () => {
  it.each([
    "packages/core/src/index.ts",
    "packages/ui/src/index.ts",
    "examples/enterprise-demo/src/main.tsx",
  ])("should resolve the root policy for %s", async (filePath) => {
    await expect(resolveConfig(filePath)).resolves.toEqual(prettierConfig);
  });
});
