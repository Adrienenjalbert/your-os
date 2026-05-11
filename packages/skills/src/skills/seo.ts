import type { Skill } from "../catalog.js";

export const SEO_SKILLS: Skill[] = [
  {
    slug: "seo-page-rules",
    family: "seo",
    description:
      "Editing public pages, metadata, canonicals, structured data — the always-on rules.",
    body: `---
name: seo-page-rules
description: Always-on rules for editing public pages, metadata, canonicals, JSON-LD, sitemaps, robots.
---

> See [SEO_OPERATING_STANDARDS.md](../../../../SEO_OPERATING_STANDARDS.md) §4 (technical baseline) and §5 (structured data hygiene) for the binding doctrine. This skill is the operational checklist.

# SEO page rules

- Every public page MUST have: unique \`<title>\` ≤ 70ch, meta description ≤ 160ch, canonical, primary schema JSON-LD.
- Title/snippet behavior aligns with Google's title-link system — see [Google Search Central — title link](https://developers.google.com/search/docs/appearance/title-link).
- Use \`@your-os/seo\` helpers; never hand-roll \`<head>\` tags.
- Canonical = production URL with trailing slash policy matching the rest of the tenant.
- \`noindex\` only via the tenant-supplied gate or explicit prop.
- Sitemap regenerates on build; new routes must be reachable from at least one crawled page.
- **Internal discovery:** reachability via internal link from at least one **hub** page within **2 clicks** (pillar/cluster navigation), not only sitemap inclusion.
`,
  },
  {
    slug: "schema-markup",
    family: "seo",
    description: "When and how to add JSON-LD structured data via @your-os/seo builders.",
    body: `---
name: schema-markup
description: JSON-LD structured data via @your-os/seo builders.
---

# Schema markup

**Disclaimer:** Schema/JSON-LD enables classical rich results (Google) and crawler-friendly graphs. It is **not** a guarantee of LLM citation — extractable text (statistics, quotations, citations) drives LLM citation per the Princeton GEO study ([arXiv:2311.09735](https://arxiv.org/abs/2311.09735)).

**FAQPage + HowTo** eligibility **contracted** after August 2023 — use sparingly and only where the page's primary content truly matches the schema type ([Google: FAQ/HowTo changes](https://developers.google.com/search/blog/2023/08/howto-faq-changes)). Avoid FAQ blocks that are disconnected from main content; that pattern is what the policy targets.

- Article pages → \`buildArticleJsonLd\` (exported by \`@your-os/seo\`).
- Org-wide → \`buildOrganizationJsonLd\` once in root layout.
- Breadcrumb on every page deeper than 1 → \`buildBreadcrumbJsonLd\`.
- Tool pages: \`SoftwareApplication\` where accurate ([schema.org/SoftwareApplication](https://schema.org/SoftwareApplication)); HowTo only when procedural steps are the page's core.
- Validate via [Google Rich Results Test](https://search.google.com/test/rich-results) before merge.

Structured-data policies: [Google SD policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).
`,
  },
  {
    slug: "ai-seo",
    family: "seo",
    description:
      "AI-search-ready pages: GEO/AEO/LLMO unified with classical SEO — evidence, headings, citations.",
    body: `---
name: ai-seo
description: GEO/AEO/LLMO operational checklist unified with classical SEO (2026).
---

# AI SEO

> See [SEO_OPERATING_STANDARDS.md](../../../../SEO_OPERATING_STANDARDS.md) §6 for the binding doctrine. This skill is the operational checklist.

## What it is

SEO, AEO, GEO, and LLMO are **one operating system**. Tactical deltas captured below.

**Sources:** Princeton GEO ([arXiv:2311.09735](https://arxiv.org/abs/2311.09735)); [Google Search Central — AI features in Search](https://developers.google.com/search/docs/appearance/ai-features); Ahrefs unification thesis ([GEO is just SEO](https://ahrefs.com/blog/geo-is-just-seo/)).

## Always-on rules (the foundation, identical to classical SEO)

- Crawlable HTML, indexable, render-parity (see \`render-parity\` skill).
- Schema appropriate to content type (Article / SoftwareApplication / Organization / Breadcrumb). FAQPage / HowTo only where eligible (see \`schema-markup\` skill).
- Title ≤70ch, meta ≤160ch, canonical, sitemap-reachable.

## Tactical deltas for AI surfaces

1. **Extractable evidence beats keyword density.** Add statistics, quotations, and inline citations. Princeton GEO experiments showed **+30–41%** relative gains on position-adjusted word count for \`Statistics Addition\`, \`Quotation Addition\`, \`Cite Sources\` vs unmodified baselines ([arXiv §4](https://arxiv.org/abs/2311.09735)).
2. **Citation portfolio, not single-URL heroics.** ~96% of Google AI Mode answers include ≥1 citation; many pull **10+** unique URLs ([Moz — AI Mode citations](https://moz.com/blog/ai-mode-citations)).
3. **Off-site authority counts.** Reddit / Wikipedia / YouTube transcripts often dominate ChatGPT citation mixes by vertical ([Semrush — AI search visibility](https://www.semrush.com/blog/ai-search-visibility-study-findings/)).
4. **Heading–question alignment.** H2/H3 should mirror probable query facets — focused beats kitchen-sink ([SEJ — shorter, focused content in ChatGPT](https://www.searchenginejournal.com/shorter-focused-content-wins-in-chatgpt/571857/)).
5. **Mid-page re-key.** Long pieces should restate entity names + key facts at the midpoint ([SEJ — why AI misreads the middle](https://www.searchenginejournal.com/why-ai-misreads-the-middle-of-your-best-pages/)).

## Wired enforcement (today)

- \`@your-os/brand-lint\` **blocks:** banned phrases, AI-slop patterns, **missing inline citation per dollar amount** (\`packages/brand-lint/src/lint.ts\`).
- \`@your-os/brand-lint\` **does not** today enforce: per-H2 statistic; DBA prevalence ≥ *N*%. Those are docs-only targets — see [SEO_OPERATING_STANDARDS.md §10](../../../../SEO_OPERATING_STANDARDS.md#10-brand-lint-contract).

## Disallowed

- Generating FAQs that don't match the page's actual content (Google's HowTo/FAQPage 2023 restriction targets exactly this).
- "Stuffing" the GEO paper's \`Authoritative\`-style tactic — it underperformed \`Statistics Addition\` and \`Cite Sources\` in their benchmark settings ([arXiv](https://arxiv.org/abs/2311.09735)).
- Treating schema as "how LLMs understand the page" — they ingest **text**.

## llms.txt

Optional, **hint-only** (not enforcement). See [SEO_OPERATING_STANDARDS.md §8](../../../../SEO_OPERATING_STANDARDS.md#8-bot--crawler-policy-plane). If shipped, list canonical hub pages only; **never** substitute for \`robots.txt\`.
`,
  },
  {
    slug: "site-architecture",
    family: "seo",
    description: "Page hierarchy, navigation, URL structure, internal linking.",
    body: `---
name: site-architecture
description: Hierarchy + URL structure + internal linking.
---

# Site architecture

- 3-tier topical model: Pillar → Cluster → Spoke. Every page belongs to exactly one cluster.
- URL structure mirrors the topic tree: \`/{pillar}/{cluster}/{spoke}\` (or flatter if intent allows).
- Hub pages link DOWN to all spokes; spokes link UP to hub + sideways to siblings.
- New content type → new pillar only if it has a clear cluster set; otherwise nest under existing pillar.

**Topical authority** is built by **sub-question coverage** and cluster internal linking, not single-keyword saturation — see [Ahrefs — topical authority](https://ahrefs.com/blog/topical-authority/) and keep **hub ↔ spoke** discipline above.

**Entity clarity:** same brand/product graph, corroboration, and \`sameAs\` discipline — see \`entity-seo\` skill.

**Internal links:** follow [Google — site structure & internal linking](https://developers.google.com/search/docs/crawling-indexing/links-crawlable) (crawlable links, sensible hierarchy).
`,
  },
  {
    slug: "intent-cta-match",
    family: "seo",
    description:
      "Match keyword intent to CTA type. Most common cause of low ROOS on a hub with 'good' rankings.",
    body: `---
name: intent-cta-match
description: Keyword intent → CTA archetype matching.
---

# Intent ↔ CTA match

Misalignment is the #1 reason a hub ranks but doesn't convert. \`@your-os/brand-lint\` funnel rule \`INTENT_CTA_MISMATCH\` (\`packages/brand-lint/src/funnel-rules.ts\`) supports this when wired by the tenant CI entrypoint.

## Decision rule

For every page, derive \`primaryKeywordIntent\` (informational_early | informational_problem_aware | commercial_investigation | transactional | navigational | tool_utility) and check primary CTA against \`tenant.config.funnel.intentMap\`.

| Intent                       | Primary CTA archetype                     |
|------------------------------|-------------------------------------------|
| informational_early          | guide_download OR newsletter             |
| informational_problem_aware  | tool_use OR calculator OR guide_download |
| commercial_investigation     | comparison_view OR demo_request          |
| transactional                | demo_request OR trial_start OR signup    |
| navigational                 | direct link, no gate                     |
| tool_utility                 | tool_use (must produce output)           |

## \`@your-os/measurement\`

Store intent on the brief; \`forecastRoos\` uses the brief's **search-intent class** (\`intent\` on brief signals — typically aligned with \`primaryKeywordIntent\`). \`reconcileActuals\` closes the loop vs GSC/GA4.

**Tier 3 attribution context:** business proxies (branded search lift, direct stability, **AI referrals in GA4** where attribution survives) ground intent → CTA fit when blue-link CTR drops as AI surfaces absorb informational demand — see [Semrush — attribution gap in agentic search](https://www.semrush.com/blog/attribution-gap-in-agentic-search/).

## Override

If SERP shows a different intent than implied by the keyword surface, use \`page.serpOverride: { intent: "X", evidence: "URL of competing page" }\` to bypass the lint. Override is logged and surfaced in the brief editor.

## How to derive intent (cheaply)

1. Top 3 SERP titles → if all "How to / What is / Best practices" → informational.
2. Top 3 SERP titles → if "Best X for Y", listicles, comparison → commercial_investigation.
3. Top 3 SERP titles → branded + product page → transactional.
4. SERP has free-tool result, calculator, generator → tool_utility.

References: [SEJ — Search intent SEO](https://www.searchenginejournal.com/search-intent/), [Ahrefs SEO funnel](https://ahrefs.com/blog/seo-funnel/).
`,
  },
  {
    slug: "international-seo",
    family: "seo",
    description: "hreflang, ccTLD vs subfolder, locale-aware sitemaps, content duplication checks.",
    body: `---
name: international-seo
description: International + multi-locale SEO.
---

# International SEO

When tenant ships in >1 locale.

## URL strategy (pick one, document in tenant.config.locales)

- **Subfolder** (\`example.com/fr/\`): default. Cheapest. Inherits domain authority. Use unless ccTLD is required.
- **Subdomain** (\`fr.example.com\`): only when separate hosting / ops team owns it.
- **ccTLD** (\`example.fr\`): only when local market trust requires it (regulated industries, e-commerce in some EU markets).

## hreflang

- Self-referencing on every locale variant.
- \`x-default\` on the canonical fallback locale (usually \`en\`).
- Bidirectional: A points to B → B must point back to A.
- **Tag generation** lives in **tenant code** today. \`@your-os/seo\` ships metadata + JSON-LD helpers (\`buildArticleJsonLd\`, \`buildOrganizationJsonLd\`, \`buildBreadcrumbJsonLd\`). A future \`@your-os/seo\` extension **may** add \`buildHreflangTags\` — track in [SEO_OPERATING_STANDARDS.md §9](../../../../SEO_OPERATING_STANDARDS.md#9-international--ai-surfaces).
- **Hints, not directives:** Google treats hreflang as signals; see [Google — localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions) and [SEJ — hreflang hints not directives](https://www.searchenginejournal.com/google-reminds-that-hreflang-tags-are-hints-not-directives/546428/).

## Sitemaps

- Per-locale sitemap (\`/sitemap-fr.xml\`) referenced from a **sitemap index** at \`/sitemap.xml\`.
- Each locale sitemap lists URLs for that locale only.
- **Generation** lives in **tenant code** today. Add a shared \`buildPerLocaleSitemap\`-style helper behind \`@your-os/seo\` as a follow-on if multiple tenants need the same implementation.

## Content duplication

- Same article translated → not duplicate when locales are substantive; pair with hreflang + local stats.
- Same article copy-pasted across locales (no translation) → duplicate risk. Localize currency, dates, and proof points.
- Pricing, dates, units must localize.

## AI / retrieval angle

**Substance per region** beats tag correctness for synthesis — locale citations, stats, and examples (see [SEJ — URL structures for AI retrieval](https://www.searchenginejournal.com/how-to-design-url-structures-for-ai-retrieval-not-just-rankings/571939/)).

## CWV per locale

CDN edge POP varies by region. Lighthouse runs once per locale in CI; budgets apply per-locale.

References: [Google — localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions), [SEJ — international SEO playbook](https://www.searchenginejournal.com/international-seo/).
`,
  },
  {
    slug: "render-parity",
    family: "seo",
    description:
      "SSR/ISR/Static/Edge: ensure crawlers see what users see. Fixes the #1 silent SEO killer in Next.js apps.",
    body: `---
name: render-parity
description: SSR vs CSR parity for crawlers.
---

# Render parity

**Render parity** is a **discipline**, not a packaged module. Operational checks are **per-tenant** (scripts in \`examples/*\`, CI). The discipline:

1. \`view-source:\` shows the H1, primary keyword in body, and **all internal links** without JS.
2. Disable JS in the browser → page still navigable, links clickable, primary CTA still present.

Symptom of failure: ranking drops with no algorithm update; GSC may show \`Discovered, not indexed\`.

## Checks in CI

Run a render-parity pass via the tenant's chosen tooling (e.g. Lighthouse **without** JS / HTML snapshot diff vs hydrated page; custom diff script in CI). **Do not** rely on undocumented package names — align with [SEO_OPERATING_STANDARDS.md §4](../../../../SEO_OPERATING_STANDARDS.md#4-technical-baseline-crawl-index-cwv).

**Primary reference:** [Google — JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

## Rendering strategy by page type

| Page type                  | Strategy                          | Why                                       |
|----------------------------|-----------------------------------|-------------------------------------------|
| Articles, guides           | Static (RSC at build) or ISR     | Stable content, max indexability          |
| Hub pages, taxonomy        | ISR                               | Refreshes when sub-content changes        |
| Tools (calculators)        | Static shell + RSC + island UI   | First paint indexable; interactivity client-side |
| Personalized dashboards    | Streaming SSR                     | Don't bother indexing; \`noindex\`          |
| Thin programmatic pages    | Static **only if** \`@your-os/pseo-engine\` uniqueness ratio ≥ **0.7**; else do not ship |

## Edge runtime gotchas

- \`fetch\` cache misses on Edge → page may render with stale data → mismatched content for crawler vs user. Use \`runtime = "nodejs"\` for SEO-critical routes when needed.
- Middleware that branches on \`User-Agent\` → cloaking risk. Block in code review.

## Forbidden patterns

- Client-side-only data fetch for primary content (indexing reliability often suffers — see [Google — JS SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)).
- \`<a onClick>\` instead of \`<Link href>\` for internal nav.
- Lazy-load below-the-fold content with no fallback for **primary** main content.

References: [SEJ — JavaScript SEO](https://www.searchenginejournal.com/javascript-seo/), [Next.js rendering docs](https://nextjs.org/docs/app/building-your-application/rendering).
`,
  },
];
