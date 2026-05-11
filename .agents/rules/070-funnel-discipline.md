# Rule 070 — Funnel discipline

Always-on. Every page, brief, tool, and email sequence in `your-os` follows the funnel: **intent → CTA → micro-conversion → email warm-up → primary conversion**. Skipping a link breaks the loop and the OS rejects the change.

## The four required matches

1. **Keyword intent must match content depth.** Informational queries get foundational guides; commercial-investigation queries get comparison matrices; transactional queries get landing pages.
2. **Content depth must match primary CTA.** Informational pages may not lead with `demo` / `pricing` / `sales`. Tool / utility pages may not gate inputs without a SERP override flag.
3. **Primary CTA must map to a defined micro-conversion.** Every `tenant.config.funnel.intentMap` entry has `defaultMicroConversionGoals`.
4. **Micro-conversion must trigger a defined email sequence (when applicable).** Every `tenant.config.email.sequences` entry has `sourceTrigger` and `contentRefs`.

## Forbidden patterns (enforced by `@your-os/brand-lint`)

| Rule ID | What fails | Why |
|---|---|---|
| `INTENT_CTA_MISMATCH` | Hero CTA is `demo_request` / `pricing_checkout` / `hard_gate_before_value` while keyword intent is `informational` | Increases pogo-sticking, weakens "single satisfied result" UX, kills new-hub traction |
| `TOOL_GATE_WITHOUT_SERP_CHECK` | Tool gates inputs while top 3 SERPs are ungated | Loses pogo-stick contest to ungated competitors |
| `NURTURE_ORPHAN_SIGNUP` | Email sequence does not reference `sourceContentId` of the article that triggered the signup | Generic templates kill activation; Val Geisler's principle |
| `BOFU_HEAVY_NEW_HUB` | >40% of cluster targets BOFU keywords on a tenant with `domainAuthority` below threshold | New hubs need TOFU breadth before BOFU depth ranks |

Override mechanism: each rule can be bypassed with an explicit `serpOverride` flag + written rationale in the brief. The override is logged and surfaces in the monthly portfolio review.

## Required patterns

- **Every brief in the queue carries an intent classification.** Surface it in the Opportunity queue and Brief editor.
- **Every published page wires at least one micro-conversion event.** Defined in `tenant.config.funnel.microConversions`.
- **Every email sequence has a pillar spine.** Sub-sequences only pull URLs tagged to that pillar until saturation.
- **Tools ship with a post-result CTA pattern.** Bucketed next step (3 outcome tiles) or escalation stair (2-email nurture). Never "thanks for using the tool, the end."

## Sequence length defaults (encoded in `tenant.config.email.defaults`)

| Motion | Length | Rationale |
|---|---|---|
| Newsletter-first B2C | 3–5 emails | Establishes cadence + 2–3 pillar proofs |
| Consideration-heavy B2B | 5–9 emails | Mirrors evaluation steps; one cluster proof per email |
| Demo / SQL motion | 3 + SDR bridge | Tight: problem → methodology → social proof → calendar |

## Email-to-content mapping

- Email 1 (value): the article/tool that triggered signup.
- Email 2 (depth): adjacent cluster within same pillar.
- Email 3 (soft pitch): your data/testimonials → bridge to product.
- Email 4+ (hard pitch): primary `tenant.config.conversion.primary` with risk reversal.

## How agents apply this

When drafting a brief:
- Classify intent first.
- Look up the allowed CTAs from `tenant.config.funnel.intentMap`.
- Reject CTAs not in the allowed list (or surface a `serpOverride` flag with rationale).

When proposing a tool:
- Check competitor SERP gating.
- Define micro-conversions before defining the UI.
- Define post-result CTA before declaring the tool spec complete.

When proposing an email sequence:
- Identify the source content.
- Identify the pillar spine.
- Identify the primary conversion this sequence escalates to.
- Validate that no `NURTURE_ORPHAN_SIGNUP` violations exist.

## Why this matters

Pure transactional content fails on low-traffic new hubs. The winning pattern (per [Ahrefs](https://ahrefs.com/blog/search-intent), [Semrush](https://www.semrush.com/blog/search-intent), [Backlinko](https://backlinko.com/hub/seo/search-intent), [CXL](https://cxl.com/blog/should-you-optimize-for-micro-conversions/), [Val Geisler](https://www.valgeisler.com/), [Brennan Dunn](https://createandsell.co/courses/segment-with-surveys), [Kit](https://kit.com/features/automations)) is intent-matched educational surface area + micro-conversions + warm-up sequences grounded in the same content. The OS makes this enforceable.
