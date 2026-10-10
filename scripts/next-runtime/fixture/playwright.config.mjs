import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "*.pw.mjs",
  workers: 1,
  forbidOnly: true,
  globalTimeout: 180000,
  retries: 0,
  outputDir: "./artifacts",
  reporter: [["list"], ["json", { outputFile: "./browser-results.json" }]],
  use: {
    baseURL: "http://127.0.0.1:4187",
    browserName: "chromium",
    channel: "chrome",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 4187",
    url: "http://127.0.0.1:4187/pages-home",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
