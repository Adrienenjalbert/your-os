import type { Skill } from "../catalog.js";

export const CODE_SKILLS: Skill[] = [
  {
    slug: "component-placement",
    family: "code",
    description:
      "Decide where new components belong: tenant feature folder vs @your-os/core vs primitive UI lib.",
    body: `---
name: component-placement
description: Decide where new components belong across feature, shared, and primitive UI layers.
---

# Component placement

If used by 1 page → feature folder.
If used by 2+ pages, tenant-specific → \`src/shared/components\`.
If reusable across tenants → propose to \`@your-os/core\` (separate PR).
If primitive (button, card, etc.) → \`@your-os/core/ui\` only.
`,
  },
  {
    slug: "data-placement",
    family: "code",
    description: "Where TS data modules + slug helpers belong; never colocate with components.",
    body: `---
name: data-placement
description: Where data modules + slug helpers + static-route data belong.
---

# Data placement

- Per-content-type: \`src/features/<type>/data/<slug>.ts\`.
- Selectors (\`getXBySlug\`, \`getAllX\`): \`src/features/<type>/data/helpers.ts\`.
- Use \`@your-os/content-source\` (\`CodeContentSource\` adapter) to wrap data in pages, never import the raw module from a page.
- pSEO cells: \`@your-os/pseo-engine\` generates them at build time; never persist in CMS.
`,
  },
  {
    slug: "page-generator",
    family: "code",
    description:
      "Use @your-os/core page shells + @your-os/seo metadata helpers, never one-off layouts.",
    body: `---
name: page-generator
description: Create or update routes via @your-os/core shells.
---

# Page generator

Always use:
- \`StandardPageLayout\` from \`@your-os/core\` for content pages.
- \`ToolPageShell\` from \`@your-os/core\` for tools.
- \`generateGuideMetadata\` / \`generateToolMetadata\` from \`@your-os/seo\` for metadata.

Never reinvent layouts per route. If the shell can't express it, the shell needs to grow — file a \`@your-os/core\` issue.
`,
  },
  {
    slug: "repo-best-practices",
    family: "code",
    description: "Reuse-first, minimal-diff, config-driven implementation habits.",
    body: `---
name: repo-best-practices
description: Reuse-first, minimal-diff, config-driven habits.
---

# Repo best practices

- Read \`tenant.config.ts\` before adding constants. The OS injects everything tenant-specific.
- Reuse \`@your-os/core\` + \`@your-os/seo\` + \`@your-os/brand-lint\` selectors before writing new ones.
- Smallest-possible diff per PR. Mixed-scope PRs get split.
- Test what's worth testing. Algorithmic logic gets vitest; pure presentation gets Playwright in tenant E2E.
`,
  },
  {
    slug: "safe-refactor",
    family: "code",
    description: "Move files / extract helpers without changing user-visible behavior.",
    body: `---
name: safe-refactor
description: Refactor without behavior change.
---

# Safe refactor

- Capture a fixture for the helper before touching it.
- Refactor.
- Assert byte-equivalent output.
- Remove the old code only after one green release window.
`,
  },
];
