import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ROUTES = [
  "/",
  "/onboarding/identity",
  "/onboarding/audience-conversion",
  "/onboarding/brand",
  "/onboarding/seo-architecture",
  "/onboarding/content-ops-cms",
  "/onboarding/integrations",
  "/onboarding/launch-preview",
  "/console",
  "/console/queue",
  "/console/briefs/brief-001",
  "/customise",
  "/customise/identity",
  "/customise/audience",
  "/customise/brand",
  "/customise/seo",
  "/customise/funnel",
  "/customise/integrations",
  "/customise/brand-lint",
];

test.describe("M1 ratchet — axe (zero serious)", () => {
  for (const route of ROUTES) {
    test(`axe scan: ${route}`, async ({ page, request }) => {
      // Reset machine so onboarding routes render server-side cleanly.
      if (route.startsWith("/onboarding")) {
        await request.post("/api/onboarding/default", { data: { op: "reset" } });
      }
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const serious = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
      expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
    });
  }
});
