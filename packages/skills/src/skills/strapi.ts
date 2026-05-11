import type { Skill } from "../catalog.js";

export const STRAPI_SKILLS: Skill[] = [
  {
    slug: "strapi-content-modeling",
    family: "strapi",
    description: "When to use Strapi vs code; content-type design + SEO field bundle patterns.",
    appliesTo: { requiresStrapi: true },
    body: `---
name: strapi-content-modeling
description: When to use Strapi vs code, and content-type design.
---

# Strapi content modeling

## Use Strapi for

- Editorial content edited weekly or by non-engineers.
- Anything tagged + browsed in admin (case studies, articles, customer stories).
- Anything that needs preview workflow.

## Keep in code

- Tool registry, navigation, pSEO templates, pillar/cluster taxonomy structure.
- Anything generated, never edited.

## Schema rules

- Every content-type gets the universal \`@your-os/strapi-seo\` field bundle (metaTitle, description, OG, JSON-LD overrides, intent, funnelStage, persona/ICP relations).
- Schema-as-code in \`@your-os/strapi-template\`. Never hand-edit prod admin schema (\`STRAPI_ADMIN_DISABLE_CONTENT_TYPE_BUILDER=true\`).
- Migration discipline: schema changes ship as \`@your-os/strapi-template@<major>\` bumps with a migration runner step.
`,
  },
  {
    slug: "strapi-publish-flow",
    family: "strapi",
    description: "Editor publish → webhook → ISR → live. Brand-lint blocks bad publishes in admin.",
    appliesTo: { requiresStrapi: true },
    body: `---
name: strapi-publish-flow
description: Strapi publish → ISR pipeline.
---

# Strapi publish flow

1. Editor edits in Strapi admin.
2. Click Publish → \`@your-os/strapi-brand-lint-hook\` runs in beforePublish. Blocks on banned phrase, missing citation, etc.
3. On pass, Strapi emits \`entry.publish\` webhook → tenant \`/api/revalidate\` (HMAC verified) → \`revalidateTag\` per content-type.
4. Live page updates within 60s p95.

If a publish appears not to land in 90s:
- Check Strapi webhook delivery log.
- Check tenant Vercel function logs for \`/api/revalidate\`.
- Use admin "force revalidate" button as a fallback.
`,
  },
];
