import storybook from "eslint-plugin-storybook";

import { createEslintConfig } from "../../config/eslint/config.mjs";

export default createEslintConfig({
  parserOptions: {
    project: "./tsconfig.typecheck.json",
    tsconfigRootDir: import.meta.dirname,
  },
  extensions: [
    {
      files: [
        "**/__tests__/**/*.ts",
        "**/__tests__/**/*.tsx",
        "**/*.test.ts",
        "**/*.test.tsx",
        "src/test/**",
      ],
      rules: {
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-unnecessary-condition": "off",
        "@typescript-eslint/no-deprecated": "off",
        "@typescript-eslint/unbound-method": "off",
        "import/order": "off",
        "sort-imports": "off",
      },
    },
    {
      files: ["**/*.stories.tsx", "src/storybook/**/*.tsx"],
      rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-confusing-void-expression": "off",
        "@typescript-eslint/restrict-template-expressions": "off",
        "@typescript-eslint/no-unnecessary-condition": "off",
        "@typescript-eslint/array-type": "off",
        "@typescript-eslint/consistent-type-definitions": "off",
        "no-console": "off",
        "import/order": "off",
        "sort-imports": "off",
      },
    },
    ...storybook.configs["flat/recommended"],
  ],
});
