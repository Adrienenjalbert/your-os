import type { TenantConfig } from "@your-os/tenant-config";

export interface RenderCursorRulesOptions {
  tenant: TenantConfig;
}

export interface CursorRuleFile {
  path: string;
  contents: string;
}

/**
 * Emits the canonical `.cursor/rules/*` files a tenant should commit. The CLI
 * writes these to disk; tests assert structure.
 */
export function renderCursorRules(opts: RenderCursorRulesOptions): CursorRuleFile[] {
  const { tenant } = opts;
  const hasStrapi = Boolean(tenant.strapi);

  const core = `---
description: ${tenant.identity.name} core rules
alwaysApply: true
---

# ${tenant.identity.name} core rules

- This repo is a tenant of \`@your-os/*\`. Do not duplicate logic in \`@your-os/core\`, \`@your-os/seo\`, \`@your-os/brand-lint\`. Reuse.
- Conversion event = \`${tenant.conversion.eventName}\`. Never hardcode a different event name.
- DBAs (must mention ≥80% prevalence): ${tenant.brand.distinctiveAssets.map((d) => `"${d.value}"`).join(", ") || "none yet"}.
- Brand voice: ${tenant.brand.voice.tone}, ${tenant.brand.voice.readingLevel}, ${tenant.brand.voice.pov}.
- Run \`pnpm exec your-os-brand-lint --staged\` before requesting review.
${hasStrapi ? "- Editorial content lives in Strapi; do not commit article body content to TS data files unless explicitly hybrid-mode for that type." : "- Content lives in TS data files under `src/features/<type>/data/<slug>.ts`. Use `@your-os/content-source` selectors."}
`;

  const seo = `---
description: SEO + metadata rules
globs: ["src/**/*.tsx", "src/**/page.ts", "src/**/layout.ts"]
---

# SEO + metadata rules

- Use \`generateSEOMetadata\` from \`@your-os/seo\`; never hand-roll \`<head>\`.
- Every public page MUST have unique title, description ≤160ch, canonical, primary JSON-LD.
- Primary schema type: \`${tenant.seo.primarySchemaType}\`.
- Pillars in scope: ${tenant.seo.pillars.map((p) => p.slug).join(", ")}.
`;

  return [
    { path: ".cursor/rules/000-core.mdc", contents: core },
    { path: ".cursor/rules/010-seo.mdc", contents: seo },
  ];
}
