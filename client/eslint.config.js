import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import ts from "typescript-eslint";
import js from "@eslint/js";

import svelteConfig from "./svelte.config.js";

export default defineConfig(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      "simple-import-sort": simpleImportSort
    },
    rules: {
      // typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
      // see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
      "no-undef": "off",
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // 1. External packages
            ["^\\w", "^@(?!app/)"],
            // 2. Svelte aliases ($app, $env, etc.)
            ["^\\$app", "^\\$env"],
            // 3. Shared packages
            ["^@app/shared"],
            // 4. Internal $lib/components
            ["^\\$lib/components"],
            // 5. Internal $lib/state
            ["^\\$lib/state"],
            // 6. Internal $lib/utils
            ["^\\$lib/utils"],
            // 7. Other $lib/ imports
            ["^\\$lib/"]
          ]
        }
      ],
      "simple-import-sort/exports": "error"
    }
  },
  {
    files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        extraFileExtensions: [".svelte"],
        parser: ts.parser,
        svelteConfig
      }
    }
  },
  [globalIgnores([".svelte-kit/"])]
);
