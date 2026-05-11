import { expect, test } from "@playwright/test";

// M1 ratchet (plan §M1): onboarding happy path < 30 min wall clock.
// We give it 90s in CI; the headless mock provider responds in < 50ms.
test.setTimeout(90_000);

test.describe("M1 — Onboarding happy path (mock provider)", () => {
  test.beforeEach(async ({ request }) => {
    // Reset machine + clear test tenant store between runs.
    await request.post("/api/onboarding/default", {
      data: { op: "reset" },
    });
  });

  test("scaffolds a tenant by walking the 7 steps end to end", async ({ page }) => {
    await page.goto("/onboarding/identity");

    // Step 1 — identity
    await page.getByLabel("Hub name").fill("Demo Hub");
    await page.getByLabel(/^Slug/).fill("demo-hub");
    await page.getByLabel("Domain").fill("demo.example.com");
    await page.getByLabel("Industry").selectOption("marketplace");
    await page.getByTestId("business-model-card").filter({ hasText: "B2C" }).click();
    await page.getByTestId("advance-button").click();

    // Step 2 — audience + conversion
    await expect(page).toHaveURL(/\/onboarding\/audience-conversion$/);
    await page.getByRole("textbox", { name: "Name", exact: true }).fill("Working parent");
    await page.getByRole("textbox", { name: "Pain", exact: true }).fill("Unpredictable schedules");
    await page.getByRole("textbox", { name: "Value", exact: true }).fill("Flexible $20/hr shifts");
    await page.getByTestId("advance-button").click();

    // Step 3 — brand
    await expect(page).toHaveURL(/\/onboarding\/brand$/);
    await page.getByLabel(/Primary distinctive brand asset/).fill("Work when you want");
    await page.getByTestId("advance-button").click();

    // Step 4 — SEO
    await expect(page).toHaveURL(/\/onboarding\/seo-architecture$/);
    // Mock provider returns at least one pillar from the brief; pick it.
    const pillars = page.locator('label[data-testid="choice-card"]');
    if ((await pillars.count()) > 0) {
      await pillars.first().click();
    }
    await page.getByTestId("advance-button").click();

    // Step 5 — content ops / CMS — defaults to code
    await expect(page).toHaveURL(/\/onboarding\/content-ops-cms$/);
    await page.getByTestId("advance-button").click();

    // Step 6 — integrations (no required inputs)
    await expect(page).toHaveURL(/\/onboarding\/integrations$/);
    await page.getByTestId("integration-gsc-connect").click();
    await page.getByTestId("advance-button").click();

    // Step 7 — launch preview
    await expect(page).toHaveURL(/\/onboarding\/launch-preview$/);
    await page.getByTestId("finalize-button").click();

    // Finalize succeeded → success banner mentions slug.
    await expect(page.getByRole("status").filter({ hasText: "demo-hub" })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("blocks advance when required identity fields are empty", async ({ page }) => {
    await page.goto("/onboarding/identity");
    await page.getByTestId("advance-button").click();
    // Scope the alert assertion to our own validation message, not Next's
    // built-in route announcer which also has role="alert".
    await expect(page.getByText(/identity\.name: required/i)).toBeVisible();
  });
});
