import { describe, expect, it } from "vitest";
import { SKILL_FILES, getSkill, listSkills } from "./index.js";

describe("skills catalog", () => {
  it("ships the full Wave 3 catalog (35 skills: code 5 + seo 7 + seo-extended 9 + content 3 + ops 6 + strapi 2 + marketing 3)", () => {
    expect(SKILL_FILES.length).toBeGreaterThanOrEqual(22);
    expect(SKILL_FILES.length).toBe(35);
  });

  it("every skill has a unique slug", () => {
    const slugs = SKILL_FILES.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every skill body contains the slug in YAML frontmatter", () => {
    for (const skill of SKILL_FILES) {
      expect(
        skill.body.includes(`name: ${skill.slug}`),
        `${skill.slug} body must include 'name: ${skill.slug}' in frontmatter`,
      ).toBe(true);
    }
  });

  it("filters Strapi skills out for code-mode tenants", () => {
    const codeOnly = listSkills({ businessModel: "b2c", hasStrapi: false });
    expect(codeOnly.find((s) => s.family === "strapi")).toBeUndefined();
  });

  it("includes Strapi skills when hasStrapi is true", () => {
    const withStrapi = listSkills({ hasStrapi: true });
    expect(withStrapi.find((s) => s.family === "strapi")).toBeDefined();
  });

  it("getSkill returns the right skill", () => {
    expect(getSkill("brand-lint")?.family).toBe("ops");
  });

  it("includes the new Wave 3 SEO + content skills", () => {
    const newSlugs = [
      "seo-foundations",
      "seo-audit",
      "bot-policy",
      "entity-seo",
      "cannibalization",
      "index-health",
      "tool-fit",
      "programmatic-seo",
      "content-refresh",
    ];
    for (const slug of newSlugs) {
      const skill = getSkill(slug);
      expect(skill, `Skill ${slug} should exist`).toBeDefined();
      expect(skill?.slug).toBe(slug);
    }
  });

  it("places Wave 3 extended SEO under seo family and content-refresh under content", () => {
    const extendedSeoFamilySlugs = [
      "seo-foundations",
      "seo-audit",
      "bot-policy",
      "entity-seo",
      "cannibalization",
      "index-health",
      "tool-fit",
      "programmatic-seo",
    ];
    for (const slug of extendedSeoFamilySlugs) {
      expect(getSkill(slug)?.family, slug).toBe("seo");
    }
    expect(getSkill("content-refresh")?.family).toBe("content");
    expect(SKILL_FILES.filter((s) => s.family === "seo").length).toBe(15);
    expect(SKILL_FILES.filter((s) => s.family === "content").length).toBe(4);
  });
});
