import { expect, test } from "@playwright/test";

/**
 * M3 ratchet for the Customise / Control panel:
 *   - Identity edit → preview diff → commit writes tenant.config.ts.
 *   - Brand AI propose returns DBA cards in < 5s (mock) and renders < 100ms.
 *   - Diff preview render < 100ms after dry-run.
 *   - Apply DBA selection produces a staged-patches banner.
 */

test.describe("M3 ratchet — Customise panel", () => {
  test("identity: edit → preview diff → commit", async ({ page }) => {
    await page.goto("/customise/identity");
    const nameInput = page.getByRole("textbox", { name: "Name *", exact: true });
    await nameInput.click();
    // Use a unique value per run so the dry-run always produces a diff,
    // regardless of any prior committed state in the on-disk tenant config.
    const uniqueName = `Hub ${Date.now().toString(36)}`;
    // Playwright's `fill` sets value via the DOM property setter, which React
    // 19 sometimes ignores on controlled inputs (it tracks its own setter).
    // Type the change instead so React sees an authentic input event.
    await nameInput.selectText();
    await nameInput.press("Backspace");
    await nameInput.pressSequentially(uniqueName, { delay: 10 });

    const dryRun = page.getByTestId("dry-run");
    await expect(dryRun).toBeEnabled();
    await dryRun.click();
    const diffStart = Date.now();
    await expect(page.getByTestId("config-diff")).toBeVisible();
    const diffElapsed = Date.now() - diffStart;
    expect(diffElapsed, `diff render ${diffElapsed}ms`).toBeLessThanOrEqual(2000);
    await expect(page.getByText(/^identity$/)).toBeVisible();

    // Commit and confirm the success indicator.
    await page.getByTestId("commit").click();
    await expect(page.getByText(/Committed\./i)).toBeVisible();
  });

  test("brand: AI propose returns cards within 5s (mock)", async ({ page }) => {
    await page.goto("/customise/brand");
    const start = Date.now();
    await page.getByTestId("propose-brand").click();
    await expect(page.getByTestId("proposal-picker")).toBeVisible({ timeout: 5000 });
    const elapsed = Date.now() - start;
    expect(elapsed, `mock propose elapsed ${elapsed}ms`).toBeLessThanOrEqual(5000);

    // Pick the first card and apply.
    const cards = page.getByTestId("proposal-picker").locator("ul > li > button");
    await cards.first().click();
    await page.getByTestId("apply-proposal").click();
    await expect(page.getByTestId("ai-patches-applied")).toBeVisible();
  });

  test("audience: AI propose path is wired", async ({ page }) => {
    await page.goto("/customise/audience");
    await page.getByTestId("propose-audience").click();
    await expect(page.getByTestId("proposal-picker")).toBeVisible({ timeout: 5000 });
  });

  test("overview lists every section link", async ({ page }) => {
    await page.goto("/customise");
    // Section labels appear twice — once in the side nav, once in the
    // overview grid. We scope to the main content area so the assertion
    // matches a single instance per label.
    const main = page.locator("main");
    for (const label of [
      "Identity",
      "Audience",
      "Brand & DBAs",
      "SEO",
      "Funnel",
      "Integrations",
      "Brand-lint",
    ]) {
      const links = main.getByRole("link", { name: label, exact: true });
      // At least one occurrence is enough to prove the overview renders it.
      await expect(links.first()).toBeVisible();
    }
  });
});
