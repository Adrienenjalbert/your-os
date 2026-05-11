import type { Skill } from "../catalog.js";

export const MARKETING_SKILLS: Skill[] = [
  {
    slug: "funnel-design",
    family: "marketing",
    description:
      "Map content intents → CTAs → micro-conversions. Prevents BOFU-heavy hubs that never warm up cold traffic.",
    body: `---
name: funnel-design
description: Intent → CTA → micro-conversion mapping for a tenant hub.
---

# Funnel design

For each pillar, fill the matrix. \`@your-os/brand-lint\` enforces the matches at PR time (\`INTENT_CTA_MISMATCH\`, \`BOFU_HEAVY_NEW_HUB\`).

| Search intent              | Allowed CTAs                       | Forbidden CTAs            | Micro-conversion event           |
|----------------------------|------------------------------------|---------------------------|----------------------------------|
| informational_early        | guide_download, newsletter         | demo_request, trial_start | newsletter_opt_in, guide_download |
| informational_problem_aware| guide_download, tool_use, calculator| demo_request             | tool_completed, calculator_run    |
| commercial_investigation   | comparison_view, tool_use, demo    | (none)                    | comparison_clicked, demo_view     |
| transactional              | demo_request, trial_start, signup  | newsletter                | demo_booked, trial_started        |
| navigational               | direct link only                   | gated forms               | (n/a)                             |

Rules:
- A new hub must have ≥40% TOFU + ≥30% MOFU pages in the first 90 days. \`brand-lint\` blocks if BOFU > 40%.
- Every TOFU page MUST link to ≥1 micro-conversion (newsletter, guide, calculator) within 1 click.
- Every MOFU page MUST link to ≥1 calculator/tool AND newsletter.
- BOFU pages may demand a demo only if SERP intent confirms (\`serpOverride\` flag in tenant config).

Implementation: tenant.config \`funnel.intentMap\` declares the policy; \`@your-os/brand-lint\` reads it.

References: [SEJ — Marketing funnels for SEO](https://www.searchenginejournal.com/seo-marketing-funnel/).
`,
  },
  {
    slug: "email-warmup",
    family: "marketing",
    description:
      "Design 5-7 step warm-up sequences keyed to the micro-conversion that captured the lead. Closes ROOS loop.",
    body: `---
name: email-warmup
description: Per-pillar email warm-up sequence design.
---

# Email warm-up

A micro-conversion (guide download, newsletter opt-in, calculator save) must land the user in a sequence whose first email arrives within 30 minutes and whose last email proposes a primary conversion.

## Required structure (per pillar)

1. **Welcome** (T+0): deliver promised asset, reassure on cadence.
2. **Pain reframe** (T+2d): name the problem in the user's words from VOC research.
3. **Proof / case** (T+5d): one customer outcome, ≥1 verifiable number.
4. **Tool / calculator** (T+8d): nudge to a hub tool that produces a personalized output.
5. **Soft CTA** (T+12d): comparison or pricing page; no hard ask.
6. **Hard CTA** (T+18d): demo / trial / signup. Use \`tenant.config.conversion.primary\`.
7. **Re-engage or sunset** (T+30d): last chance, then drop to monthly digest.

## Configuration

Sequences live in \`tenant.config.email.sequences\`. Each step references a \`micro-conversion\` source via \`triggerEvent\`.

\`\`\`ts
email: {
  provider: { kind: "customer-io" }, // or "mailchimp", "resend", etc.
  sequences: [
    {
      slug: "guide-warmup",
      triggerEvent: "guide_download",
      steps: [ /* 7 steps */ ],
    },
  ],
}
\`\`\`

## Forbidden patterns

- **Nurture orphan signup**: a micro-conversion that doesn't trigger a sequence. \`brand-lint\` rule \`NURTURE_ORPHAN_SIGNUP\` blocks PRs that introduce a new micro-conversion event without a matching sequence in \`email.sequences\`.
- **Single-email "drip"**: <3 emails between micro and primary CTA. Drop-off >70%.
- **No-personalization broadcast**: every step must use at least one liquid var (name, downloaded asset, pillar slug).

References: [SEJ — Lead nurturing email sequences](https://www.searchenginejournal.com/email-marketing/).
`,
  },
  {
    slug: "experiment-design",
    family: "marketing",
    description:
      "Decide MDE, sample size, and attribution path BEFORE coding any A/B test. Prevents underpowered SEO experiments.",
    body: `---
name: experiment-design
description: Pre-flight gate for any SEO/CRO A/B test.
---

# Experiment design

You may NOT start coding an experiment until this checklist is filled in the brief.

## 1. Hypothesis

- One sentence, one-tailed: "Variant B will increase {metric} by ≥{lift}% because {reason}."

## 2. Population

- URL pattern (e.g., \`/jobs/{slug}\`).
- Eligible page count.
- Avg monthly clicks per URL (must be ≥1k for the test to power in <8 weeks).

## 3. MDE / sample size

Minimum detectable effect floor: **5% relative** unless control conversion rate >5%, then 3%.

\`sample_per_arm = 16 * p * (1-p) / (delta * p)^2\` for binomial CR.

If sample exceeds 90-day traffic budget → kill the test, pick a higher-signal lever (e.g. title rewrite test, not body copy test).

## 4. Attribution path

- **GA4 user-property**: variant = user-property assigned at session start. Joins to revenue via standard GA4 funnels. Use when conversion is in-app.
- **GSC variant-assignment**: report URL with hash suffix or via cookie-routed alternate. Use when conversion is on-page (e.g. tool use, scroll depth).

Pick ONE. Document why.

## 5. Stop conditions

- Reaches sample size.
- 28 days elapsed (Google can re-index variants — too long invites confounders).
- Variant breaks CWV budget — stop manually based on tenant Lighthouse-CI alerts (cite https://web.dev/articles/vitals for thresholds). Auto-stop hooks live in tenant CI today; no \`@your-os/*\` package owns this yet.
- Variant breaks indexation — stop manually based on tenant GSC monitoring or \`@your-os/refresh-engine\` decay signals. Indexation regressions are a HITL gate (see \`.agents/rules/060-human-in-the-loop.md\`).

## 6. Decision matrix

- p<0.05 + lift ≥ MDE → ship variant.
- p<0.05 + lift < MDE → don't ship (effect too small to matter).
- p≥0.05 + n at sample → don't ship, learn from secondary metrics.
- p≥0.05 + n < sample → extend if cheap, otherwise kill.

References: [SEJ — A/B testing in SEO](https://www.searchenginejournal.com/seo-ab-testing/), [Princeton GEO 2024](https://arxiv.org/abs/2311.09735).

NOTE: Experiment tracking lives in tenant code today (vendor tools like PostHog / Optimizely, or homegrown JSON registries). The OS does not yet provide a first-class experiments package — document your experiment registry in your tenant repo's README. This skill exists so a tenant team can run a manual A/B test correctly without a runtime.
`,
  },
];
