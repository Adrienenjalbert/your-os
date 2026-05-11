import type { Skill } from "../catalog.js";

export const CONTENT_SKILLS: Skill[] = [
  {
    slug: "content-scout",
    family: "content",
    description:
      "Discover + validate new content opportunities. Considers SERP, prompts, AI surfaces, and intent before drafting.",
    body: `---
name: content-scout
description: Discover + validate new content opportunities. Considers SERP, prompts, AI surfaces, and intent before drafting.
---

# Content scout

> See [SEO_OPERATING_STANDARDS.md §6](../../../../SEO_OPERATING_STANDARDS.md#6-ai-retrieval--content-engineering) for the binding doctrine. This skill is the pre-draft validation checklist.

## Pre-draft checklist

### 1. SERP analysis (classical SEO baseline)
- Pull top 10 SERPs for the target keyword. Verify intent matches your content type (cite \`intent-cta-match\` skill).
- Note: SERP-feature mix (AI Overview, video carousel, PAA, featured snippet) — informs format choice.
- Cite Ahrefs SERP analysis framing: https://ahrefs.com/blog/serp-analysis/

### 2. Prompt-bank cross-check (AI-surface viability)
- Generate 5–10 prompt-shaped queries the page should answer (cite Moz fan-out: https://moz.com/blog/make-your-brand-discoverable-ai-search).
- Stratify prompts: brand / soft-brand / non-brand (Dr. Pete Meyers Moz: https://moz.com/blog/brand-bias-in-llm-prompts).
- For non-brand prompts in your topic: who currently gets cited in ChatGPT / Perplexity / Google AI Mode? List 3 incumbents. Plan a citation portfolio (own page + ≥2 third-party surfaces — listicle, Reddit thread, Wikipedia entry where eligible).

### 3. Coverage check (hub/spoke)
- Do you already have a page within 2 clicks of an existing hub? If yes, refresh — see \`content-refresh\` (in \`seo-extended\`).
- If net-new: which pillar + cluster does it belong to?

### 4. Demand-floor check
- Estimate monthly clicks at position 5 (use vendor KD/volume — Semrush, Ahrefs).
- For tools, use the \`tool-fit\` skill (in \`seo-extended\`) before scoping a tool.

### 5. Decision
- Net-new article: open a brief.
- Refresh: open a refresh task referencing \`content-refresh\`.
- Tool: hand off to \`tool-fit\` strategist gate.
- Drop: log reason (no demand, intent mismatch, AI-substituted).
`,
  },
  {
    slug: "content-writer",
    family: "content",
    description:
      "Write a Career Hub-style article as a TS data object, with QRIES proof + facet-aligned headings.",
    body: `---
name: content-writer
description: Write a Career Hub-style article as a TS data object, with QRIES proof + facet-aligned headings.
---

# Content writer

> See [SEO_OPERATING_STANDARDS.md §6](../../../../SEO_OPERATING_STANDARDS.md#6-ai-retrieval--content-engineering) for the binding doctrine. This skill is the authoring checklist.

## Required fields (TS data object)
title, slug, description, author, dateModified, pillarSlug, clusterSlug, personaIds, primaryKeywordIntent.

## Voice + brand
- Voice from \`tenantConfig.brand.voice\`.
- DBAs from \`tenantConfig.brand.distinctiveAssets\` — surface them in body. NOTE: \`@your-os/brand-lint\` does NOT today enforce DBA prevalence. The ≥80% Romaniuk-style target is a docs-only goal; see [SEO_OPERATING_STANDARDS.md §10](../../../../SEO_OPERATING_STANDARDS.md#10-brand-lint-contract). Authors should still aim for ≥80% prevalence by judgment.

## Body engineering (the 2026 deltas)

### QRIES proof per H2 (cite Backlinko \`https://backlinko.com/quality-seo-content\`)
Every H2 in money content carries ≥1 of:
- **Q**uote (with attribution)
- **R**esearch (study/paper with year)
- **I**mage / chart with caption
- **E**xample (concrete scenario)
- **S**tatistic with inline citation

\`@your-os/brand-lint\` enforces $-citation today (one inline citation per dollar amount); per-H2 statistic is docs-only.

### Facet-aligned headings (cite SEJ Indig \`https://www.searchenginejournal.com/shorter-focused-content-wins-in-chatgpt/571857/\`)
- H2/H3 strings must include the FACET phrases of likely prompts.
- Avoid kitchen-sink H2 ladders (covering everything once = covering nothing well).

### Mid-page re-key (cite SEJ Forrester \`https://www.searchenginejournal.com/why-ai-misreads-the-middle-of-your-best-pages/\`)
- Articles >1500 words: midpoint paragraph restates the entity name + 1-2 key facts.
- Survives "lost-in-the-middle" RAG retrieval.

### Citation density (Princeton GEO \`https://arxiv.org/abs/2311.09735\`)
- Statistics, quotations, citations are the GEO-paper-validated tactics that lifted visibility ~30-41%.
- Avoid "authoritative-sounding" filler — that method underperformed in the GEO benchmarks.

### Schema (delegated)
- See \`schema-markup\` skill. JSON-LD via \`@your-os/seo\` builders only.
- FAQPage / HowTo only when content actually matches the schema spec (Google restricted eligibility post Aug 2023).

## After writing
- Run \`pnpm exec your-os-brand-lint <file>\` — must pass with 0 blocks.
- Hand off to \`content-review\`.
`,
  },
  {
    slug: "content-review",
    family: "content",
    description:
      "Pre-merge quality + brand-lint gate, with prompt-bank QA for AI-visibility coverage.",
    body: `---
name: content-review
description: Pre-merge quality + brand-lint gate, with prompt-bank QA for AI-visibility coverage.
---

# Content review

> See [SEO_OPERATING_STANDARDS.md §6, §10](../../../../SEO_OPERATING_STANDARDS.md) for the binding doctrine. This skill is the pre-merge gate.

## Sequence

### 1. Brand-lint
\`pnpm exec your-os-brand-lint <file>\` → 0 blocks. (See [SEO_OPERATING_STANDARDS.md §10](../../../../SEO_OPERATING_STANDARDS.md#10-brand-lint-contract) for what's enforced.)

### 2. Schema validity
Validate any JSON-LD blocks via Google Rich Results Test (https://search.google.com/test/rich-results) before merge.

### 3. Lighthouse / CWV (per tenant CI)
- LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 at p75 per route type (cite https://web.dev/articles/vitals).
- Each tenant runs Lighthouse in CI with their own budgets; this skill lists the public thresholds, not a binding repo budget.

### 4. Prompt-bank QA (AI surface coverage)
For the prompts the article was scoped to answer (per \`content-scout\`):
- Brand prompt → does the page contain the brand fact accurately? (Per Dr. Pete Moz, brand prompts return brand mentions ~100% — table stakes.)
- Soft-brand prompt → can the page be excerpted as the answer? Verify lead paragraph + ≥2 facet-aligned H2 answers.
- Non-brand prompt → does the page have the proof artifacts (QRIES) that AI surfaces preferentially cite?

### 5. Cohesion
- Read paragraph 1 aloud — passes for an 8th-grade reader (Flesch-Kincaid grade ≤9 OR tenant-specific target).
- Mid-page re-key present for articles >1500 words.

### 6. Internal links
- ≥1 link to parent hub.
- ≥2 sibling-spoke links.
- Money pages: ≥1 inbound contextual link from a high-equity hub (the Middleman Method, cite Ahrefs https://ahrefs.com/blog/prioritize-internal-linking/).

### Merge / reject
Reject if any of: brand-lint block; schema invalid; CWV regression; prompt-bank QA fails on >1 prompt class.
`,
  },
];
