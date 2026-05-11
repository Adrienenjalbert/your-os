---
"@your-os/refresh-engine": minor
"@your-os/ai-visibility": minor
---

v2 strategic upgrade — new packages.

- `@your-os/refresh-engine` (new): content-decay detector. Composes 4 signals (`stale-date-modified`, `ranking-drop`, `roos-drop`, `stale-source-data`) into a weighted decayScore; drafts code-mode refresh-PR scaffolds or strapi-mode OpportunityBrief patches via `draftRefreshPlan`. The freshness step of the closed loop.
- `@your-os/ai-visibility` (new): v1 = manual CSV import from Profound / Peec exports + per-pillar / per-persona aggregation + WoW delta helpers. Vendor-agnostic. In-house scraping is deferred to v2 once design partners confirm citation share matters.
