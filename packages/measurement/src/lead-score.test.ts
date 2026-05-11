import type { TenantConfig } from "@your-os/tenant-config";
import { describe, expect, it } from "vitest";
import { scoreLead } from "./lead-score.js";

const tenant: Pick<TenantConfig, "funnel"> = {
  funnel: {
    intentMap: {},
    microConversions: {
      definitions: [
        { id: "scroll_75", weight: 0.1, roosContribution: 0 },
        { id: "newsletter_confirm", weight: 0.4, roosContribution: 0.05 },
        { id: "tool_completed", weight: 0.6, roosContribution: 0.15 },
        { id: "demo_requested", weight: 0.95, roosContribution: 0.5 },
      ],
      scoringModel: "weighted_sum",
    },
    domainAuthorityThreshold: 30,
  },
};

describe("scoreLead — weighted_sum", () => {
  it("sums weights, caps at 1", () => {
    const r = scoreLead(
      {
        events: [
          { id: "scroll_75", ts: 1 },
          { id: "newsletter_confirm", ts: 2 },
          { id: "tool_completed", ts: 3 },
        ],
      },
      tenant,
    );
    // Sum is 0.1 + 0.4 + 0.6 = 1.1 → capped at 1.
    expect(r.score).toBe(1);
  });

  it("sums weights without capping when sum < 1", () => {
    const r = scoreLead(
      {
        events: [
          { id: "scroll_75", ts: 1 },
          { id: "newsletter_confirm", ts: 2 },
        ],
      },
      tenant,
    );
    expect(r.score).toBeCloseTo(0.5, 3);
  });

  it("dedups repeated events", () => {
    const r = scoreLead(
      {
        events: [
          { id: "newsletter_confirm", ts: 1 },
          { id: "newsletter_confirm", ts: 2 },
          { id: "newsletter_confirm", ts: 3 },
        ],
      },
      tenant,
    );
    expect(r.score).toBeCloseTo(0.4, 3);
  });

  it("returns cold/warm/hot tier based on thresholds", () => {
    expect(scoreLead({ events: [{ id: "scroll_75", ts: 1 }] }, tenant).tier).toBe("cold");
    expect(scoreLead({ events: [{ id: "newsletter_confirm", ts: 1 }] }, tenant).tier).toBe("warm");
    expect(scoreLead({ events: [{ id: "demo_requested", ts: 1 }] }, tenant).tier).toBe("hot");
  });

  it("ignores unknown event IDs", () => {
    const r = scoreLead({ events: [{ id: "made-up-event", ts: 1 }] }, tenant);
    expect(r.score).toBe(0);
    expect(r.contributions).toHaveLength(0);
  });

  it("respects pillar scoping when set on a definition", () => {
    const tWithPillar: Pick<TenantConfig, "funnel"> = {
      funnel: {
        intentMap: {},
        microConversions: {
          definitions: [
            { id: "tool_completed", weight: 0.6, pillars: ["salary"], roosContribution: 0.15 },
          ],
          scoringModel: "weighted_sum",
        },
        domainAuthorityThreshold: 30,
      },
    };
    const matching = scoreLead(
      { events: [{ id: "tool_completed", pillar: "salary", ts: 1 }] },
      tWithPillar,
    );
    const nonMatching = scoreLead(
      { events: [{ id: "tool_completed", pillar: "benefits", ts: 1 }] },
      tWithPillar,
    );
    expect(matching.score).toBeCloseTo(0.6, 2);
    expect(nonMatching.score).toBe(0);
  });
});

describe("scoreLead — max model", () => {
  const tMax: Pick<TenantConfig, "funnel"> = {
    funnel: {
      intentMap: {},
      microConversions: {
        ...tenant.funnel.microConversions,
        scoringModel: "max",
      },
      domainAuthorityThreshold: 30,
    },
  };
  it("returns the single highest weight, not a sum", () => {
    const r = scoreLead(
      {
        events: [
          { id: "scroll_75", ts: 1 },
          { id: "tool_completed", ts: 2 },
        ],
      },
      tMax,
    );
    expect(r.score).toBeCloseTo(0.6, 2);
  });
});

describe("scoreLead — first_high model", () => {
  const tFirstHigh: Pick<TenantConfig, "funnel"> = {
    funnel: {
      intentMap: {},
      microConversions: {
        ...tenant.funnel.microConversions,
        scoringModel: "first_high",
      },
      domainAuthorityThreshold: 30,
    },
  };
  it("uses the first event with weight ≥ 0.7", () => {
    const r = scoreLead(
      {
        events: [
          { id: "scroll_75", ts: 1 },
          { id: "demo_requested", ts: 2 },
          { id: "tool_completed", ts: 3 },
        ],
      },
      tFirstHigh,
    );
    expect(r.score).toBeCloseTo(0.95, 2);
  });
  it("falls back to weighted sum if no high-weight event present", () => {
    const r = scoreLead(
      {
        events: [
          { id: "scroll_75", ts: 1 },
          { id: "newsletter_confirm", ts: 2 },
        ],
      },
      tFirstHigh,
    );
    expect(r.score).toBeCloseTo(0.5, 2);
  });
});
