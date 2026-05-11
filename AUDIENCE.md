# Audience

Who we are building `your-os` for. Three personas, ranked by primacy. Every product decision should answer: "does this serve the primary persona's daily job?"

## Primary — Growth/Performance Marketing lead

**Title patterns:** Head of Growth, VP Growth, Director of Performance Marketing, Head of Demand Gen.

### Job to be done
Own ROOS and pipeline. Hit a quarterly traffic + conversion target. Defend the SEO budget against the paid-channel team every quarter. Convert content investment into measurable revenue, not just rankings.

### Pain points
- Suite tools (Surfer, Clearscope, MarketMuse) optimize documents but stop at "score." They don't tie to revenue.
- AI-visibility dashboards (Profound, Peec) report citation share without saying what to do next.
- Suite reports require another analyst to translate to pipeline.
- Programmatic SEO stacks (Whalesync, Make) ship volume but break under quality gates.
- Editorial workflows (Strapi, Sanity) are CMSes, not operating systems — guardrails are plugins, not lifecycle.
- Email warm-up is bolt-on (Loops, Customer.io) and disconnected from the article that triggered the signup.

### Success metrics they own
- Modeled organic conversions (ROOS).
- Pipeline contribution from SEO.
- Cost per acquisition trending down.
- Share of voice / share of citation in their category.
- Quarterly content velocity within budget.

### Where the OS earns trust
- The configurator outputs a deploy-ready hub in <30 minutes with no TypeScript visible.
- The console's Home view shows ROOS variance + accepted briefs + AI-citation share above the fold.
- Every chart drills to its underlying GSC/GA4 query — no black boxes.
- Brand-lint catches intent-CTA mismatches before publish, so they don't get a Slack message at 10pm.
- ROOS predictions reconcile to actuals automatically — no spreadsheets.

### Where they tolerate friction
- HITL gates on portfolio rebalancing (quarterly), brief sign-off (per brief), YMYL approval (when it applies), cannibalization merges (event-driven), monthly portfolio narrative.
- Security-sensitive setup (OAuth, API tokens, env vars).
- One-time tenant config investment — if it pays off forever.

### Where they will NOT tolerate friction
- Daily approval clicks for routine drafts.
- Manual ROOS calculation.
- Switching between 5 tools to triage one anomaly.
- AI panels that show off the AI without doing the user's job.

---

## Secondary — Head of SEO

**Title patterns:** SEO Lead, Head of SEO, Senior SEO Manager.

### Job to be done
Own topical authority, technical SEO, and AI-search visibility. Deliver a content portfolio that ranks, gets cited, and survives algorithm updates. Coach writers and editors on intent and craft.

### Pain points
- Content briefs come in without intent classification or SERP snapshot.
- Technical issues (cannibalization, anchor diversity, schema regressions) are caught after the fact.
- AI-search performance is invisible until a vendor tool surfaces a 30-day lag.
- Pillar/cluster taxonomy lives in Notion or a spreadsheet, drifts from what's actually shipped.

### Where the OS earns trust
- Pillar/cluster/persona taxonomy lives in `tenant.config.ts` and is enforced in Strapi.
- The brief editor shows SERP snapshot + intent classification by default. **Cannibalization detection:** today, surfaced via the `cannibalization` skill (`packages/skills/src/skills/seo-extended.ts`); merges remain a HITL gate per rule 060, not auto-merge.
- Automated brand-lint + SEO-style gates in CI: today this means `pnpm exec your-os-brand-lint` for linting, tenant-side Lighthouse-CI for CWV, and `examples/*` integration tests for build correctness. Future automation (no `@your-os/*` package planned by name; this is an opportunity for a tenant-side or OS-side audit script — see [SEO_OPERATING_STANDARDS.md §10](SEO_OPERATING_STANDARDS.md#10-brand-lint-contract)).
- AI-citation share in the console reuses the same pillar/persona taxonomy — no parallel reporting universe.

### Where they tolerate friction
- Hand-tuning DBAs and pillar names (strategic decisions, not data-driven).
- Reviewing the configurator's research outputs with Accept/Edit/Reject.
- Locking briefs before they go to writers (HITL #2).

---

## Tertiary — Founder/operator standing up a vertical hub

**Title patterns:** Founder, GM, Head of New Verticals, Director of Brand.

### Job to be done
Stand up a new content hub (B2C marketplace or B2B SaaS) from zero in a quarter. Need SEO + content + tools + analytics + email + funnel as one opinionated stack — not 7 vendors stitched together.

### Pain points
- Hiring an SEO agency, a content team, and an email marketer takes 3 months.
- Each tool needs separate setup, separate auth, separate reporting.
- Strategy gets lost in tool sprawl.
- Hard to know what "good" looks like in a new vertical without a baseline.

### Where the OS earns trust
- Configurator does competitor SERP scrape + ICP/persona enrichment + DBA proposal in parallel during onboarding.
- Default `tenant.config` for B2C marketplace and B2B SaaS are battle-tested (Career Hub, Employer Hub).
- Email sequences ship with the hub — not as a separate tool to integrate.
- AI-citation strategy is built in, not an upsell.
- One Slack channel, one console, one Vercel deploy.

### Where they tolerate friction
- Trusting opinionated defaults on first launch.
- Customizing in the console (not in code) post-launch.
- Per-tenant Strapi cost (~$15-30/mo) for the editorial workflow.

---

## Tertiary supporter — Editorial team / writer / SME

**Title patterns:** Content Writer, Content Editor, SME (subject matter expert).

### Job to be done
Write briefs into articles. Review for accuracy. Hit the editorial calendar. Stay on-brand.

### Where the OS earns trust
- Brief editor shows what to write, why, who for, and what good looks like (citation seeds, internal-link suggestions, intent, persona).
- Strapi admin shows brand-lint scores inline before publish.
- Email sequences auto-link to the article they wrote — so editorial sees its own work showing up in nurture.

### NOT primary
We do not optimize the OS for casual content writers. They are served *through* the brief editor and Strapi admin, not as primary console users.

---

## Anti-personas (we are NOT building for)

- **Casual bloggers / solo SEO consultants** — Surfer, Frase, Writesonic serve them. We require a tenant config, a Strapi (or code-mode), and a Vercel deploy. That's overkill for a side project.
- **Enterprise SEO teams running 50+ properties** — They need ContentKing, BrightEdge, or Conductor. The OS optimizes for 1-10 hubs per parent company.
- **Pure AI writer SaaS buyers** — Jasper, Writesonic, Copy.ai serve them. We assume editorial discipline.
- **Agencies serving many unrelated clients** — Per-tenant blast radius works for one parent company; agency multi-tenancy needs a different SLA model.

---

See [MISSION.md](./MISSION.md), [VISION.md](./VISION.md), and [COMPETITIVE.md](./COMPETITIVE.md) for the full strategic picture.
