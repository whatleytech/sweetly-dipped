import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      enabled: true,
      reporter: ["text", "lcov"],
      thresholds: { lines: 0 },
    },
  },
});
