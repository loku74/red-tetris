import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
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
