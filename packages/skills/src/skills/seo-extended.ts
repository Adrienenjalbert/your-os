import type { Skill } from "../catalog.js";

/**
 * Extended SEO skills (Wave 3 expansion, 2026 catalog).
 *
 * Added per the structured overhaul plan to bring the OS catalog from 16 → 22
 * skills. All skills cite primary sources first (web.dev, Search Central,
 * schema.org, Princeton GEO arXiv) and reference only real `@your-os/*`
 * packages and commands. See `your-os/SEO_OPERATING_STANDARDS.md` for the
 * binding doctrine and `.agents/rules/080-seo-operating-standards.md`
 * for the contributor binding rule.
 */
export const SEO_EXTENDED_SKILLS: Skill[] = [
  {
    slug: "seo-foundations",
    family: "seo",
    description:
      "Roll-up: when in doubt, this skill points to the binding 2026 doctrine and the most relevant operational skills.",
    body: `---
name: seo-foundations
description: Entry point — doctrine vs operational SEO skills in the your-os catalog (2026).
---

# SEO foundations

Start here when scope is unclear. **Doctrine** lives in **[SEO_OPERATING_STANDARDS.md](../../../../SEO_OPERATING_STANDARDS.md)**:

| Section | What it binds |
|--------|----------------|
| §2 | Definitions — SEO / AEO / GEO / LLMO as one OS |
| §3 | 3-tier measurement (eligibility → modeled AI share → business proxies) |
| §4 | Crawl, index, CWV, JS SEO basics ([web.dev vitals](https://web.dev/articles/vitals)) |
| §5 | JSON-LD hygiene, FAQ/HowTo restrictions, GEO vs schema |
| §6 | AI retrieval — citations, extractability, headings |
| §7 | Programmatic SEO, uniqueness, index quality |
| §8 | Bot planes — robots, llms.txt hints, telemetry |
| §9 | International + AI surfaces |
| §10 | **Brand-lint contract** — enforced vs aspirational |

## Operational skills (this package)

**Core (\`seo.ts\`):** \`seo-page-rules\`, \`schema-markup\`, \`ai-seo\`, \`site-architecture\`, \`intent-cta-match\`, \`international-seo\`, \`render-parity\`.

**Extended (\`seo-extended.ts\`):** \`seo-audit\`, \`bot-policy\`, \`entity-seo\`, \`cannibalization\`, \`index-health\`, \`tool-fit\`, \`programmatic-seo\`, \`content-refresh\`, plus this rollup.

## Enforcement you can run today

- \`pnpm exec your-os-brand-lint <path>\` — see [§10 — brand-lint](../../../../SEO_OPERATING_STANDARDS.md#10-brand-lint-contract)
- \`pnpm --filter @your-os/brand-lint test\` / \`pnpm --filter @your-os/seo build\` — package-scoped CI

**Packages:** \`@your-os/seo\` (metadata + JSON-LD), \`@your-os/brand-lint\`, \`@your-os/measurement\`, \`@your-os/refresh-engine\`, \`@your-os/pseo-engine\`, \`@your-os/ai-visibility\`, \`@your-os/tools-engine\`, \`@your-os/content-source\` — use each skill body for *when*, not phantom scripts.
`,
  },
  {
    slug: "seo-audit",
    family: "seo",
    description:
      "Run a sweep of indexation, internal links, schema validity, and citation density on a tenant before a release.",
    body: `---
name: seo-audit
description: Pre-release technical + quality sweep (manual + tenant CI).
---

# SEO audit

Use before major releases or tenant onboarding. **Wire checks in tenant CI and PR scripts** — future SEO audit automation has no dedicated OS package planned at this time; compose the checklist below with the real commands referenced in this skill. **Categorical framing:** [Moz — think about technical SEO](https://moz.com/blog/strategically-think-about-technical-seo) (MECE-style buckets) + this checklist.

## (a) Indexation

- Sitemap index reachable; individual sitemaps return 200 and list only canonical URLs.
- \`robots.txt\` allows crawl for production hosts; staged environments blocked or noindexed as intended.
- **Primary:** [Google — large sites / crawl budget](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget)

## (b) Render parity

- HTML snapshot (JS off) contains H1, primary entities, and crawlable \`<a href>\` internal links.
- Align with \`render-parity\` skill + [Google — JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

## (c) Internal links

- No critical orphan spoke pages (hub → spoke paths within 2 clicks where policy requires).
- [Google — crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)

## (d) Schema validity

- Spot-check templates with [Rich Results Test](https://search.google.com/test/rich-results).
- Use \`@your-os/seo\` builders (\`buildArticleJsonLd\`, \`buildOrganizationJsonLd\`, \`buildBreadcrumbJsonLd\`).

## (e) Brand-lint

\`\`\`bash
pnpm exec your-os-brand-lint path/to/content-file.ts
\`\`\`

Zero **block** issues before merge for paths wired in CI.

## (f) Core Web Vitals (lab gate)

- Run **Lighthouse** (tenant CI or local) against representative templates; compare to [web.dev — Vitals thresholds](https://web.dev/articles/vitals) (LCP / INP / CLS).

## Future

Orchestrating the checks above may consolidate in tenant tooling over time — today each tenant composes scripts from \`examples/*\` + CI. There is no OS-level audit orchestration package on the roadmap; keep using the steps in this skill and the package commands listed above.
`,
  },
  {
    slug: "bot-policy",
    family: "seo",
    description:
      "AI bot management: training crawlers vs retrieval crawlers vs user-initiated; robots.txt + verified-bot lists + optional llms.txt.",
    body: `---
name: bot-policy
description: Permission vs hints vs telemetry for AI and search bots (2026).
---

# Bot policy

Operate **three planes** (see [SEO_OPERATING_STANDARDS §8](../../../../SEO_OPERATING_STANDARDS.md#8-bot--crawler-policy-plane)):

1. **Permission** — \`robots.txt\`, vendor bot documentation.
2. **Readability hints** — optional \`llms.txt\` ([llmstxt.org](https://llmstxt.org/) — **not** a substitute for \`robots.txt\`).
3. **Telemetry** — WAF / CDN logs; [Cloudflare — verified bots](https://developers.cloudflare.com/bots/concepts/bot/verified-bots/); [Google — Web Bot Auth](https://developers.google.com/crawling/docs/crawlers-fetchers/web-bot-auth) (experimental).

**Never conflate** training opt-out with "removing" citations from AI answers — different user-agents and policies.

## Bot matrix (typical purpose — verify current vendor docs)

| User-agent / family | Typical purpose | Default *your-os* stance |
|--------------------|-----------------|---------------------------|
| \`Googlebot\` | Search index crawl | Allow (unless strategic block) |
| \`Google-Extended\` | Google AI / training surfaces | Allow — *review tenant policy* |
| \`GPTBot\` | OpenAI training crawl | Allow by default; block only with reason |
| \`OAI-SearchBot\` | Retrieval / search product fetch | Allow |
| \`ChatGPT-User\` | User-initiated fetches | Allow |
| \`ClaudeBot\` / \`Claude-Web\` / \`Anthropic-AI\` | Anthropic crawlers / retrieval | Allow; confirm [Anthropic — crawler](https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) |
| \`PerplexityBot\` / \`Perplexity-User\` | Perplexity index / user fetch | Allow; see [Perplexity — PerplexityBot](https://docs.perplexity.ai/guides/perplexitybot) |
| \`Bingbot\` | Microsoft search index | Allow |

**Primary bot docs:** [OpenAI — bots](https://platform.openai.com/docs/bots)

## Where policy lives

Root \`robots.txt\` in **tenant repo**; optional \`llms.txt\` at host root. Tenants on Cloudflare may add **Crawl Control** / custom rules on top.

Most growth tenants **want inclusion** in AI retrieval — document an explicit **deny** decision before blocking.
`,
  },
  {
    slug: "entity-seo",
    family: "seo",
    description:
      "Make the brand and its products knowable as entities — sameAs, knowledge-graph alignment, off-site corroboration.",
    body: `---
name: entity-seo
description: Entity graph, sameAs, E-E-A-T corroboration.
---

# Entity SEO

An **entity** is a machine-recognizable thing (brand, product, person) with stable identifiers. Goal: **one coherent graph** on-site + **corroboration** off-site.

## On-page / JSON-LD

- \`Organization\` (or \`Corporation\`, etc.) + \`sameAs\` for authoritative profiles — [schema.org/sameAs](https://schema.org/sameAs)
- Product/tool pages: types that match reality; keep names consistent with visible copy.
- Use \`@your-os/seo\` builders (\`buildOrganizationJsonLd\`, \`buildArticleJsonLd\`) — see package exports.

## Off-site corroboration (where eligible)

Wikipedia / Wikidata, Crunchbase, LinkedIn company page, YouTube channel, GitHub org — pick **verified** URLs only for \`sameAs\`.

## People / E-E-A-T

Every Article should attribute a real **Author** with credentials; populate \`sameAs\` where the author has verified profiles. **Quality raters** look for experience signals — [Google — Search Quality Rater Guidelines (PDF)](https://services.google.com/fh/files/misc/hsw-sqrg.pdf) (official PDF).

## Brand-fact consistency

One canonical statement for legal name, tagline, founding year, and **dollar amounts** across About, FAQ, footer. \`@your-os/brand-lint\` blocks **inconsistent slop patterns** and enforces **$ + citation** where dollar amounts appear in typed content.

**Framing reference (secondary):** [Backlinko — entity SEO](https://backlinko.com/entity-seo)

See also \`site-architecture\` for hub–spoke + topic ownership.
`,
  },
  {
    slug: "cannibalization",
    family: "seo",
    description:
      "Detect and resolve same-intent multi-page competition. Merge only when historic intent + aggregate-traffic gain justify it.",
    body: `---
name: cannibalization
description: Same-intent URL competition — detect, decide, merge with HITL.
---

# Cannibalization

**Cannibalization:** multiple URLs on the **same domain** compete for the **same search intent** and split equity. **Healthy overlap:** different intents (compare vs buy vs how-to) — different URLs are correct.

**Framing:** [Google on cannibalization (Mueller)](https://www.searchenginejournal.com/google-answers-seo-question-about-keyword-cannibalization/556472/); practitioner guide [Ahrefs — keyword cannibalization](https://ahrefs.com/blog/keyword-cannibalization/).

## Decision matrix

| Situation | Action |
|-----------|--------|
| Same intent, duplicate angles | **Merge** → keep stronger URL, **301** losers, rebalance internal links |
| Different intents (e.g. informational vs commercial) | **Keep both**; add **middleman** hub or cross-links clarifying role (Ahrefs pattern) |
| Mixed / ambiguous | **No auto-merge** — instrument and review |

## Detection

- GSC **query × page** overlap (export join), or vendor tools.
- \`@your-os/measurement\` **reconciliation** can expose when multiple URLs steal forecast credit — use as a signal, not the only one.

## Action

301 to the surviving URL, update internal links and sitemaps, monitor index coverage.

## Human-in-the-loop

**Rule 060:** cannibalization merges are an **event-driven HITL gate** — never fully automated merges in production workflows without sign-off.
`,
  },
  {
    slug: "index-health",
    family: "seo",
    description:
      "Distinguish crawl budget (discovered URLs vs crawled) from index bloat (indexed URLs with near-zero traffic).",
    body: `---
name: index-health
description: Crawl budget vs index bloat; remediate low-value indexed URLs.
---

# Index health

**Two different problems:**

1. **Crawl budget** — Google’s crawling priority for a host ([Google — large site crawl budget](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget)).
2. **Index bloat** — low-value URLs that sit in the index without meaningful return ([Moz — index bloat](https://moz.com/blog/what-is-index-bloat-whiteboard-friday)).

## Diagnostic

If **indexed pages** ≫ **pages with non-trivial clicks** in GSC → run a **zero-click URL** inventory. Large-scale context: [Ahrefs — search traffic study](https://ahrefs.com/blog/search-traffic-study/) (~96.55% of pages get no organic clicks — directional stat).

## Remediation order

1. **Fix** — broken templates, soft 404s, poisoned canonicals  
2. **Consolidate** — canonical to preferred URL  
3. **301** — definitive merge  
4. **404 / 410** — truly gone  
5. **noindex** — must remain on-site but not in index

## Link to refresh signals

**Staleness + thin templates** inflame bloat — \`@your-os/refresh-engine\` \`detectDecay\` flags \`dateModified\`, ranking deltas, ROOS deltas, and **source data drift** as refresh candidates (see package README).

**Expectations:** zero-click URLs are common at web scale — prioritize routes that **should** earn demand.
`,
  },
  {
    slug: "tool-fit",
    family: "seo",
    description:
      "Decide if an SEO opportunity ships as a tool (calculator, decision-tool, generator) vs an article. AI substitution resistance is the modifier.",
    body: `---
name: tool-fit
description: Tool vs article decision gate + tools-engine handoff.
---

# Tool fit

## Five-question test

1. Does the user need to **compute / decide / configure** something with **their inputs**? → bias **tool**.
2. Would an LLM answer reliably from **generic** text alone? → **commoditized article** risk; prefer **tool** when data + interaction are the moat.
3. Does the answer need **data we own or aggregate**? → **tool** (often pairs with \`@your-os/content-source\`).
4. Does the brand benefit from a **sticky utility** surface? → **tool**.
5. Is the input space **≤ ~8 fields** so UX stays shippable? If not, ship a **deep article + reference table** first.

## AI substitution resistance

When the *default* answer is a paragraph ChatGPT can hallucinate, **interactive + tenant data** wins. Framing (vendor): [Backlinko — SEO marketing hub](https://backlinko.com/hub/seo) for tool-vs-article program context — verify against your brief.

## OS handoff

- Implement tools via \`@your-os/tools-engine\` patterns in tenant apps (registry, calculator shells, validation).
- **Conceptual origin:** Career Hub’s \`seo/tool-fit\` parent skill — **do not** edit that repo here; this is the **your-os** catalog mirror.

See \`programmatic-seo\` when the ask is *many* URLs from one template.
`,
  },
  {
    slug: "programmatic-seo",
    family: "seo",
    description:
      "Programmatic SEO survives 2026 only with proven uniqueness × data depth × E-E-A-T. Thin synonym swaps fail at Google's quality threshold.",
    body: `---
name: programmatic-seo
description: pSEO prerequisites, pseo-engine gates, refresh coupling.
---

# Programmatic SEO (2026)

**Risk anchor:** Google’s **scaled content abuse** and spam-policy narrative ([Search Central — Mar 2024 core update & spam](https://developers.google.com/search/blog/2024/03/core-update-spam-policies)).

**Practitioner framing (secondary):** [Ahrefs — programmatic SEO](https://ahrefs.com/blog/programmatic-seo); [Eli Schwartz](https://www.elischwartz.co/) (product-led SEO doctrine — cross-check Search Central for enforcement language).

## Prerequisites before shipping a template

1. **Uniqueness:** \`@your-os/pseo-engine\` \`uniquenessRatio\` ≥ **0.7** across generated bodies (internal heuristic — not a Google score; see [SEO_OPERATING_STANDARDS §7](../../../../SEO_OPERATING_STANDARDS.md#7-programmatic--index-quality)).
2. **≥1 non-duplicative attribute block** per cell — local stat, mini-calculator, comparison table, or structured facts.
3. **Data depth** — proprietary join or non-obvious aggregation, not synonym swaps.
4. **E-E-A-T** aligned with the parent topic (authors, methodology, citations).

## Kill-gate

Halt net-new generation if rolling **7-day median uniqueness < 0.7** OR **fewer than 3 differentiated blocks** per typical cell.

## Decay

Pair with \`@your-os/refresh-engine\` for stale cells — zero-click risk: [Ahrefs — search traffic study](https://ahrefs.com/blog/search-traffic-study/).

## Schema

Use truthful \`SoftwareApplication\` / Article JSON-LD via \`@your-os/seo\` where applicable — **no** FAQ stuffing; follow [FAQ/HowTo 2023 policy](https://developers.google.com/search/blog/2023/08/howto-faq-changes).
`,
  },
  {
    slug: "content-refresh",
    family: "content",
    description:
      "Refresh decisions are signal-driven, not calendar-driven. Avoid date-stuffing (Mueller).",
    body: `---
name: content-refresh
description: Signal-driven refresh; material deltas; refresh-engine + measurement.
---

# Content refresh

**Principle:** refresh because **signals** fired, not because the calendar turned. Google has long discouraged **changing dates alone** to simulate freshness — treat **material improvement** as the bar ([Search Central — creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) anchors the *quality* expectation; avoid hollow updates).

## Triggers (composite)

Align with \`@your-os/refresh-engine\` \`detectDecay\`:

1. \`dateModified\` **>** ~**6 months** **and** ranking dropped **>** **5** positions in **30d** (primary query).
2. **Source data drift** — on-page figures reference an older BLS/IRS/etc. release than current.
3. **ROOS** down **>** **20%** vs **90d** baseline — via \`@your-os/measurement\` \`reconcileActuals\`.
4. **Freshness SLA** breached for the content class (tenant policy).

## Material delta (what counts)

At least **one** of:

- **New claim + citation** (stat, quote, or primary-source link)
- **Structural** change — rewritten H2 map, new section answering a new sub-question, updated worked example

**Not sufficient:** a date-only \`dateModified\` bump or superficial rephrase.

## AI-citation angle

AI-cited URLs skew **fresher** than organic SERPs by publish age in vendor studies ([Ahrefs — do AI assistants prefer fresh content?](https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content/) — ~25.7% skew). Prioritize **hot** AI-cited URLs **when** you have a **material** improvement — never date-stuffing.

## Packages

- **Signals + draft plans:** \`@your-os/refresh-engine\`
- **ROOS actuals / variance:** \`@your-os/measurement\`

Cross-link: \`index-health\`, \`programmatic-seo\`, \`ai-seo\`.
`,
  },
];
