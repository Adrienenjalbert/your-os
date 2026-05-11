import { defineConfig, devices } from "@playwright/test";

const PORT = Number.parseInt(process.env.PORT ?? "3001", 10);
const BASE_URL = process.env.BASE_URL ?? `http://127.0.0.1:${PORT}`;

/**
 * Playwright config for v1.1 Web Shell e2e suite.
 *
 * Per the M1 ratchet (plan v1.1 §M1 quality bar) — onboarding happy path
 * < 30 min wall clock. Tests use `test.setTimeout` per spec to enforce
 * tighter budgets (M2 = ≤1.5s p95 cmd-enter; M3 = diff preview <100ms).
 */
export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: false,
  // The OnboardingMachine state lives in the server process, keyed by
  // machineId. The whole suite shares machineId="default", so concurrent
  // workers would race over it. Pin to a single worker.
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    headless: true,
    locale: "en-US",
    timezoneId: "UTC",
    // Pin the color scheme so token-driven contrast tests are deterministic
    // regardless of the host machine's OS preference.
    colorScheme: "light",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Always run a production build for e2e — dev mode's per-route
    // recompile easily blows the 30 min ratchet budget.
    command:
      process.env.PLAYWRIGHT_USE_DEV === "1"
        ? `./node_modules/.bin/next dev --port ${PORT}`
        : `./node_modules/.bin/next build && ./node_modules/.bin/next start --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: {
      PORT: String(PORT),
      // Force mock mode in CI; design-partner deploys flip this off.
      YOUR_OS_RESEARCH_MODE: "mock",
      YOUR_OS_TELEMETRY_DISABLE: "1",
      YOUR_OS_TENANT_CONFIG_PATH: ".your-os/test-tenant-config.json",
    },
  },
});
