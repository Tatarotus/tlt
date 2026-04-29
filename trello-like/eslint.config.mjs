import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Add complexity and code quality rules
  {
    plugins: {
      import: importPlugin
    },
    rules: {
      // Complexity rules (increased limits for real-world code)
      "complexity": ["warn", 20],
      "max-depth": ["warn", 6],
      "max-statements": ["warn", 40],
      "max-lines-per-function": ["warn", 300],
      // Code quality rules
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }],
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }],
      "no-unused-expressions": "error",
      "no-duplicate-imports": "error",
      // Disabled because it makes local linting hang on this Next/TS graph.
      "import/no-cycle": "off",
      "import/no-restricted-paths": [
        "error",
        {
          "zones": [
            {
              "target": "./db/schema.ts",
              "from": "./app/actions",
              "message": "Models (schema) MUST NOT import controllers (actions)."
            },
            {
              "target": "./db/schema.ts",
              "from": "./app/components",
              "message": "Models (schema) MUST NOT import UI components."
            },
            {
              "target": "./app/components",
              "from": "./db/index.ts",
              "message": "UI components SHOULD NOT import database connection directly. Use server actions or data access layer."
            }
          ]
        }
      ],
      // Style rules
      "max-lines": ["error", { "max": 500, "skipBlankLines": true, "skipComments": true }]
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "reports/**",
    ".stryker-tmp/**",
  ]),
]);

export default eslintConfig;
