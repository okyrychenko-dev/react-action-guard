import storybook from "eslint-plugin-storybook";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";

export default [
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      react,
      "react-hooks": reactHooks,
      import: importPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      "import/no-duplicates": "error",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
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
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "*.config.*", "samples/**"],
  },
  {
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
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-deprecated": "off",
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
  prettier,
  ...storybook.configs["flat/recommended"],
  {
    rules: {
      curly: ["error", "all"],
    },
  },
];
