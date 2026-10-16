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
      command: "npm run build && npm run start -- --hostname 127.0.0.1 --port 3100",
      timeout: 120_000,
      url: "http://127.0.0.1:3100",
      env: { NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "" },
      reuseExistingServer: false,
    },
    {
      command: "npx vite --config tests/browser/vite.config.mts",
      url: "http://127.0.0.1:3101",
      reuseExistingServer: false,
    },
  ],
});
