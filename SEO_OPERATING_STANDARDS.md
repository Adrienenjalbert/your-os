# SEO Operating Standards (your-os)

> Single source of truth for what `your-os` considers "doing SEO" in 2026. Binds every contributor to `packages/seo`, `packages/brand-lint`, `packages/skills/`, and the OS-contributor agent skills under `.agents/`. This document complements [MISSION.md](./MISSION.md) (the why) and [.agents/rules/050-growth-lead-priorities.md](./.agents/rules/050-growth-lead-priorities.md) (what counts as an outcome).

## 1. Purpose & scope

This document binds changes to **packages shipped in this workspace**: `packages/seo` (metadata and JSON-LD builders), `packages/brand-lint` (rule set and CLI), `packages/skills` (including `src/skills/seo*.ts`, `content.ts`, and related catalog entries), and **any new `@your-os/*` skill body** authored for OS contributors under `.agents/skills/`. If you touch those surfaces, you inherit the definitions, measurement doctrine, technical baselines, and brand-lint contract here.

It does **not** bind the parent Career Hub corpus at `../.agents/skills/seo/` (tenant-owned playbooks), free-form **tenant editorial choices** outside typed content modules, or product marketing outside repository fact. Cross-repo guidance may echo these standards; **enforcement paths are always the packages and CLI this repo actually ships.**

Verification norms for OS work are expressed with **real commands** installed in the workspace, for example `pnpm exec your-os-brand-lint` and `pnpm --filter @your-os/* test` / `pnpm --filter @your-os/* build` (package-scoped CI-style checks). Do not document or rely on scripts that are not declared in `package.json` manifests.

PR reviewers treat this file as a **contract**: skill edits that contradict tiered measurement, structured-data eligibility, or the brand-lint **enforced vs aspirational** table without an ADR should be sent back. Tenant repos may adopt subsets, but **kernel packages** must stay consistent or the multi-tenant story breaks.

## 2. Definitions (the SEO/AEO/GEO/LLMO unification)

**SEO, AEO, GEO, and LLMO** name facets of one operating system: **classical crawl/index eligibility and reputation** extended by **answer-layer and retrieval-shaped competition** (mentions, citations, bundles of sources). Tactics differ—*impressions vs URL citations*, *packaging for snippets vs long-context retrieval*, *off-site authority vs on-page copy*, *prompt-led mention maps vs HTML-first authority*—but the routing model is shared: **eligibility → packaging → measurement → business proxies**.

**AEO** stresses **answer-shaped copy** (concise satisfaction blocks). **GEO** stresses **generative citation and evidence** in benchmark and vendor narratives—anchor quantitative claims to Princeton’s definitions and methods on arXiv, not second-hand hype. **LLMO** (language-model optimization) is **not** a separate discipline—it's the **retrieval-and-citation** layer sitting above index eligibility; keep playbooks in one checklist rather than parallel rule silos.

