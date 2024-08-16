import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json-summary", "json"],
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
