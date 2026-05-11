# @your-os/refresh-engine

Content-decay detector + refresh-PR drafter. Closes the **freshness loop** — the eighth step in the closed-loop diagram on the OS root README.

## What this package does

```ts
import { detectDecay, draftRefreshPlan } from "@your-os/refresh-engine";

const candidates = detectDecay({
  pages: [/* pages with dateModified, ranking delta, ROOS delta, source-data version */],
  weights, // optional override
  now: () => new Date(),
});

const plans = candidates.map((c) => draftRefreshPlan(c, tenant));
```

Each plan describes what to refresh (citations, statistics, internal links, schema), why (which decay signals fired), and how to materialize it:
- **code-mode**: a refresh-PR scaffold (file paths + change summary).
- **strapi-mode**: an OpportunityBrief patch (status: `refresh_draft`).

## Decay signals

A page is decayed if **any** of these are true:

1. `dateModified > 6 months ago`
2. `rankingDelta30d` < -5 positions for the primary query
3. `roosDelta90d` < -20% vs the 90-day baseline
4. `sourceDataVersion` is older than the current upstream release (e.g. BLS quarterly drop)

Each signal carries a weight; `decayScore` is the weighted sum (0..1+).

## What this package does NOT do

- Execute the PR (left to a CI adapter; see `apps/control-plane`).
- Talk to Strapi (the patch is shaped; the adapter applies it).
- Detect AI-search visibility decay (different signal — see `@your-os/ai-visibility`).

## Stability

`alpha`. v1 of this package is pure detection + drafting. v1.1 will couple to `@your-os/measurement` for ROOS-actuals input.
