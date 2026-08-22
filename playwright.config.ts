import { defineConfig, devices } from "@playwright/test";

const externalBaseUrl = process.env.ANCHOR_E2E_BASE_URL;
const isolatedBaseUrl = "http://127.0.0.1:43991";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: externalBaseUrl ?? isolatedBaseUrl,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-tablet",
      use: { ...devices["iPad Pro 11"], browserName: "chromium" },
    },
  ],
  ...(externalBaseUrl
    ? {}
    : {
        webServer: {
          command: "pnpm dev --hostname 127.0.0.1 --port 43991",
          url: isolatedBaseUrl,
          reuseExistingServer: false,
          timeout: 120_000,
        },
      }),
});