Princeton’s GEO benchmark ([`arxiv.org/abs/2311.09735`](https://arxiv.org/abs/2311.09735)) treats generative answer settings as a distinct evaluation regime while remaining grounded in **creator-side text** and measurable nudges; industry framing often collapses the acronym stack into one mandate to stay technically sound in crawl/index work while improving **answer inclusion** ([Ahrefs: “GEO is just SEO”](https://ahrefs.com/blog/geo-is-just-seo/)). Use vendor pieces as **cross-checks**, not replacements for primary methodology in the paper.

**Working definitions for `your-os`:**

- **Citation (AI surface):** an assistant output that **includes a specific URL** (or source key resolving to one) for a claim. ([Moz AI Mode citation patterns](https://moz.com/blog/ai-mode-citations).)
- **Mention:** the brand or entity appears in generated text **without** a durable hyperlink—*seen* can outpace *trusted* as a dashboard concept ([Backlinko: Seen vs Trusted](https://backlinko.com/ai-search-strategy)).
- **Seen vs Trusted:** visibility of the name versus durable, citable **trust paths** (links, corroborating profiles, quotable stats). Same Backlinko reference.

## 3. Measurement doctrine (3-tier attribution)

Follow a **three-tier** story aligned with Semrush’s **attribution gap** framing for agentic and AI-mediated journeys ([Semrush: attribution gap](https://www.semrush.com/blog/attribution-gap-in-agentic-search/)):

1. **Eligibility & mechanics** — Crawl permission, indexation, canonical clarity, stable titles and snippets, structured graphs where eligible, and **Core Web Vitals** within documented thresholds ([`web.dev/articles/vitals`](https://web.dev/articles/vitals)). If a URL is not **eligible and fetch-clean**, upstream “AI share” is moot.

2. **AI Share-of-Voice, citations, perception** — **Modeled** signals from vendors or internal aggregations (prompt banks, CSV imports, rank-style indices). These are **not** GA truth. Ahrefs’ Brand Radar methodology is explicit about synthetic scoring limits ([Ahrefs: Brand Radar methodology](https://ahrefs.com/blog/brand-radar-methodology/)). **Mandatory disclaimer:** AI-visibility metrics are **modeled and instrument-dependent**, not universal analytics.

3. **Business proxies** — Branded search lift, direct traffic stability, **AI referrals in GA4** (where attribution survives), assisted conversions, pipeline stages tied in `tenant.config`. ROOS reconciliation lands in **`packages/measurement/`**; **`packages/ai-visibility/`** ingests vendor CSVs for rollups—**v1 does not imply live model crawling or scraping**.

**How to use the stack without lying:** Tier-1 fixes broken crawl, robots surprises, poisoned canonicals, and template outages. Tier-2 informs **portfolio** decisions (which prompts, which URLs earn mentions vs cites) but must carry the **modeled** disclaimer whenever vendor scores appear in exec readouts. Tier-3 closes the loop to revenue—if tier-2 “wins” never surface in tier-3 proxies over a sane window, revisit instrumentation before doubling prompts.

Treat cross-channel dashboards as **triangulated evidence**, never a single score.

## 4. Technical baseline (crawl, index, CWV)

**Core Web Vitals (field-style guidance):** Target **LCP ≤ 2.5 s**, **INP ≤ 200 ms**, and **CLS ≤ 0.1** at the aggregated “good” thresholds described by Chrome ([`web.dev/articles/vitals`](https://web.dev/articles/vitals)). **INP superseded FID** as the responsiveness metric in CWV reporting on **2024-03-12** ([`web.dev/blog/inp-cwv-march-12`](https://web.dev/blog/inp-cwv-march-12)).

**Rendering and index eligibility:** Google’s JavaScript SEO basics require that **meaningful content and links are discoverable** when rendering aligns with how Googlebot processes pages ([Search Central: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)). **Rule:** every **public route** must present **primary textual content without requiring client-side execution** for understanding—HTML carries the story; JS enhances. Tenant CI should fail when **primary body** is insertion-only via script for search-important pages—this standard is the **authoritative** statement; align any contributor “render parity” or HTML-snapshot checks with **§4**, not with undocumented package names.

**Lab vs field:** Lighthouse (lab) gates merge risk and catches regressions early; **CrUX**/**RUM** tells you whether real users see the **`web.dev` thresholds** ([`web.dev/articles/vitals`](https://web.dev/articles/vitals)). Repo-specific budgets may be stricter—document them beside CI, not instead of public CWV definitions.

**Index health** splits **crawl budget** management from **index bloat** (low-value URLs that consume attention without yield) ([Moz: index bloat](https://moz.com/blog/what-is-index-bloat-whiteboard-friday)). These are **two levers**, not one “crawl fixes everything” knob. Internal linking, faceted URL governance, and `noindex` discipline often beat “more crawls” when bloat is the diagnosis.

## 5. Structured data hygiene

Author **JSON-LD first**, using builders from **`@your-os/seo`** such as `buildArticleJsonLd`, `buildOrganizationJsonLd`, and `buildBreadcrumbJsonLd` (see package exports). For calculators and tools, prefer **`SoftwareApplication`** where factually accurate ([Schema.org `SoftwareApplication`](https://schema.org/SoftwareApplication); [Google structured-data guidance](https://developers.google.com/search/docs/appearance/structured-data/software-app)).

**FAQPage** and **HowTo** rich-result eligibility **contracted materially after August 2023**—treat both as **restricted-eligibility** types, not generic boosters ([Google: FAQ/HowTo changes](https://developers.google.com/search/blog/2023/08/howto-faq-changes)). Follow Google’s **structured-data policies** for editorial and technical requirements—JSON-LD is preferred for maintainability ([Google: structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)). Validate with Google’s **Rich Results Test** before merge on templates you change.

**Truthful GEO alignment:** Princeton GEO’s reported lifts used **extractable textual evidence**—statistics, quotations, and citations—**not schema tricks** ([arXiv §4 discussion](https://arxiv.org/abs/2311.09735)). JSON-LD remains **classical rich-result/graph hygiene**, not a contract for LLM citation. **Schema ≠ retrieval guarantee:** machine-readable graphs help **search features** and ecosystem clarity; generative systems still **ground** on visible text and broader corpuses they can fetch or retrieve.

## 6. AI retrieval & content engineering

**Citation portfolio:** Moz observed **~96%** of AI Mode answers include **≥1 citation**, often **10+ unique URLs** per response ([Moz: AI Mode citations](https://moz.com/blog/ai-mode-citations)). Plan **portfolios**—owned URLs **plus** third-party surfaces (community threads, YouTube, Wikipedia where appropriate, listicles, PR)—rather than betting on a single canonical page.

**Extractability over raw length:** Build **facet-aligned headings** (probable query facets), keep H2s **declarative**, and aim for **≈40–80 word** answer cores per H2 where feasible ([SEJ: shorter, focused content](https://www.searchenginejournal.com/shorter-focused-content-wins-in-chatgpt/571857/)). **Mid-page clarity** matters—models may underweight centers of long documents; **restate entities and key facts** at the midpoint ([SEJ: why AI misreads the middle](https://www.searchenginejournal.com/why-ai-misreads-the-middle-of-your-best-pages/)).

Per GEO, **statistics, quotations, and cited sources** beat **keyword stuffing** in their benchmark settings with roughly **30–41%** relative gains in their reported generative-setting metrics (methods and domains vary; read §4 of the paper rather than quoting a single headline percentage) ([arXiv GEO](https://arxiv.org/abs/2311.09735)). The closest **code-enforced GEO-aligned rule** in-repo today is **`@your-os/brand-lint`’s** **missing `$` citation** gate for dollar amounts in typed content paths (`packages/brand-lint/src/lint.ts`).

**Editorial tension to manage:** retrieval systems may reward **broad topical fan-out** on some queries while **tight, facet-matched** pages win citations on others—plan in portfolios and measured tests rather than declaring a universal “long wins / short wins” law ([SEJ: shorter, focused content](https://www.searchenginejournal.com/shorter-focused-content-wins-in-chatgpt/571857/) vs multi-source behavior in [Moz: AI Mode citations](https://moz.com/blog/ai-mode-citations)).

## 7. Programmatic & index quality

Survivable **programmatic SEO** in 2026 requires: **(a)** **data depth**—proprietary joins or non-trivial aggregation; **(b)** **template uniqueness**—internal heuristic **≥ 0.7** in `packages/pseo-engine/src/uniqueness.ts` (treat as **internal metric**, not a Google score—aspirational **0.80+** tiers appear in practitioner glossaries as *internal QC*, not guarantees from Google); **(c)** **per-cell substantive value**, not synonym churn alone. Anchor risk management to Google’s **March 2024** spam-policy narrative, including **scaled content abuse** framing ([Search Central: core update & spam policies](https://developers.google.com/search/blog/2024/03/core-update-spam-policies)). Pair **product-led** (data + UX differentiation) sequences from modern practitioner narratives—always secondary to Search Central for enforcement language.

**Zero-click presumption:** an indexed page that earns **~zero clicks for ≥90 days** behaves like **index dilution risk** in aggregate studies ([Ahrefs: search traffic study](https://ahrefs.com/blog/search-traffic-study/) reports **96.55%** of pages get **no** Search clicks—use as directional, not a deterministic per-URL rule).

**Refresh-engine signals** (`packages/refresh-engine/`) include **stale `dateModified` (>6 months)**, **rank drop >5 positions over 30 days**, **authoritative dataset drift** (e.g., BLS/IRS releases), and **ROOS decline >20% vs a 90-day baseline**—composite gating avoids noisy one-off edits.

## 8. Bot & crawler policy plane

Operate three **distinct** planes—**permission** (`robots.txt` and vendor-specific bot docs), **readability hints** (optional `llms.txt`), and **telemetry** (e.g., WAF/AI crawl logs). **Do not conflate** **training opt-out** with **answer-surface** visibility—different user-agents and policies apply.

| Plane | Role |
|---|---|
| **Permission** | Publisher-declared crawl rules; verify vendor bot families individually ([OpenAI bots](https://platform.openai.com/docs/bots), [Anthropic crawler](https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), [Perplexity](https://docs.perplexity.ai/guides/perplexitybot)). |
| **Hints** | [`llms.txt`](https://llmstxt.org/) is an **informal hint**—**not** a substitute for **`robots.txt`** enforcement. |
| **Telemetry & future-proofing** | Monitor logs; track emerging **verified bot** standards ([Cloudflare verified bots](https://developers.cloudflare.com/bots/concepts/bot/verified-bots/)) and Google’s **experimental Web Bot Auth** ([Google: Web Bot Auth](https://developers.google.com/crawling/docs/crawlers-fetchers/web-bot-auth)). IndexNow is a **ping** protocol, orthogonal to permissions ([IndexNow](https://www.indexnow.org/documentation)). |

## 9. International + AI surfaces

**`hreflang` is a hint**, not a directive—Google may still select versions by aggregate signals ([Search Central: localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)). For AI surfaces, **`hreflang` alone is insufficient**: ship **substance per region**—translation quality, locale-appropriate statistics, and local citations.

Operational checklist for tenants that opt in: **per-locale sitemap entries**, **per-locale performance audits in CI**, and metadata parity via **`@your-os/seo`** helpers. **There is no `buildHreflangTags` export** today—generate tags in tenant **code**, or add a tracked builder behind an ADR—**do not document phantom exports**.

**Substance beats signals:** for answer engines, **locale-appropriate examples, citations, and statistics** outperform machine-translated shells—treat international SEO under AI retrieval as **content operations**, not only tag injection ([Google: localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)).

## 10. Brand-lint contract (enforced vs aspirational)

| Status | What it means today |
|---|---|
| **Enforced (CLI)** | In `packages/brand-lint/src/lint.ts`: **banned phrases** (**Block**), **AI-slop patterns** (**Block**), **missing `$`-citation** per dollar amount (**Block**), **missing component-name signals** on Article paths (**Warn**). **Funnel rules** live in `funnel-rules.ts` (**library**): `INTENT_CTA_MISMATCH`, `TOOL_GATE_WITHOUT_SERP_CHECK`, `NURTURE_ORPHAN_SIGNUP`, `BOFU_HEAVY_NEW_HUB`—**caller-integrated**, not silently universal in all CI entrypoints. Run **`pnpm exec your-os-brand-lint`** in PR workflows that wire it. |
| **Aspirational / docs-only** | **DBA prevalence ≥80%** (Romaniuk-style) is a **documentation and roadmap target** surfaced via `tenantConfig.brand.distinctiveAssets`; **`rules.ts`** has deferred prevalence enforcement—**not** CMS-level blocking today. **GEO “1 statistic per H2”** is **not** enforced by `lint.ts` despite exploratory patterns—treat as **editorial guidance** until wired. **Strapi `beforePublish` enforcement** remains **specified**, not guaranteed by this repo alone. |

**ADR rule:** Promoting an aspirational item to **Block** requires an **ADR** and explicit code/tests—link the ADR from this document when filed.

**Vision alignment:** *DBA prevalence is a **docs-only target***; **`brand-lint` enforces banned phrases, AI-slop, and dollar-citation rules**—**do not claim CMS-level DBA blocking until implemented.**

## 11. Phantom-package rule (binding for OS contributors)

No skill body, README, or `your-os/**/*.md` may reference an **`@your-os/*` package** or **`pnpm`** script **unless** declared in workspace manifests. **Forbidden placeholder strings** surfaced by audit—**grep and reject on PRs**:

- `@your-os/render-parity`, `@your-os/sitemap`, `@your-os/seo-foundations`, `@your-os/web-vitals`
- **`buildHreflangTags`** as if exported from `@your-os/seo` without code
- **`seo-health`**, **`pnpm seo:audit`**

Describe **capabilities** (SSR parity, sitemap ownership, foundations doc, performance budgets) using **this document** and **real packages**—or file an ADR and ship code.

The normative rule will also live under **[`.agents/rules/080-seo-operating-standards.md`](./.agents/rules/080-seo-operating-standards.md)** (Gen 4). **Exception:** standards may name blocklisted strings **only** to forbid them.

## 12. Sources appendix

Pinned references for deep-linking:

1. [`https://web.dev/articles/vitals`](https://web.dev/articles/vitals) — CWV thresholds  
2. [`https://web.dev/blog/inp-cwv-march-12`](https://web.dev/blog/inp-cwv-march-12) — INP replaces FID (2024-03-12)  
3. [`https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics`](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) — JS SEO basics  
4. [`https://developers.google.com/search/blog/2024/03/core-update-spam-policies`](https://developers.google.com/search/blog/2024/03/core-update-spam-policies) — Spam policies (Mar 2024)  
5. [`https://schema.org`](https://schema.org) — Schema.org root  
6. [`https://schema.org/SoftwareApplication`](https://schema.org/SoftwareApplication) — Tool type  
7. [`https://developers.google.com/search/blog/2023/08/howto-faq-changes`](https://developers.google.com/search/blog/2023/08/howto-faq-changes) — FAQ/HowTo eligibility shift  
8. [`https://arxiv.org/abs/2311.09735`](https://arxiv.org/abs/2311.09735) — Princeton GEO (KDD; arXiv)  
9. [`https://backlinko.com/ai-search-strategy`](https://backlinko.com/ai-search-strategy) — Seen & Trusted  
10. [`https://moz.com/blog/ai-mode-citations`](https://moz.com/blog/ai-mode-citations) — AI Mode citation portfolio stats  
11. [`https://moz.com/blog/what-is-index-bloat-whiteboard-friday`](https://moz.com/blog/what-is-index-bloat-whiteboard-friday) — Index bloat vs crawl budget  
12. [`https://www.semrush.com/blog/attribution-gap-in-agentic-search/`](https://www.semrush.com/blog/attribution-gap-in-agentic-search/) — Attribution gap framing  
13. [`https://ahrefs.com/blog/geo-is-just-seo/`](https://ahrefs.com/blog/geo-is-just-seo/) — GEO≈SEO synthesis  
14. [`https://ahrefs.com/blog/brand-radar-methodology/`](https://ahrefs.com/blog/brand-radar-methodology/) — Modeled visibility limits  
15. [`https://llmstxt.org/`](https://llmstxt.org/) — `llms.txt` hint format  
16. [`https://platform.openai.com/docs/bots`](https://platform.openai.com/docs/bots) — OpenAI bots  
17. [`https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler`](https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) — Anthropic crawler  
18. [`https://docs.perplexity.ai/guides/perplexitybot`](https://docs.perplexity.ai/guides/perplexitybot) — Perplexity bot  
19. [`https://developers.google.com/crawling/docs/crawlers-fetchers/web-bot-auth`](https://developers.google.com/crawling/docs/crawlers-fetchers/web-bot-auth) — Web Bot Auth (experimental)  
20. [`https://developers.google.com/search/docs/specialty/international/localized-versions`](https://developers.google.com/search/docs/specialty/international/localized-versions) — hreflang hints  
21. [`https://developers.cloudflare.com/bots/concepts/bot/verified-bots/`](https://developers.cloudflare.com/bots/concepts/bot/verified-bots/) — Verified bots  
22. [`https://www.indexnow.org/documentation`](https://www.indexnow.org/documentation) — IndexNow specification  
23. [`https://www.searchenginejournal.com/shorter-focused-content-wins-in-chatgpt/571857/`](https://www.searchenginejournal.com/shorter-focused-content-wins-in-chatgpt/571857/) — Facet-aligned brevity  
24. [`https://www.searchenginejournal.com/why-ai-misreads-the-middle-of-your-best-pages/`](https://www.searchenginejournal.com/why-ai-misreads-the-middle-of-your-best-pages/) — Mid-page clarity  
25. [`https://ahrefs.com/blog/search-traffic-study/`](https://ahrefs.com/blog/search-traffic-study/) — Zero-click study context  
26. [`https://developers.google.com/search/docs/appearance/structured-data/sd-policies`](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) — Structured-data policies  

_Last updated: 2026-05-08. Update via the OS-contributor rule [.agents/rules/080-seo-operating-standards.md](./.agents/rules/080-seo-operating-standards.md)._
