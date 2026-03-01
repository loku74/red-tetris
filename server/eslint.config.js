import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strict,
  prettier,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": ["error", {
        groups: [
          // 1. External packages
          ["^\\w", "^@(?!app/)"],
          // 2. Shared package
          ["^@app/shared"],
          // 3. Internal aliases (@app/constants, @app/core, etc.)
          ["^@app/"],
        ],
      }],
      "simple-import-sort/exports": "error",
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  globalIgnores(
    ["dist/**", "node_modules/**", "coverage/**"]
  )
);
