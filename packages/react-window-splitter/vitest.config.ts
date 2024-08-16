import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "istanbul",
      include: ["**/*.tsx", "!**/*.stories.tsx", "!**/*.test.tsx"],
      reporter: ["text", "json-summary", "json"],
      reportOnFailure: true,
    },
    browser: {
      enabled: true,
      name: "chromium",
      provider: "playwright",
      // https://playwright.dev
      providerOptions: {},
    },
  },
});
