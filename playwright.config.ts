import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  workers: 2,
  reporter: "list",
  use: { browserName: "chromium", trace: "retain-on-failure" },
  webServer: [
    {
      command: "node tests/browser/server/launch.mjs off",
      timeout: 120_000,
      url: "http://127.0.0.1:3100",
      reuseExistingServer: false,
    },
    {
      command: "node tests/browser/server/launch.mjs fixture",
      url: "http://127.0.0.1:3102",
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: "node tests/browser/server/launch.mjs harness",
      url: "http://127.0.0.1:3101",
      reuseExistingServer: false,
    },
  ],
});
