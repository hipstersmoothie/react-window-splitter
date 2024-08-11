import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      provider: "istanbul",
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
