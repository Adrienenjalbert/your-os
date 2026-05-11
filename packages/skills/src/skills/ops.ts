import type { Skill } from "../catalog.js";

export const OPS_SKILLS: Skill[] = [
  {
    slug: "brand-lint",
    family: "ops",
    description: "DBA prevalence + banned-phrase + AI-slop + GEO citation density check.",
    body: `---
name: brand-lint
description: DBA + banned-phrase + AI-slop + citation density.
---

# Brand lint

Run \`pnpm exec your-os-brand-lint --staged\` in lefthook pre-push. Run \`--all --budget N\` in CI to gate against regressions.

Block conditions: banned phrase, AI-slop pattern, dollar amount missing inline citation.
Warn: missing AuthorByline / DataSourceCitation / ContentFreshness in articles.
`,
  },
  {
    slug: "performance",
    family: "ops",
    description: "CWV budgets, image optimization, bundle size hygiene.",
    body: `---
name: performance
description: CWV + bundle hygiene.
---

# Performance

Per-route p75 budgets from \`tenantConfig.performance.budgets\`:
- LCP ≤ 2500ms, INP ≤ 200ms, CLS ≤ 0.1.

Always:
- Next \`<Image>\` not raw img.
- Async fonts with \`display: swap\`.
- No large client components for above-the-fold content.
- Lighthouse runs in CI; regressions block merge.
`,
  },
  {
    slug: "accessibility",
    family: "ops",
    description: "WCAG 2.2 AA: keyboard, semantics, labels, contrast.",
    body: `---
name: accessibility
description: WCAG 2.2 AA enforcement.
---

# Accessibility

- Every interactive element keyboard-reachable + focus-visible.
- Color contrast ≥ 4.5:1 body, 3:1 large text.
- Form inputs always have \`<label>\`.
- Heading hierarchy never skips levels.
- axe in CI on representative routes.
`,
  },
  {
    slug: "analytics-tracking",
    family: "ops",
    description: "Use @your-os/analytics; never re-instrument conversion events.",
    body: `---
name: analytics-tracking
description: Use @your-os/analytics for all tracking.
---

# Analytics tracking

- Conversion event = \`tenantConfig.conversion.eventName\`. Never hardcode in components.
- Use \`createAnalytics({ tenant, transports })\` once at app boot; share via context.
- UTM parameters extracted via \`extractAttribution\` and persisted in a session-scoped store.
- Never block render on tracking; \`Promise.resolve().then(...)\` after click.
`,
  },
  {
    slug: "cross-channel-attribution",
    family: "ops",
    description:
      "Reconcile organic, paid, email, direct, AI-search into one ROOS view. Prevents organic credit going to last-touch paid.",
    body: `---
name: cross-channel-attribution
description: Multi-touch attribution for ROOS.
---

# Cross-channel attribution

The Growth Lead can't trust a single-channel ROOS number. \`@your-os/measurement\` reconciles, this skill explains the policy.

## Default model

- **Last non-direct touch** for primary conversions in GA4 (default channel grouping).
- **First-touch organic** when measuring ROOS for SEO content. Override default GA4.
- **Position-based 40/20/40** (first-touch + middle + last-touch) when modeling pipeline contribution.

Document the chosen model in \`tenant.config.measurement.attribution.model\`. Don't switch silently.

## Channels mandatory

Track via \`@your-os/analytics\` with these source/medium pairs:

| Channel       | Detection rule                          |
|---------------|-----------------------------------------|
| organic       | \`utm_source=google\` AND \`utm_medium=organic\` OR referer=google.com without gclid |
| paid_search   | \`gclid\` present OR \`utm_medium=cpc\`     |
| paid_social   | \`fbclid\` / \`utm_medium=paid_social\`     |
| email         | \`utm_medium=email\` (from sequence templates) |
| ai_search     | referer=chatgpt.com / perplexity.ai / search.brave.com / claude.ai (allowlist in \`@your-os/ai-visibility\`) |
| direct        | no referer + no UTM                     |

## Cross-attribution view

Weekly digest must show:
- Conversions per channel (raw count + share).
- Conversions where organic was first-touch but another channel was last-touch (assist count).
- AI-search referrals (separate, currently undercounted in GA4).

## Forbidden

- Reading "Organic = 0" in GA4 default and concluding SEO doesn't work. AI traffic is mis-bucketed; check \`@your-os/ai-visibility\`.
- Shipping a tenant config without \`measurement.attribution.model\` set explicitly.
- Treating GSC clicks as conversions. Clicks are not conversions.

References: [SEJ — Multi-touch attribution](https://www.searchenginejournal.com/multi-touch-attribution/), [Avinash Kaushik on MCF](https://www.kaushik.net/avinash/multi-channel-attribution-modeling-good-bad-ugly-models/).
`,
  },
  {
    slug: "verification-checklist",
    family: "ops",
    description: "Pre-merge gate: lint, typecheck, test, build, brand-lint, lighthouse.",
    body: `---
name: verification-checklist
description: Pre-merge verification gate.
---

# Verification checklist

Before requesting review:

1. \`pnpm lint\`
2. \`pnpm typecheck\`
3. \`pnpm test\`
4. \`pnpm build\`
5. \`pnpm exec your-os-brand-lint --staged\` (or \`--all\` if touching content)
6. Lighthouse on preview deploy (auto-runs in CI)
7. Updated CHANGELOG/Changeset entry if you changed an \`@your-os/*\` package.
`,
  },
];
