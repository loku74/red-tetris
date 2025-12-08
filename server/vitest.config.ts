import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["src/**/*.ts", "app.ts"],
      thresholds: {
        functions: 70,
        statements: 70,
        lines: 70,
        branches: 50
      }
    }
  }
});
