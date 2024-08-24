import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "istanbul",
      include: ["**/*.tsx", "!**/*.stories.tsx", "!**/*.test.tsx"],
      reporter: ["text", "html", "json-summary", "json"],
      reportOnFailure: true,
    },
    browser: {
      enabled: true,
      headless: false,
      name: "chromium",
      provider: "playwright",
    },
  },
});
