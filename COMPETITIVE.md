# Competitive landscape

Six adjacent categories. For each: leaders, what they do well, where the Growth lead feels the gap, and what `your-os` does that they don't. **Updated quarterly.**

---

## 1. AI SEO content platforms

**Leaders:** [Surfer SEO](https://surferseo.com/), [Clearscope](https://www.clearscope.io/), [MarketMuse](https://www.marketmuse.com/), [Frase](https://www.frase.com/), [Jasper](https://www.jasper.ai/), [Writesonic](https://writesonic.com/).

**Positioning:** "Optimize drafts against SERP winners" — semantic terms, structure, scoring. Sometimes also draft generation.

**Strengths:** Fast feedback while writing. Shared score for editorial consistency. Doc/CMS integrations.

**Growth lead gap:** Score doesn't predict revenue. Multi-tenant governance (different brand/DBA per property) is manual or enterprise-contract. AI-search citation legibility is out of scope. Programmatic SEO at code level (templates, uniqueness gates, indexation waves) is not their core. No closed loop from content to ROOS.

**`your-os` differentiator:** Per-tenant `tenant.config.ts` codifies brand, pillars, personas, intent maps. Brand-lint enforces codified guardrails (banned phrases, AI-slop, dollar citations, funnel rules where wired). DBA prevalence remains a docs-only target until enforced ([rule 080](.agents/rules/080-seo-operating-standards.md)). ROOS reconciliation closes the loop.

---

## 2. Programmatic SEO stacks

**Leaders:** [Whalesync](https://whalesync.com/), Make/Zapier + Airtable, WordPress + Rank Math, custom Next.js stacks.

**Positioning:** Ship many URLs from structured data with less engineering than full product builds.

**Strengths:** Speed to page volume. Non-engineers can drive rows. Rank Math covers metadata/schema patterns for WP.

**Growth lead gap:** Governance (duplicate intent collapse, cannibalization) scales poorly without custom logic. AI citation and chunk retrieval need content + runtime thinking, not row expansion. Attribution still requires GA4 + CRM wiring. No agent OS.

**`your-os` differentiator:** `@your-os/pseo-engine` ships with uniqueness ratio gating, indexation thresholds, quality threshold per cell. Multi-tenant kernel + agent loop are first-class.

---

## 3. AI-search visibility tools

**Leaders:** [Profound](https://www.tryprofound.com/), Bluefish AI, [Otterly](https://otterly.ai/), [Peec AI](https://peec.ai/), AthenaHQ, Goodie.

**Positioning:** Share of voice in AI answers. Prompt tracking. Sometimes agent/crawler analytics.

**Strengths:** Make AI visibility legible to execs. Competitive prompts. Trends over time.

**Growth lead gap:** Causality is weak (non-deterministic models; see [SEJ — The ROI Problem With AI Traffic](https://www.searchenginejournal.com/the-roi-problem-with-ai-traffic-nobody-is-measuring-correctly/573638/) and [SEJ — The Whole Point Was The Mess](https://www.searchenginejournal.com/the-whole-point-was-the-mess/573977/)). Operational SEO (internal links, template fixes, CWV) stays outside. Revenue attribution is inference-heavy. Multi-hub = multiple workspaces, not unified code + guardrails.

**`your-os` differentiator:** AI-citation share reuses the same pillar/persona taxonomy as the rest of the OS. Brand-lint enforces dollar-amount inline citations; broader GEO citation-density rules remain editorial ([rule 080](.agents/rules/080-seo-operating-standards.md)). v1 imports vendor CSVs (Profound/Peec) — vendor-agnostic.

---

## 4. Topical authority / cluster tools

**Leaders:** [Keyword Insights](https://www.keywordinsights.ai/), ContentGecko, ClusterAI.

**Positioning:** Cluster keywords → content plans. Some map intent + hub/spoke.

**Strengths:** Faster IA + editorial roadmaps. Export to briefs.

**Growth lead gap:** Clusters are static SERP snapshots. Weak on ship velocity, template uniqueness, YMYL sourcing, AI-runtime constraints. Programmatic scale still hits engineering + quality walls.

**`your-os` differentiator:** Pillar/cluster live in `tenant.config.seo.pillars` + Strapi `Pillar` content-type. Cannibalization detection runs on every refresh. Intent enforcement runs on every brief.

---

## 5. SEO + content workflow platforms

**Leaders:** [Semrush ContentShake AI](https://www.semrush.com/news/310272-give-your-content-an-extra-seo-boost-with-contentshake-ai-new-feature/), [Ahrefs Content Explorer](https://ahrefs.com/content-explorer), Search Atlas.

**Positioning:** IDEA → draft → "SEO-optimized" inside a SEO suite. Or opportunity mining + outreach.

**Strengths:** Data adjacency (keywords, competitors) at workflow time. Lowers friction for marketers.

**Growth lead gap:** Document-centric. Hard to enforce repo-specific brand-lint or DBA rules. pSEO and tool pages need engineering, not just articles. AI answer ROI is misaligned with clicks. No closed loop to code + perf + attribution.

**`your-os` differentiator:** Content-source seam (`@your-os/content-source`) lets pages, sitemaps, ISR, and brand-lint flow through one interface. Suite tools own words; we own ship + measure.

---

## 6. Headless CMS + SEO

**Leaders:** [Sanity](https://www.sanity.io/) + Studio, [Strapi](https://strapi.io/) + plugins, [Contentful](https://www.contentful.com/) + marketplace apps.

**Positioning:** Editorial workflow + structured content + preview.

**Strengths:** Governed publishing. Localization. Role-based workflows.

**Growth lead gap:** SEO is a plugin mindset (meta fields, sitemaps) — not programmatic uniqueness, cannibalization police, or AI citation strategy. Performance and schema stay engineering-owned. Agent readiness (machine APIs, stable chunking surfaces) is not CMS-default.

**`your-os` differentiator:** Strapi is one supported backend, not the only one. The same `ContentSource` interface backs code-mode, Strapi-mode, and hybrid. Brand-lint runs as a Strapi `beforePublish` lifecycle hook AND in CI. Per-tenant Strapi instances preserve blast radius.

---

## The white space `your-os` claims

> The only **closed-loop, multi-tenant, agent-native operating system** that takes a Growth lead from **brief → code → CI gates → live metrics → email warm-up → ROOS attribution**, with brand + AI-search guardrails enforceable in CI and at the CMS lifecycle when configured, and human-in-the-loop only on decisions that actually need a human.

No incumbent in any of the six categories above ships **all five** of:

1. Per-tenant codified strategy in one typed object.
2. Closed-loop attribution that calibrates weekly.
3. AI-search legibility enforced at publish time.
4. Brand governance at the CMS lifecycle layer.
5. Multi-hub kernel with isolated blast radius.

That's the moat.

---

## 2026 signals

These signals inform [SEO_OPERATING_STANDARDS.md](SEO_OPERATING_STANDARDS.md) and the binding rule [`.agents/rules/080-seo-operating-standards.md`](.agents/rules/080-seo-operating-standards.md).

- **SEO + GEO + AEO + LLMO are one operating system, with tactical deltas** — the unification thesis is now consensus across vendor literature; the substantive evidence is the Princeton GEO benchmark study showing statistics, quotations, and inline citations drive ~30–41% relative visibility gains in generative engines ([`arxiv.org/abs/2311.09735`](https://arxiv.org/abs/2311.09735) §4).
- **AI answers cite portfolios, not single URLs** — Moz's AI Mode study finds ~96% of answers carry ≥1 citation and most pull 10+ unique URLs; only ~12% URL overlap with organic top-10 ([Moz AI Mode citations](https://moz.com/blog/ai-mode-citations)).
- **Off-site authority surfaces dominate citation mixes** — Reddit, Wikipedia, and YouTube outperform polished corporate pages in many ChatGPT prompts (Semrush AI Visibility study, [Semrush findings](https://www.semrush.com/blog/ai-search-visibility-study-findings/)).
- **Most brands win mentions OR trusted citations, not both** — Semrush data shows only 6–27% of top-mentioned brands also rank as top cited sources, depending on platform (same study).
- **Programmatic SEO survives only with proven uniqueness × data depth × E-E-A-T** — Google's March 2024 spam policy explicitly targets scaled-content abuse ([Google: core update & spam policies](https://developers.google.com/search/blog/2024/03/core-update-spam-policies)); 96.55% of pages still get zero Google traffic (Ahrefs [search traffic study](https://ahrefs.com/blog/search-traffic-study/)).
- **Attribution is multi-tier and humble** — Tier 1 (eligibility / crawlability) → Tier 2 (modeled AI Share-of-Voice + citations + perception) → Tier 3 (branded search lift, AI referrals, assisted conversions). GA4 alone misses AI influence ([Semrush: attribution gap in agentic search](https://www.semrush.com/blog/attribution-gap-in-agentic-search/)).
- **Bot policy is heterogeneous** — training crawlers (`GPTBot`, `Google-Extended`), retrieval crawlers (`OAI-SearchBot`, `PerplexityBot`), and user-fetch agents (`ChatGPT-User`) deserve distinct policies. Web Bot Auth is experimental future-proofing ([Google: Web Bot Auth](https://developers.google.com/crawling/docs/crawlers-fetchers/web-bot-auth)).

---

## How we update this doc

- **Quarterly review** by anyone shipping a competitive feature.
- **Source URLs cited inline** so the next reader can re-verify.
- **No marketing claims without evidence.** If a competitor ships a feature that closes one of our differentiators, we say so here.
- **PRs welcome** from anyone in the org or design partners.

Last updated: scaffold by initial v2 plan execution. Next review: when v1 ships to design partners.
