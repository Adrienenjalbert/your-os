import type { TenantConfig } from "@your-os/tenant-config";
import { describe, expect, it } from "vitest";
import { forecastRoos } from "./forecast.js";

const baseTenant: Pick<TenantConfig, "funnel"> = {
  funnel: {
    intentMap: {},
    microConversions: { definitions: [], scoringModel: "weighted_sum" },
    domainAuthorityThreshold: 30,
  },
};

describe("forecastRoos", () => {
  it("produces a band that scales linearly with liftClicks", () => {
    const small = forecastRoos(
      { briefId: "a", liftClicks: 100, intent: "transactional" },
      baseTenant,
    );
    const big = forecastRoos(
      { briefId: "b", liftClicks: 1000, intent: "transactional" },
      baseTenant,
    );
    expect(big.d90.mid).toBeCloseTo(small.d90.mid * 10, 0);
  });

  it("transactional intent has a higher conversion rate than informational_early", () => {
    const transactional = forecastRoos(
      { briefId: "t", liftClicks: 1000, intent: "transactional" },
      baseTenant,
    );
    const informational = forecastRoos(
      { briefId: "i", liftClicks: 1000, intent: "informational_early" },
      baseTenant,
    );
    expect(transactional.d90.mid).toBeGreaterThan(informational.d90.mid);
  });

  it("micro-conversion roosContribution lifts the mid forecast", () => {
    const tenantWithMc: Pick<TenantConfig, "funnel"> = {
      funnel: {
        intentMap: {},
        microConversions: {
          definitions: [
            { id: "tool_completed", weight: 0.6, roosContribution: 0.2 },
            { id: "newsletter_confirm", weight: 0.4, roosContribution: 0.1 },
          ],
          scoringModel: "weighted_sum",
        },
        domainAuthorityThreshold: 30,
      },
    };
    const without = forecastRoos(
      { briefId: "a", liftClicks: 1000, intent: "commercial_investigation" },
      baseTenant,
    );
    const withMc = forecastRoos(
      { briefId: "b", liftClicks: 1000, intent: "commercial_investigation" },
      tenantWithMc,
    );
    expect(withMc.d90.mid).toBeGreaterThan(without.d90.mid);
    expect(withMc.microConversionUplift).toBeGreaterThan(0);
  });

  it("d30 is smaller than d60 is smaller than d90", () => {
    const f = forecastRoos({ briefId: "x", liftClicks: 1000, intent: "transactional" }, baseTenant);
    expect(f.d30.mid).toBeLessThan(f.d60.mid);
    expect(f.d60.mid).toBeLessThan(f.d90.mid);
  });

  it("low band is below mid; high band is above mid", () => {
    const f = forecastRoos({ briefId: "x", liftClicks: 1000, intent: "transactional" }, baseTenant);
    for (const w of [f.d30, f.d60, f.d90]) {
      expect(w.low).toBeLessThan(w.mid);
      expect(w.high).toBeGreaterThan(w.mid);
    }
  });

  it("pillar-scoped micro-conversions only apply when pillar matches", () => {
    const tenant: Pick<TenantConfig, "funnel"> = {
      funnel: {
        intentMap: {},
        microConversions: {
          definitions: [
            { id: "tool_completed", weight: 0.6, pillars: ["salary"], roosContribution: 0.2 },
          ],
          scoringModel: "weighted_sum",
        },
        domainAuthorityThreshold: 30,
      },
    };
    const matching = forecastRoos(
      { briefId: "a", liftClicks: 1000, intent: "transactional", pillar: "salary" },
      tenant,
    );
    const nonMatching = forecastRoos(
      { briefId: "b", liftClicks: 1000, intent: "transactional", pillar: "benefits" },
      tenant,
    );
    expect(matching.microConversionUplift).toBeGreaterThan(0);
    expect(nonMatching.microConversionUplift).toBe(0);
  });
});
