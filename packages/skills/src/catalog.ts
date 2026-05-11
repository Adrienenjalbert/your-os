/**
 * Inline skill catalog. Skills are short markdown blocks (frontmatter +
 * body). We inline rather than fs-read so the package works without
 * filesystem access at runtime (Edge runtime, embedded in apps, etc.).
 */
import { CODE_SKILLS } from "./skills/code.js";
import { CONTENT_SKILLS } from "./skills/content.js";
import { MARKETING_SKILLS } from "./skills/marketing.js";
import { OPS_SKILLS } from "./skills/ops.js";
import { SEO_EXTENDED_SKILLS } from "./skills/seo-extended.js";
import { SEO_SKILLS } from "./skills/seo.js";
import { STRAPI_SKILLS } from "./skills/strapi.js";

export interface Skill {
  /** Stable slug used as filename + reference. */
  slug: string;
  /** Short human description. Used by agents to decide whether to load. */
  description: string;
  /** Family for grouping. */
  family: "code" | "seo" | "content" | "ops" | "strapi" | "marketing";
  /** Tenant filters: empty = all tenants. */
  appliesTo?: {
    businessModels?: Array<"b2c" | "b2b" | "marketplace">;
    requiresStrapi?: boolean;
  };
  /** Markdown body (frontmatter + content). */
  body: string;
}

export const SKILL_FILES: Skill[] = [
  ...CODE_SKILLS,
  ...SEO_SKILLS,
  ...SEO_EXTENDED_SKILLS,
  ...CONTENT_SKILLS,
  ...OPS_SKILLS,
  ...STRAPI_SKILLS,
  ...MARKETING_SKILLS,
];

export function listSkills(
  opts: {
    businessModel?: "b2c" | "b2b" | "marketplace";
    hasStrapi?: boolean;
  } = {},
): Skill[] {
  return SKILL_FILES.filter((skill) => {
    const app = skill.appliesTo;
    if (!app) return true;
    if (
      app.businessModels &&
      opts.businessModel &&
      !app.businessModels.includes(opts.businessModel)
    ) {
      return false;
    }
    if (app.requiresStrapi && !opts.hasStrapi) return false;
    return true;
  });
}

export function getSkill(slug: string): Skill | undefined {
  return SKILL_FILES.find((s) => s.slug === slug);
}
