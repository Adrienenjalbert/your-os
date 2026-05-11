# @your-os/web

> v1.1 Web Shell. The first browser-facing surface of `your-os`.

Single Next.js 15 + React 19 app that hosts three surfaces driven entirely by
the existing **headless** primitives in `@your-os/configurator` and
`@your-os/console`:

| Surface | Route | Source models |
| --- | --- | --- |
| **Onboarding** | `/onboarding/[stepId]` | `OnboardingMachine`, `ResearchProvider`, `applyGateDecisions` |
| **Admin Console** | `/console`, `/console/queue`, `/console/briefs/[id]` | `homeViewModel`, `opportunityQueueViewModel`, `briefEditorViewModel`, `KEYBOARD_MAP` |
| **Customise / Control panel** | `/customise/*` | `TenantConfigSchema` from `@your-os/tenant-config` |

## Principles

- **Multi-choice over typing.** Every step + settings panel uses `ChoiceCardGrid` with proposals from `ResearchProvider`. Free-text is the fallback, never the primary path.
- **Hybrid mock/live research.** `provider-factory.ts` returns the deterministic `MockResearchProvider` in dev/CI and the `LiveResearchProvider` (Anthropic + DataForSEO with per-method mock fallback) in deployed previews.
- **Headless models stay the source of truth.** This shell does **not** redefine state machines, view models, or keyboard bindings — it imports them from `@your-os/*`.

## Quick start

```bash
pnpm install
pnpm --filter @your-os/web dev      # http://127.0.0.1:3001
pnpm --filter @your-os/web test:e2e # Playwright happy path (mock provider)
```

Live research locally:

```bash
ANTHROPIC_API_KEY=sk-... pnpm --filter @your-os/web dev
```

## Layout

```
apps/web/
├── src/
│   ├── app/                     # Next.js App Router routes
│   │   ├── onboarding/[stepId]/ # 7-step configurator UI
│   │   ├── console/             # Home, queue, brief editor
│   │   ├── customise/           # 8 sectioned settings panels
│   │   └── api/                 # /api/onboarding, /api/research, /api/tenant-config, /api/telemetry
│   ├── server/                  # provider-factory, machines store, tenant-store, telemetry
│   ├── components/
│   │   ├── shell/               # KeyboardProvider, CommandPalette, Stepper, HitlBanner
│   │   ├── multichoice/         # ChoiceCardGrid + Dba/Icp/Pillar/Schema cards
│   │   ├── ai/                  # ResearchActivityRail, ProposeAgainButton
│   │   ├── onboarding/          # 7-step UI (steps/IdentityStep.tsx, …)
│   │   ├── console/             # KpiCard, OpportunityRow, BriefEditor (M2)
│   │   └── customise/           # SectionForm, ConfigDiffPreview (M3)
│   └── lib/                     # cn() helper
├── tests/e2e/                   # Playwright specs
├── scripts/web-loop.mjs         # build → playwright → axe → lighthouse → quality-report.json (M4)
├── playwright.config.ts
├── next.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

## Per-milestone ratchet

Run `pnpm --filter @your-os/web loop` to capture the quality snapshot. The
quality bars (per the v1.1 plan) are:

| Milestone | Bar |
| --- | --- |
| **M1** | Lighthouse ≥ 90 perf/a11y/best-practices · axe = 0 serious · onboarding happy path < 30 min · bundle ≤ 200kb gz/route |
| **M2** | M1 + cmd-enter approve ≤ 1.5s p95 · KPI comparison strings non-empty (rule 050) |
| **M3** | M2 + diff preview render < 100ms · AI propose re-roll < 5s mock / < 25s live p95 |
| **M4** | M3 + ≥6 of the 11 telemetry events from `apps/web/src/server/telemetry.ts` firing in a journey · end-to-end design-partner Playwright spec runs unaided in < 30 min |

The skill at `.agents/skills/quality/web-shell-quality-ratchet.md` documents
how to read the report and ratchet the bar between milestones.

## Constraints (rules respected)

- `030-strapi-isolation`: never imports `@your-os/strapi-*` directly. Strapi-mode tenants are configured via `tenant.config.ts → contentStorage`.
- `050-growth-lead-priorities`: every `KpiCard` requires a `comparison` prop (compile-time enforced by the `HomeKpi` shape).
- `060-human-in-the-loop`: only the 5 documented HITL gates are surfaced as ChoiceCard groups.
- `070-funnel-discipline`: brief editor renders the existing `intentCtaCheck` as-is; the funnel customise page exposes the intent → CTA matrix.
