import { describe, expect, it } from "vitest";
import { CONTENT_TYPES } from "./schema.js";

describe("CONTENT_TYPES", () => {
  it("includes the 8 default content-types", () => {
    expect(CONTENT_TYPES.map((c) => c.apiId).sort()).toEqual([
      "article",
      "case-study",
      "cluster",
      "icp",
      "opportunity-brief",
      "persona",
      "pillar",
      "role-guide",
    ]);
  });

  it("attaches the SEO field bundle to every editorial content-type", () => {
    const editorialIds = ["article", "case-study", "role-guide"];
    for (const ct of CONTENT_TYPES.filter((c) => editorialIds.includes(c.apiId))) {
      expect(Object.keys(ct.attributes)).toEqual(
        expect.arrayContaining(["metaTitle", "metaDescription", "noIndex", "intent"]),
      );
    }
  });

  it("article has draftAndPublish enabled (preview flow requirement)", () => {
    expect(CONTENT_TYPES.find((c) => c.apiId === "article")?.options?.draftAndPublish).toBe(true);
  });

  it("opportunity-brief includes performanceSnapshot for write-back loop", () => {
    const brief = CONTENT_TYPES.find((c) => c.apiId === "opportunity-brief");
    expect(brief?.attributes.performanceSnapshot).toBeDefined();
  });
});
