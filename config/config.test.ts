import { execFileSync } from "node:child_process";

import stylistic from "@stylistic/eslint-plugin";
import { Linter } from "eslint";

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

const typescriptConfigs = [
  "packages/core/tsconfig.json",
  "packages/core/tsconfig.test.json",
  "packages/devtools/tsconfig.json",
  "packages/devtools/tsconfig.test.json",
  "packages/devtools/tsconfig.typecheck.json",
  "packages/docs/tsconfig.typedoc.json",
  "packages/router/tsconfig.json",
  "packages/router/tsconfig.test.json",
  "packages/router/tsconfig.typecheck.json",
  "packages/tanstack/tsconfig.json",
  "packages/tanstack/tsconfig.test.json",
  "packages/tanstack/tsconfig.typecheck.json",
  "packages/ui/tsconfig.json",
  "packages/ui/tsconfig.typecheck.json",
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

describe("shared ESLint declaration spacing", () => {
  const linter = new Linter();
  const spacingConfig = coreEslintConfig.find((entry) =>
    Object.hasOwn(entry.rules ?? {}, "@stylistic/padding-line-between-statements")
  );
  const rule = spacingConfig?.rules?.["@stylistic/padding-line-between-statements"];

  function lint(code: string): Array<string> {
    return linter
      .verify(code, [
        {
          plugins: { "@stylistic": stylistic },
          rules: { "@stylistic/padding-line-between-statements": rule },
        },
      ])
      .map(({ message }) => message);
  }

  it("should separate a declaration group from preceding executable code", () => {
    expect(lint("run();\nconst result = 1;\nlet next = 2;\n")).toContain(
      "Expected blank line before this statement."
    );
  });

  it("should keep adjacent declarations in one group", () => {
    expect(lint("const first = 1;\nlet second = 2;\n")).toEqual([]);
  });

  it("should keep imports next to the first declaration", () => {
    expect(lint('import value from "value";\nconst result = value;\n')).toEqual([]);
  });
});

describe("TypeScript configuration adapters", () => {
  it.each(typescriptConfigs)("should load %s", (configPath) => {
    expect(() => {
      execFileSync("pnpm", ["exec", "tsc", "--showConfig", "--project", configPath], {
        stdio: "pipe",
      });
    }).not.toThrow();
  });
});
