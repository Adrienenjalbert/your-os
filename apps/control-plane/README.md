# @your-os/control-plane

Per-tenant GSC/GA4 ingest + weekly digest agent + brand-lint/Lighthouse history + Slack notifications. The autoresearch loop closes here.

The weekly digest writes opportunity briefs as Strapi `OpportunityBrief` drafts in tenant Strapi instances; performance writes back to the same entries. See [`.agents/PLAN.md`](../../.agents/PLAN.md) and the [closed loop diagram](../../README.md#the-closed-loop) for context.

## What's in here

```
src/
├── digest/          ← weekly-digest agent: rank opportunities + draft briefs (Strapi mock)
├── ingest/          ← GSC/GA4 ingest types + mocks (live providers wired per tenant)
└── notify/          ← Slack notifier
```

## Status

CI gate: `apps/control-plane`'s weekly-digest test ranks fixture GSC data and drafts a valid `OpportunityBrief`. Production deploys per-tenant.

## Where it fits

- **Layer**: app — the human-in-the-loop control plane (HITL gates #4 and #5).
- **HITL rules**: [`.agents/rules/060-human-in-the-loop.md`](../../.agents/rules/060-human-in-the-loop.md).
- **Funnel discipline**: [`.agents/rules/070-funnel-discipline.md`](../../.agents/rules/070-funnel-discipline.md).
