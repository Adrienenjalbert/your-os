import { ONBOARDING_STEPS, TOTAL_BUDGET_MINUTES } from "@your-os/configurator";
import { describe, expect, it } from "vitest";
import { ONBOARDING_STEPS_META, TOTAL_BUDGET_MINUTES_LOCAL } from "./onboarding-meta";

/**
 * Guard: the client-safe local meta MUST stay byte-equivalent to the
 * canonical onboarding step manifest in @your-os/configurator. If this test
 * fails, regenerate `apps/web/src/lib/onboarding-meta.ts` to match.
 */
describe("onboarding-meta local mirror", () => {
  it("has the same step ids in the same order", () => {
    expect(ONBOARDING_STEPS_META.map((s) => s.id)).toEqual(ONBOARDING_STEPS.map((s) => s.id));
  });

  it("has matching titles, oneLiners, and time budgets", () => {
    for (let i = 0; i < ONBOARDING_STEPS.length; i += 1) {
      const canonical = ONBOARDING_STEPS[i];
      const mirror = ONBOARDING_STEPS_META[i];
      expect(mirror?.title).toBe(canonical?.title);
      expect(mirror?.oneLiner).toBe(canonical?.oneLiner);
      expect(mirror?.timeBudgetMinutes).toBe(canonical?.timeBudgetMinutes);
    }
  });

  it("has matching total budget", () => {
    expect(TOTAL_BUDGET_MINUTES_LOCAL).toBe(TOTAL_BUDGET_MINUTES);
  });
});
