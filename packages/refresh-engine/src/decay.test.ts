import { describe, expect, it } from "vitest";
import { detectDecay } from "./decay.js";

const NOW = new Date("2026-05-01T00:00:00Z");

describe("detectDecay", () => {
  it("flags a page with stale dateModified", () => {
    const r = detectDecay({
      pages: [{ page: "/a", dateModified: "2025-01-01T00:00:00Z" }],
      now: () => NOW,
    });
    expect(r).toHaveLength(1);
    expect(r[0]?.reasons.map((x) => x.id)).toContain("stale-date-modified");
  });

  it("does NOT flag a fresh page", () => {
    const r = detectDecay({
      pages: [{ page: "/a", dateModified: "2026-04-01T00:00:00Z" }],
      now: () => NOW,
    });
    expect(r).toHaveLength(0);
  });

  it("flags ranking drop", () => {
    const r = detectDecay({
      pages: [{ page: "/a", dateModified: "2026-04-01T00:00:00Z", rankingDelta30d: -8 }],
      now: () => NOW,
    });
    expect(r[0]?.reasons.map((x) => x.id)).toContain("ranking-drop");
  });

  it("flags ROOS drop", () => {
    const r = detectDecay({
      pages: [{ page: "/a", dateModified: "2026-04-01T00:00:00Z", roosDelta90d: -0.3 }],
      now: () => NOW,
    });
    expect(r[0]?.reasons.map((x) => x.id)).toContain("roos-drop");
  });

  it("flags stale source data", () => {
    const r = detectDecay({
      pages: [
        {
          page: "/a",
          dateModified: "2026-04-01T00:00:00Z",
          sourceDataVersion: "2024-Q4",
          currentSourceDataVersion: "2026-Q1",
        },
      ],
      now: () => NOW,
    });
    expect(r[0]?.reasons.map((x) => x.id)).toContain("stale-source-data");
  });

  it("sums weights when multiple signals fire", () => {
    const r = detectDecay({
      pages: [
        {
          page: "/multi",
          dateModified: "2025-01-01T00:00:00Z",
          rankingDelta30d: -10,
          roosDelta90d: -0.4,
        },
      ],
      now: () => NOW,
    });
    expect(r[0]?.decayScore).toBeCloseTo(0.3 + 0.4 + 0.5, 2);
  });

  it("sorts by decay score descending", () => {
    const r = detectDecay({
      pages: [
        { page: "/low", dateModified: "2025-09-01T00:00:00Z" }, // stale only
        {
          page: "/high",
          dateModified: "2025-01-01T00:00:00Z",
          rankingDelta30d: -10,
          roosDelta90d: -0.4,
        },
      ],
      now: () => NOW,
    });
    expect(r[0]?.page).toBe("/high");
    expect(r[1]?.page).toBe("/low");
  });

  it("respects a custom threshold", () => {
    const r = detectDecay({
      pages: [{ page: "/a", dateModified: "2025-09-01T00:00:00Z" }],
      now: () => NOW,
      threshold: 0.5, // higher than the single 'stale-date-modified' weight
    });
    expect(r).toHaveLength(0);
  });
});
