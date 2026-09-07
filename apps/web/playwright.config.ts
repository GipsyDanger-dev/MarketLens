import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.MARKETLENS_E2E_PORT ?? 3000);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("Invalid E2E port");
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgresql://marketlens:marketlens@127.0.0.1:5432/marketlens",
      ENABLE_AI: "false",
      ENABLE_AUTH: "false",
      MAX_RESEARCH_RESULTS: "250",
      MARKETLENS_NEXT_DIST_DIR: ".next-marketlens-e2e",
    },
    url: baseURL,
    reuseExistingServer: false,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
