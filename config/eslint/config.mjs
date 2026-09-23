import eslint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const commonRules = {
  ...reactHooks.configs.recommended.rules,
  "import/no-duplicates": "error",
  "import/order": [
    "error",
    {
      groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type"],
      "newlines-between": "never",
      alphabetize: {
        order: "asc",
        caseInsensitive: true,
        orderImportKind: "asc",
      },
      sortTypesGroup: true,
    },
  ],
  "sort-imports": [
    "error",
    {
      ignoreDeclarationSort: true,
      ignoreMemberSort: false,
      allowSeparatedGroups: true,
    },
  ],
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/explicit-function-return-type": [
    "error",
    {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true,
    },
  ],
  "@typescript-eslint/explicit-module-boundary-types": "error",
  "@typescript-eslint/no-unused-vars": [
    "error",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
    },
  ],
  "@typescript-eslint/prefer-readonly": "error",
  "@typescript-eslint/no-non-null-assertion": "error",
  "@typescript-eslint/array-type": [
    "error",
    {
      default: "generic",
      readonly: "generic",
    },
  ],
  "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
  "react/jsx-curly-brace-presence": [
    "error",
    {
      props: "never",
      children: "never",
      propElementValues: "never",
    },
  ],
  "react-hooks/rules-of-hooks": "error",
  "react-hooks/exhaustive-deps": "warn",
  "no-console": ["warn", { allow: ["warn", "error"] }],
  "prefer-const": "error",
  "no-var": "error",
  eqeqeq: ["error", "always"],
};

const commonTestConfig = {
  files: [
    "**/__tests__/**/*.ts",
    "**/__tests__/**/*.tsx",
    "**/*.test.ts",
    "**/*.test.tsx",
    "src/test/**",
  ],
  rules: {
    "@typescript-eslint/no-confusing-void-expression": "off",
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-invalid-void-type": "off",
  },
};

export function createEslintConfig({ parserOptions, extensions = [] }) {
  return [
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
      languageOptions: {
        parserOptions,
      },
    },
    {
      plugins: {
        "@stylistic": stylistic,
        react,
        "react-hooks": reactHooks,
        import: importPlugin,
      },
      rules: commonRules,
    },
    {
      ignores: ["dist/**", "node_modules/**", "*.config.*", "samples/**"],
    },
    commonTestConfig,
    {
      files: ["src/middleware/**/*.ts", "src/store/**/*.ts"],
      rules: {
        "no-console": "off",
      },
    },
    ...extensions,
    prettier,
    {
      rules: {
        "@stylistic/padding-line-between-statements": [
          "error",
          {
            blankLine: "always",
            prev: ["const", "let", "var"],
            next: "*",
          },
          {
            blankLine: "any",
            prev: ["const", "let", "var"],
            next: ["const", "let", "var"],
          },
          {
            blankLine: "always",
            prev: "*",
            next: "return",
          },
        ],
        "@stylistic/padded-blocks": ["error", "never"],
        curly: ["error", "all"],
      },
    },
  ];
}
