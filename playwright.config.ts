import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  snapshotPathTemplate:
    "{testDir}/../docs/screenshots/{arg}{ext}",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5174",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: {
    command: "npm run dev -- --port 5174 --strictPort",
    url: "http://127.0.0.1:5174/",
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      VITE_DATA_SOURCE: "live",
      VITE_SPOTIFY_CLIENT_ID: "playwright-client-id",
    },
  },
});
