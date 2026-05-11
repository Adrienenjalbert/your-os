---
name: configurator-prompt-design
description: Patterns for the configurator's AI Research chains and golden-set evaluation harness.
---

# Configurator prompt design

## Phase 4 chains

Each AI Research chain produces a structured output (Zod-validated) consumed by Phase 3 confirmation UI. Chains are independent — a failure in one doesn't fail the whole research phase, just degrades that section.

| Chain | Input | Output | Grounding source |
|---|---|---|---|
| SERP scrape | seed keywords | top-20 URLs per query | SerpAPI / DataForSEO |
| Keyword cluster | seed terms | clusters by intent | Semrush/Ahrefs API or PAA scrape |
| Competitor sitemap | competitor URLs | content-type catalog | sitemap parser |
| ICP/persona | tenant brief + competitor copy | 3-5 persona cards | LLM + RAG over scraped competitor copy |
| DBA proposer | tenant brief + competitor anti-patterns | 5-8 DBAs | LLM + competitor frequency analysis |
| Pillar map | clusters + ICPs | 4-8 pillars + clusters | rules-based composition |
| Schema selector | industry tag | primary schema type | rules table |
| Tool-fit scan | top queries | 5-question pass/fail | rules-based |

## Golden-set evaluation

Maintain `tooling/golden-set/` with 10 reference outputs from real sites we admire. Each PR to a configurator chain runs against the golden set and reports diff. Regressions on >2 of 10 fail the PR.

## Round-trip gate

The week-12 hard gate: configurator must produce Career Hub's `tenant.config.ts` from a guided session. Tolerance:

- DBAs match ≥80% (Jaccard similarity).
- Pillars match exactly (slugs).
- Personas semantically equivalent (cosine ≥0.85 on embedding of description).

Fixture: `tooling/golden-set/career-hub-roundtrip/`.
