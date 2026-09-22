import storybook from "eslint-plugin-storybook";

import { createEslintConfig } from "../../config/eslint/config.mjs";

export default createEslintConfig({
  parserOptions: {
    projectService: true,
    tsconfigRootDir: import.meta.dirname,
  },
  extensions: [...storybook.configs["flat/recommended"]],
});
