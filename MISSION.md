# Mission

> Give a Growth/Performance Marketing lead a multi-tenant SEO content operating system that closes the loop from **brief → code → CI gates → live metrics → email warm-up → ROOS attribution**, with brand and AI-search guardrails enforceable at multiple layers: `brand-lint` CLI in CI for code-mode tenants today; a Strapi `beforePublish` lifecycle hook (`@your-os/strapi-brand-lint-hook`) for strapi-mode tenants when configured — and human-in-the-loop only on decisions that actually need a human.

## Positioning (three sentences)

`your-os` is the only SEO content OS that owns the full closed loop — discovery, brief, publish, measurement, refresh, attribution — across multiple tenants from a single kernel. It treats AI as a copilot that drafts, ranks, and reconciles; humans gate portfolio strategy, claim boundaries, regulated sign-off, cannibalization merges, and monthly portfolio reviews. Everything in between is automated, testable, and reversible.

## The five operating principles

1. **Outcome over output.** Every change must move ROOS, indexation, AI-citation share, or pipeline conversion. Ranking on its own is not an outcome.
2. **Funnel-aware by default.** Content intent dictates CTA; CTA dictates micro-conversion; micro-conversion feeds the email warm-up sequence; the sequence closes to `tenant.config.conversion.primary`. Skipping any link breaks the loop.
3. **Quality and low-hanging fruit compound.** 90/10 plays (striking-distance, CTR rescue, schema fix, link injection, cannibalization consolidation, template extension, linkable-asset) come before net-new pillars.
4. **Per-tenant blast radius.** One tenant's misconfiguration cannot break another. One tenant's Strapi outage cannot break its own site. One tenant's AI agent cannot escalate without a HITL gate.
5. **Reversible by design.** Codemods for breaking schema changes, byte-equivalence for extractions, draft-mode for content, refresh PRs for decay. Nothing is one-way.

> See [SEO_OPERATING_STANDARDS.md](./SEO_OPERATING_STANDARDS.md) for the binding 2026 SEO operating standards (definitions, measurement doctrine, brand-lint contract).

## What we are NOT

- Not another AI writer. Surfer / Clearscope / Jasper own that surface.
- Not another GEO dashboard. Profound / Peec / Otterly own that surface.
- Not another headless CMS. Strapi is one supported backend; code-mode is fully supported.
- Not a hosted multi-tenant Strapi. Per-tenant instances. Per-tenant secrets. Per-tenant blast radius.
- Not a generic "any vertical" platform. The wedge is **B2C marketplace + B2B SaaS marketing for the same parent company**. Generalize after both work.

## How we know we're winning

A Growth lead at a B2B SaaS or B2C marketplace can complete this flow unaided in <90 minutes:

1. Open the configurator URL.
2. Finish 7 onboarding steps in 25–30 minutes.
3. Approve the launch preview (domain + pillar tree + sample brief + ROOS forecast band + 3 email sequences).
4. Watch the repo scaffold + Strapi provision + first PR open (<15 min).
5. Open the console and approve 5 opportunity briefs from the queue.
6. Receive a Slack notification when each brief is locked, an email asking "what worked / what broke / would you pay" 24 hours later.

If the answer is yes for ≥3 of the first 5 design partners, we're winning. If not, we fix the failing surface before adding any new packages.

---

See [VISION.md](./VISION.md) for the 12 / 24 month target state, [AUDIENCE.md](./AUDIENCE.md) for who we are building for, [COMPETITIVE.md](./COMPETITIVE.md) for the white space, and [AGENTS.md](./AGENTS.md) for what AI agents working on the OS need to know.
