import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",

    // ❶  NO tsconfig here – Vitest finds it automatically
    coverage: {
      provider: "v8", // or 'istanbul'
      enabled: true,
      reporter: ["text", "lcov"],
      thresholds: { lines: 80 },
      exclude: ["src/main.tsx", "src/App.tsx", "src/types/colors.ts"],
    },
  },

  // // Optional extra semantic pass (runs `tsc --noEmit`)
  // typecheck: {
  //   checker: "tsc",
  //   tsconfig: "tsconfig.test.json", // ❷  still allowed here
  // },
});
