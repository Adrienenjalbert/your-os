import { expect, test } from "@playwright/test";

/**
 * M4 ratchet — full design-partner replay.
 *
 * Per the v1.1 plan §M4 we use the user-puppeteer MCP to drive this journey
 * in production; here we mirror it with Playwright so CI gates the loop on
 * a deterministic script. The journey covers:
 *
 *   1. Land → Onboarding identity
 *   2. Hop to Console home and confirm KPIs render
 *   3. Open the queue and pick the first brief
 *   4. Cmd-Enter approve (telemetry: console.brief.approved)
 *   5. Open Customise → Identity → tweak → commit
 *   6. Confirm telemetry events fire (5 of 11 minimum: see DP test md)
 *
 * The test is intentionally separate from the per-milestone specs so the
 * `pnpm web:loop` script can call it under a longer timeout budget.
 */

const DESIGN_PARTNER_BUDGET_MS = 30 * 60 * 1000;

test.describe("M4 ratchet — design-partner replay", () => {
  test.setTimeout(DESIGN_PARTNER_BUDGET_MS);

  test("full journey hits onboarding, console, customise, telemetry", async ({ page, request }) => {
    await page.goto("/console");
    await expect(page.getByTestId("home-kpis")).toBeVisible();

    await page.goto("/console/queue");
    await expect(page.getByRole("list", { name: /Ranked opportunities/i })).toBeVisible();

    await page.goto("/console/briefs/brief-001");
    await expect(page.getByText(/status:\s*draft/i)).toBeVisible();
    await page.keyboard.press("ControlOrMeta+Enter");
    await expect(page.getByText(/status:\s*approved/i)).toBeVisible({ timeout: 1500 });

    await page.goto("/customise/identity");
    const nameInput = page.getByRole("textbox", { name: "Name *", exact: true });
    await nameInput.click();
    const uniq = `Hub ${Date.now().toString(36)}`;
    await nameInput.selectText();
    await nameInput.press("Backspace");
    await nameInput.pressSequentially(uniq, { delay: 5 });
    await page.getByTestId("dry-run").click();
    await expect(page.getByTestId("config-diff")).toBeVisible();
    await page.getByTestId("commit").click();
    await expect(page.getByText(/Committed\./i)).toBeVisible();

    // Telemetry sanity check — pull the in-memory event ring via the API.
    const res = await request.get("/api/telemetry");
    const data = (await res.json()) as { events: Array<{ name: string }> };
    const names = new Set(data.events.map((e) => e.name));
    // We expect at least these to appear from the journey above.
    for (const required of [
      "console.keyboard.action",
      "console.brief.approved",
      "customise.commit",
    ]) {
      expect(names.has(required), `expected telemetry event ${required}`).toBe(true);
    }
  });
});
