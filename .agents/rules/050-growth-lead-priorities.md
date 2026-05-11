# Rule 050 — Growth lead priorities

Always-on. Every change in `your-os` must serve the primary persona — a Growth/Performance Marketing lead who owns ROOS and pipeline. See [AUDIENCE.md](../../AUDIENCE.md).

Companion rule: [080-seo-operating-standards.md](080-seo-operating-standards.md) binds contributor behavior when changing SEO-related code or docs; the substantive doctrine lives in [SEO_OPERATING_STANDARDS.md](../../SEO_OPERATING_STANDARDS.md).

## The four north-star outcomes

Every code change, schema change, or doc change must move at least one of:

1. **ROOS** (modeled organic conversions) — predicted at brief time, reconciled at 30/60/90.
2. **Indexation** — pillar coverage, AI-crawler accessibility, schema validity.
3. **AI-citation share** — share of voice in ChatGPT / Perplexity / Claude / Gemini / AI Mode answers.
4. **Pipeline conversion** — primary `tenant.config.conversion.eventName` event count and downstream CRM stage progression.

If a change moves none of these, ask: "Why are we shipping this?"

## Forbidden patterns

- **Ranking-vanity changes.** "This will rank better" without a downstream metric tie. Ranking is a leading indicator, not an outcome.
- **AI panels that show off the AI.** If the user has to click through an AI explanation that doesn't change their decision, cut it.
- **Reports without benchmarks.** A number with no benchmark is noise. Every chart in the console must show comparison (week-over-week, vs forecast, vs peer pillar).
- **Tools added without a micro-conversion definition.** A tool that doesn't write to the funnel layer is an orphan.
- **Documents without "what action does this enable."** Every README, skill, and rule answers: "what should the reader do differently after reading this?"

## Required patterns

- **Every brief carries a ROOS forecast band.** `@your-os/measurement` provides this. The brief editor displays it.
- **Every published page emits at least one micro-conversion event.** Defined in `tenant.config.funnel.microConversions`. Enforced by `@your-os/brand-lint` funnel rules library (`packages/brand-lint/src/funnel-rules.ts` — the rule IDs `INTENT_CTA_MISMATCH`, `TOOL_GATE_WITHOUT_SERP_CHECK`, `NURTURE_ORPHAN_SIGNUP`, `BOFU_HEAVY_NEW_HUB`). The funnel rule library is caller-integrated; tenant CI invokes the API.
- **Every weekly digest opportunity is tied to a pillar and an intent class.** Surfaced in the Opportunity queue.
- **Every console chart has an "explain this number" link.** Drills to the underlying GSC/GA4 query.

## How agents apply this

When proposing a change:
- State which of the four north-star outcomes it moves.
- State the metric and direction.
- State how the metric will be measured.
- If the answer is "none," propose a different change.

When reviewing a PR:
- Reject changes that don't tie to a north-star outcome.
- Reject UI that adds chrome without adding decision velocity.
- Reject schemas that add fields without a consumer.
