import { expect, test } from "@playwright/test";

/**
 * M2 ratchet for the Admin Console:
 *   - KPI cards render and every comparison string is non-empty (rule 050).
 *   - Cmd-K opens the command palette; brief items are listed.
 *   - Cmd-Enter on a draft brief approves it in ≤ 1.5s p95.
 */

test.describe("M2 ratchet — Admin Console", () => {
  test("home renders KPIs and every comparison string is non-empty", async ({ page }) => {
    await page.goto("/console");
    await expect(page.getByRole("heading", { name: /KPIs/i, level: 2 })).toBeAttached();
    const kpiList = page.getByTestId("home-kpis");
    await expect(kpiList).toBeVisible();
    const kpiItems = kpiList.locator("> li");
    const count = await kpiItems.count();
    expect(count).toBeGreaterThanOrEqual(3);
    for (let i = 0; i < count; i += 1) {
      const item = kpiItems.nth(i);
      // Every KpiCard renders 3 paragraphs: label, value, comparison.
      // The comparison is the third <p>; assert it is non-empty.
      const paragraphs = item.locator("p");
      const pCount = await paragraphs.count();
      expect(pCount).toBeGreaterThanOrEqual(3);
      const comparison = await paragraphs.nth(2).innerText();
      expect(comparison.trim().length, `KPI #${i} comparison string`).toBeGreaterThan(0);
    }
  });

  test("opportunity queue renders ranked rows", async ({ page }) => {
    await page.goto("/console/queue");
    const list = page.getByRole("list", { name: /Ranked opportunities/i });
    await expect(list).toBeVisible();
    const items = list.locator("> li");
    const n = await items.count();
    expect(n).toBeGreaterThan(0);
    // First row is highlighted.
    await expect(items.first()).toHaveAttribute("data-rank", "0");
  });

  test("command palette includes brief items", async ({ page }) => {
    await page.goto("/console");
    await page.keyboard.press("ControlOrMeta+k");
    const dialog = page.getByRole("dialog", { name: /Command palette/i });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Search commands").fill("brief");
    await expect(dialog.getByText(/Striking-distance/i).first()).toBeVisible();
  });

  test("cmd-enter approves a draft brief within 1.5s", async ({ page }) => {
    await page.goto("/console/briefs/brief-001");
    await expect(page.getByRole("heading", { level: 2 })).toContainText(/Striking-distance/);
    await expect(page.getByText(/status:\s*draft/i)).toBeVisible();
    const start = Date.now();
    await page.keyboard.press("ControlOrMeta+Enter");
    await expect(page.getByText(/status:\s*approved/i)).toBeVisible({ timeout: 1500 });
    const elapsed = Date.now() - start;
    expect(elapsed, `cmd-enter approve elapsed ${elapsed}ms`).toBeLessThanOrEqual(1500);
  });

  test("intent-CTA aligned banner shows for valid brief", async ({ page }) => {
    await page.goto("/console/briefs/brief-001");
    await expect(page.getByText(/Intent ↔ CTA aligned/i)).toBeVisible();
  });
});
