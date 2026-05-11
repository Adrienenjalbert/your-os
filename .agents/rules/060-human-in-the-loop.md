# Rule 060 — Human-in-the-loop

Always-on. Defines the five mandatory HITL checkpoints in the SEO content loop. Everything not listed here is autonomous.

## The five HITL gates

| # | Gate | Cadence | Decision the human owns | What agents do autonomously around it |
|---|---|---|---|---|
| 1 | **Portfolio gate** | Quarterly | Cluster portfolio, content-class balance, ROOS forecast assumptions | Rank opportunities, surface forecasts, model sensitivity |
| 2 | **Brief sign-off** | Per brief | Lock claim boundaries, intent-CTA decision, persona positioning | Draft brief skeleton, suggest citations, propose internal links, validate intent-CTA via brand-lint |
| 3 | **YMYL approval** | Per asset, conditional | Single accredited reviewer for finance/health/legal | Skipped for non-YMYL clusters; brand-lint runs unconditionally |
| 4 | **Cannibalization merge** | Event-driven (refresh-engine flags it) | Consolidate vs split decision when two URLs compete on same intent | Detect competing URLs, propose merge target + redirect map |
| 5 | **Monthly portfolio review** | Monthly | Narrative tying SEO output to pipeline + AI citation share + email warm-up performance | Draft narrative, propose next quarter's reweighting |

## What is autonomous (no human approval)

- Keyword clustering, SERP scrape, ICP enrichment.
- Opportunity ranking via `lift_per_effort`.
- Brief drafting (skeleton, citation seeds, internal-link suggestions).
- `brand-lint` at publish time: **banned phrases, AI-slop patterns, and missing inline citations on dollar amounts** (autonomous, blocking). DBA prevalence is a docs-only target; not enforced in code today (see [`.agents/rules/080-seo-operating-standards.md`](080-seo-operating-standards.md) §3 for the brand-lint contract). Intent-CTA match via caller-integrated funnel rules where wired.
- Sitemap ping, schema validation.
- Internal-link rebalancing on refresh.
- CWV regression detection.
- Decay scoring + refresh PR drafting.
- Performance write-back from GSC/GA4 to Strapi.
- Email sequence routing based on `funnel.intentMap` + persona tag.
- ROOS prediction-vs-actual reconciliation.
- Calibration weight updates.

## Forbidden agent behaviors

Without an explicit HITL gate, agents must NEVER:

- Publish content (Strapi `publish` is HITL #2 or #3).
- Merge content (cannibalization consolidation is HITL #4).
- Issue a redirect (paired with HITL #4).
- Disable a tenant integration (OAuth or token revocation requires explicit user action).
- Send an email to end-users (sequences are configured via `tenant.config.email.sequences`; new sequences require a human to author).
- Change `tenant.config.ts` without a PR.
- Promote an experiment winner (HITL gate when using an experiment registry (tenant-side or vendor-managed; not an `@your-os/*` package today)).
- Change the schema of a Strapi content-type in production (schema-as-code only; runs through the migration runner).

## How agents apply this

When proposing an action:
- Classify it: "is this in the autonomous list, or does it need a HITL gate?"
- If HITL gate: identify which of the five (or refuse to act).
- If autonomous: proceed but log the action so a human can audit.

When in doubt: **ask the human.** Bias toward the gate.

## Why this matters

Surveyed 2026 SEO industry guidance ([Search Engine Journal](https://www.searchenginejournal.com/category/seo/), [Ahrefs](https://ahrefs.com/blog/), [Backlinko](https://backlinko.com/), [Semrush](https://www.semrush.com/blog/)) is consistent: AI as copilot, human at the wheel for strategic decisions. The OS makes this concrete — five gates, no more, no less.
