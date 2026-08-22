import { defineConfig, devices } from "@playwright/test";

const port = 43992;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/live",
  testMatch: "**/*.smoke.ts",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 150_000,
  expect: { timeout: 90_000 },
  reporter: "list",
  use: {
    ...devices["iPad Pro 11"],
    baseURL,
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `pnpm dev --hostname 127.0.0.1 --port ${port}`,
    env: {
      ...process.env,
      ANCHOR_DEMO_MODE: "false",
    },
    reuseExistingServer: false,
    timeout: 120_000,
    url: baseURL,
  },
});
