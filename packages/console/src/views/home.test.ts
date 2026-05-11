import type { Opportunity } from "@your-os/control-plane";
import type { ReconciliationReport } from "@your-os/measurement";
import type { TenantConfig } from "@your-os/tenant-config";
import { describe, expect, it } from "vitest";
import { type BriefSummary, homeViewModel } from "./home.js";

const tenant: Pick<TenantConfig, "identity"> = {
  identity: {
    name: "Career Hub",
    slug: "career-hub",
    domain: "indeedflex.com",
    industry: "flexible-work-marketplace",
    businessModel: "b2c",
  },
};

const opps: Opportunity[] = [
  {
    page: "/a",
    query: "warehouse",
    kind: "striking-distance",
    liftClicks: 300,
    effort: 0.3,
    liftPerEffort: 1000,
    reason: "x",
  },
  {
    page: "/b",
    query: "forklift",
    kind: "ctr-rescue",
    liftClicks: 40,
    effort: 0.15,
    liftPerEffort: 266.7,
    reason: "y",
  },
];

const briefs: BriefSummary[] = [
  {
    id: "1",
    title: "warehouse guide",
    status: "draft",
    opportunityKind: "striking-distance",
    estimatedClicks: 300,
    createdAt: "2026-04-01T00:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  },
  {
    id: "2",
    title: "forklift guide",
    status: "approved",
    opportunityKind: "ctr-rescue",
    estimatedClicks: 40,
    createdAt: "2026-04-02T00:00:00Z",
    updatedAt: "2026-04-02T00:00:00Z",
  },
];

const reconciliations: ReconciliationReport[] = [
  {
    briefId: "old-1",
    windows: [
      {
        window: "d30",
        forecastBand: { low: 5, mid: 10, high: 15 },
        actualConversions: 11,
        actualClicks: 250,
        variancePctVsMid: 0.1,
        insideBand: true,
      },
    ],
    overallCalibration: "in-band",
  },
];

describe("homeViewModel", () => {
  it("emits four KPIs by default (with AI-citation when provided)", () => {
    const vm = homeViewModel({
      tenant,
      opportunities: opps,
      briefs,
      reconciliations,
      weeklyLiftClicks: 340,
      weeklyLiftWowDeltaPct: 5.2,
      aiCitationSharePct: 12.4,
      aiCitationShareWowDeltaPct: 1.5,
    });
    expect(vm.kpis.map((k) => k.id)).toEqual([
      "open-briefs",
      "weekly-lift",
      "in-band-pct",
      "ai-citation-share",
    ]);
    expect(vm.kpis.every((k) => k.comparison.length > 0)).toBe(true);
  });

  it("omits AI-citation KPI when not provided", () => {
    const vm = homeViewModel({
      tenant,
      opportunities: opps,
      briefs,
      reconciliations,
      weeklyLiftClicks: 340,
      weeklyLiftWowDeltaPct: 5.2,
    });
    expect(vm.kpis.map((k) => k.id)).not.toContain("ai-citation-share");
  });

  it("nextHitlGate prompts brief sign-off when drafts exist", () => {
    const vm = homeViewModel({
      tenant,
      opportunities: opps,
      briefs,
      reconciliations,
      weeklyLiftClicks: 340,
      weeklyLiftWowDeltaPct: 5.2,
    });
    expect(vm.nextHitlGate).toMatch(/Brief sign-off/);
  });

  it("surfaces top 3 opportunities", () => {
    const vm = homeViewModel({
      tenant,
      opportunities: opps,
      briefs,
      reconciliations,
      weeklyLiftClicks: 340,
      weeklyLiftWowDeltaPct: 5.2,
    });
    expect(vm.topOpportunities.length).toBeLessThanOrEqual(3);
  });

  it("flags drift when in-band rate < 70%", () => {
    const driftedReconciliations: ReconciliationReport[] = [
      ...Array.from({ length: 10 }, (_, i) => ({
        briefId: `r-${i}`,
        windows: [],
        overallCalibration: i < 4 ? ("in-band" as const) : ("overforecast" as const),
      })),
    ];
    const vm = homeViewModel({
      tenant,
      opportunities: [],
      briefs: [],
      reconciliations: driftedReconciliations,
      weeklyLiftClicks: 0,
      weeklyLiftWowDeltaPct: 0,
    });
    const inBand = vm.kpis.find((k) => k.id === "in-band-pct");
    expect(inBand?.comparison).toMatch(/drifting/);
  });
});
