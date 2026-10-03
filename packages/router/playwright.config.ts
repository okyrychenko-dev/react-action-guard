import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./browser",
  testMatch: "**/*.pw.ts",
  workers: 1,
  outputDir: "./.cache/browser-history/artifacts",
  reporter: [["list"], ["json", { outputFile: "./.cache/browser-history/results.json" }]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    channel: "chrome",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm run browser:serve",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
  },
});
