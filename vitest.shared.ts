import { defineConfig } from "vitest/config";

export const sharedVitestConfig = defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
      exclude: [
        "**/dist/**",
        "**/node_modules/**",
        "**/*.config.*",
        "**/vite-env.d.ts",
        "**/test/**"
      ]
    },
    environment: "node",
    globals: false,
    setupFiles: ["src/test/setup.ts"]
  }
});
