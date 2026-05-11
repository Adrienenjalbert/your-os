import { describe, expect, it } from "vitest";
import { aggregateByPersona, aggregateByPillar, wowDelta } from "./aggregate.js";
import type { Citation } from "./import.js";

const citations: Citation[] = [
  {
    weekStart: "2026-04-28",
    engine: "chatgpt",
    prompt: "p1",
    url: "https://indeedflex.com/articles/flex-shifts",
    position: 1,
    share: 0.15,
  },
  {
    weekStart: "2026-04-28",
    engine: "perplexity",
    prompt: "p2",
    url: "https://indeedflex.com/guides/warehouse",
    position: 2,
    share: 0.08,
  },
  {
    weekStart: "2026-04-28",
    engine: "claude",
    prompt: "p3",
    url: "https://indeedflex.com/articles/w2-employment",
    position: 1,
    share: 0.12,
  },
];

describe("aggregateByPillar", () => {
  it("buckets citations by URL prefix → pillar", () => {
    const r = aggregateByPillar(citations, {
      "https://indeedflex.com/articles": "articles",
      "https://indeedflex.com/guides": "guides",
    });
    const articles = r.find((x) => x.pillar === "articles");
    const guides = r.find((x) => x.pillar === "guides");
    expect(articles?.citations).toBe(2);
    expect(guides?.citations).toBe(1);
    expect(articles?.totalShare).toBeCloseTo(0.27, 3);
  });
});

describe("aggregateByPersona", () => {
  it("buckets by persona prefix tag", () => {
    const r = aggregateByPersona(citations, {
      "/articles/flex-shifts": "students",
      "/articles/w2-employment": "career-changers",
      "/guides/warehouse": "gig-workers",
    });
    expect(r.map((x) => x.personaId).sort()).toEqual([
      "career-changers",
      "gig-workers",
      "students",
    ]);
  });
});

describe("wowDelta", () => {
  it("computes positive delta in pp and pct", () => {
    const d = wowDelta(0.18, 0.12);
    expect(d.deltaPp).toBeCloseTo(0.06, 3);
    expect(d.deltaPct).toBeCloseTo(0.5, 3);
  });
  it("handles zero last-week without division by zero", () => {
    const d = wowDelta(0.1, 0);
    expect(d.deltaPct).toBe(0);
    expect(d.deltaPp).toBeCloseTo(0.1, 3);
  });
});
