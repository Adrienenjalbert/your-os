import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { TenantConfig } from "@your-os/tenant-config";

export interface AddPageOptions {
  tenant: TenantConfig;
  outDir: string;
  type: "article" | "guide" | "tool" | "case-study" | "role-guide";
  slug: string;
  title: string;
  /** Optional pillar slug; defaults to first pillar in tenantConfig. */
  pillarSlug?: string;
  dryRun?: boolean;
}

/**
 * Scaffolds a new content data file for code-mode tenants. Strapi-mode
 * tenants don't use this; they create entries via Strapi admin.
 */
export async function addPage(opts: AddPageOptions): Promise<{ path: string; contents: string }> {
  const pillarSlug = opts.pillarSlug ?? opts.tenant.seo.pillars[0]?.slug ?? "uncategorized";
  const path = `src/content/${plural(opts.type)}/${opts.slug}.ts`;
  const contents = renderTemplate(opts.type, {
    slug: opts.slug,
    title: opts.title,
    pillarSlug,
    today: new Date().toISOString(),
  });

  if (!opts.dryRun) {
    const full = join(opts.outDir, path);
    await mkdir(join(full, ".."), { recursive: true });
    await writeFile(full, contents, "utf-8");
  }
  return { path, contents };
}

function plural(type: AddPageOptions["type"]): string {
  switch (type) {
    case "article":
      return "articles";
    case "guide":
      return "guides";
    case "tool":
      return "tools";
    case "case-study":
      return "case-studies";
    case "role-guide":
      return "role-guides";
  }
}

function renderTemplate(
  type: AddPageOptions["type"],
  ctx: { slug: string; title: string; pillarSlug: string; today: string },
): string {
  return `import type { ${typeName(type)} } from "@your-os/content-types";

export const entry: ${typeName(type)} = {
  slug: "${ctx.slug}",
  title: "${ctx.title}",
  pillarSlug: "${ctx.pillarSlug}",
  dateModified: "${ctx.today}",
  ${typeBody(type)}
};

export default entry;
`;
}

function typeName(type: AddPageOptions["type"]): string {
  switch (type) {
    case "article":
      return "Article";
    case "guide":
      return "Guide";
    case "tool":
      return "Tool";
    case "case-study":
      return "CaseStudy";
    case "role-guide":
      return "RoleGuide";
  }
}

function typeBody(type: AddPageOptions["type"]): string {
  switch (type) {
    case "article":
    case "guide":
      return `body: "TODO: write the body. Add inline citations like (Source 2026).",
  description: "TODO: ≤160 chars meta description.",
  citations: [],
  personaIds: [],
  icpIds: [],
  seo: { noIndex: false, keywords: [] },`;
    case "tool":
      return `toolType: "calculator",
  description: "TODO",
  inputs: [],
  outputs: [],
  personaIds: [],
  icpIds: [],
  seo: { noIndex: false, keywords: [] },`;
    case "case-study":
      return `customer: "TODO",
  industry: "TODO",
  companySize: "TODO",
  outcome: "TODO",
  metrics: [],
  description: "TODO",
  personaIds: [],
  icpIds: [],
  seo: { noIndex: false, keywords: [] },`;
    case "role-guide":
      return `roleSlug: "${"${roleSlug}"}",
  payRangeLow: 0,
  payRangeHigh: 0,
  payUnit: "hour",
  duties: [],
  description: "TODO",
  personaIds: [],
  icpIds: [],
  seo: { noIndex: false, keywords: [] },`;
  }
}
