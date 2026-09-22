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
      },
    },
    {
      files: ["src/hooks/useBlockingQueries.ts"],
      rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
      },
    },
    {
      rules: {
        "react-hooks/exhaustive-deps": ["warn", { additionalHooks: "(useBlockingManager)" }],
      },
    },
  ],
});
