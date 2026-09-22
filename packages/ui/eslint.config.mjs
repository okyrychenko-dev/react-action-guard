import { createEslintConfig } from "../../config/eslint/config.mjs";

export default createEslintConfig({
  parserOptions: {
    project: "./tsconfig.typecheck.json",
    tsconfigRootDir: import.meta.dirname,
  },
});
