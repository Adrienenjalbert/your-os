# Vision

The 12 and 24 month target state for `your-os`. This is **not** a roadmap. The roadmap lives in [.agents/PLAN.md](./.agents/PLAN.md). This is the destination.

## 12 months from v1 (the "ready to be tested" baseline)

A Growth/Performance Marketing lead at any company in our wedge (B2C marketplace or B2B SaaS) can:

- **Launch a hub** from blank repo to deployed site with first briefs in queue in **<90 minutes**, unaided.
- **Operate the loop** end-to-end: weekly opportunity briefs flow into the queue, approved briefs become articles, articles trigger email warm-up sequences grounded in pillar content, ROOS reconciles at 30/60/90 days, decay is detected automatically.
- **Trust the guardrails**: brand-lint blocks `INTENT_CTA_MISMATCH`, `NURTURE_ORPHAN_SIGNUP`, `BOFU_HEAVY_NEW_HUB`, and `TOOL_GATE_WITHOUT_SERP_CHECK` when integrated by the caller, and blocks publish on banned phrases, AI-slop, and missing inline citations on dollar amounts. DBA prevalence (Romaniuk-style ≥80% target) is a docs-only goal today; the prevalence rule is not yet enforced in code (see [`.agents/rules/080-seo-operating-standards.md`](.agents/rules/080-seo-operating-standards.md) §3 for the brand-lint contract honesty rule).
- **Report up** with one ROOS dashboard per tenant: predicted vs actual at 30/60/90, by pillar, by persona, by content class. AI-citation share by pillar is visible alongside.
- **Customize without forking**: every tenant divergence is a `tenant.config.ts` field, not a code branch. A B2B tenant's `funnel.intentMap` differs from a B2C tenant's, but no `if (businessModel === "b2b")` exists in `packages/*`.

### Measurable 12-month outcomes

| Metric | Target |
|---|---|
| Time-to-first-deployed-hub | <30 min |
| Time-to-first-approved-brief | <10 min after configurator finishes |
| Configurator step-completion rate | ≥90% per step |
| Active tenants in production | ≥5 |
| Design partners willing to pay | ≥3 of first 5 |
| ROOS prediction-vs-actual variance | within ±30% on ≥70% of accepted briefs |

## 24 months — the durable moat

The OS becomes the only product on the market with these five defensible properties simultaneously:

1. **Per-tenant codified taxonomy.** Pillars, clusters, personas, ICPs, CEPs, DBAs, intent maps, micro-conversions, and email sequences are all in `tenant.config.ts`. The same brief drafter works across hubs. The same brand-lint enforces guardrails across hubs. No competitor ships this as one object.
2. **Closed-loop attribution that learns.** ROOS predictions get calibrated weekly from actuals; lift_per_effort weights update automatically; next week's discovery is smarter than last week's. Surfer / Clearscope / MarketMuse never close this loop.
3. **AI-search legibility as a first-class output.** Brand-lint enforces inline citations on dollar amounts; structured data fidelity and llms.txt ship as first-class publish outputs. Broader GEO citation-density and DBA prevalence targets are documented in [rule 080](.agents/rules/080-seo-operating-standards.md) — not all are enforced in code yet. Profound / Peec dashboards measure visibility; we *make pages worth citing*.
4. **Brand governance at the CMS lifecycle layer.** `beforePublish` hook calls brand-lint. Editor sees inline failures. Career Hub launch is never blocked because guardrails ran in CI on a different branch.
5. **Multi-hub kernel.** Same OS, different tenants, different verticals, isolated blast radius, shared learning where it helps (skill library) and isolated where it must (Strapi instances, secrets, deploys).

### What does NOT change

- Per-tenant Strapi instances. Never a shared multi-tenant Strapi.
- BSL license until v1.0+. No public open-source release until the moat is durable.
- Career Hub stays code-mode unless its team explicitly opts in via `@your-os/migrate-to-strapi`.
- The `tenant.config.ts` schema is the single contract. Breaking changes require a codemod, period.

## What we will know in 24 months that we don't know in 12

- Which 2-3 verticals beyond marketplaces and B2B SaaS the OS generalizes to (or whether it should stay focused).
- Whether experiment runtime (vendor tooling like PostHog / Optimizely, or a tenant-side registry — the OS does not yet ship an experiments package by name) is needed in-house or whether GA4 + a Notion brief is enough.
- Whether `@your-os/ai-visibility` ships its own scraper or stays a Profound/Peec CSV importer.
- Whether the OS has a public release path or stays a private platform powering owned hubs.

These are intentionally open. We let design partners decide.

---

See [MISSION.md](./MISSION.md) for the operating creed and [AUDIENCE.md](./AUDIENCE.md) for the personas we are building for.
