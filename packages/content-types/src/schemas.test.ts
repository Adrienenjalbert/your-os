import { describe, expect, it } from "vitest";
import {
  ArticleSchema,
  CaseStudySchema,
  OpportunityBriefSchema,
  PillarSchema,
  ToolSchema,
} from "./index.js";

describe("content-types schemas", () => {
  it("ArticleSchema accepts a minimal valid article", () => {
    const a = ArticleSchema.parse({
      slug: "shifts-in-nyc",
      title: "Picking Up Shifts in NYC",
      body: "Body text...",
    });
    expect(a.seo.noIndex).toBe(false);
    expect(a.citations).toEqual([]);
  });

  it("ArticleSchema rejects bad slug", () => {
    expect(() => ArticleSchema.parse({ slug: "Bad Slug", title: "x", body: "y" })).toThrow(
      /lowercase alphanumeric/,
    );
  });

  it("ToolSchema enforces toolType enum", () => {
    expect(() =>
      ToolSchema.parse({ slug: "x", title: "T", toolType: "wrong-thing", inputs: [], outputs: [] }),
    ).toThrow();
  });

  it("PillarSchema is permissive (slug + name only)", () => {
    expect(PillarSchema.parse({ slug: "roles", name: "Roles" })).toBeDefined();
  });

  it("OpportunityBriefSchema validates createdBy enum", () => {
    const brief = OpportunityBriefSchema.parse({
      slug: "x",
      targetKeyword: "shift work nyc",
      suggestedTitle: "T",
      pillarSlug: "roles",
      createdAt: "2026-04-01T00:00:00Z",
    });
    expect(brief.status).toBe("draft");
    expect(brief.createdBy).toBe("weekly-digest-agent");
  });

  it("CaseStudySchema requires customer + outcome", () => {
    expect(() =>
      CaseStudySchema.parse({
        slug: "x",
        title: "T",
        industry: "hospitality",
        companySize: "200-1000",
      }),
    ).toThrow();
  });
});
