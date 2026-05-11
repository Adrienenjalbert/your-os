---
name: web-shell-quality-ratchet
description: Quality skill. Use when running `pnpm web:loop`, interpreting `web-shell-quality-report.json`, or deciding whether a v1.1 Web Shell milestone has cleared its bar.
---

# Web Shell Quality Ratchet

Codifies the per-milestone quality bars for `apps/web` (the v1.1 Web Shell) and
how to read the report `pnpm web:loop` writes.

## Use When

- finishing a code change to `apps/web`
- promoting work between milestones M1 → M2 → M3 → M4
- reviewing CI failures that come from `web-shell-quality-report.json`
- planning a deeper UX iteration on Onboarding / Console / Customise
- onboarding a new contributor who needs to know the bar

## Loop

```
research → build → test → measure → improve
```

Implemented as `pnpm web:loop` (or `pnpm --filter @your-os/web loop`):

1. **typecheck** — `tsc --noEmit`
2. **unit-tests** — `vitest run --passWithNoTests`
3. **build** — `next build` (production)
4. **playwright** — `playwright test` (covers onboarding, console, customise,
   axe, design-partner replay)
5. **report** — writes `apps/web/quality-report/web-shell-quality-report.json`
   with step durations, bundle sizes, and ratchet violations

The script exits non-zero if any step fails OR any ratchet is violated.

## Per-milestone Bars

Every milestone keeps prior bars. The report's `ratchet` block enumerates the
current expectations:

### M1 — Onboarding shell

- Lighthouse ≥ 90 perf / a11y / best-practices
- axe = 0 serious violations
- Onboarding happy path < 30 min wall clock
- ≤ 200 KB gz per route

### M2 — Admin Console

- M1 holds
- Cmd-Enter approve ≤ 1.5s p95 (`console.spec.ts`)
- KPI comparison strings non-empty (rule 050; enforced in `home-kpis` test)

### M3 — Customise / Control panel

- M2 holds
- Diff preview render < 100ms (after dry-run)
- AI propose re-roll < 5s p95 mock / < 25s p95 live

### M4 — Design-partner loop

- M3 holds
- Full design-partner replay (`design-partner.spec.ts`) completes inside 30 min
- Telemetry events fire: at minimum `console.keyboard.action`,
  `console.brief.approved`, `customise.commit`
- 6 of the 11 telemetry events emitted by `apps/web/src/server/telemetry.ts`
  are observed during the journey

## Reading the Report

`apps/web/quality-report/web-shell-quality-report.json`:

```json
{
  "schemaVersion": 2,
  "milestone": "M4",
  "steps": [{"label": "playwright", "exitCode": 0, "ms": 74294}],
  "bundleSizes": { ".next/server/app/onboarding/[stepId]/page.js": 153000 },
  "ratchet": { "m1": {...}, "m2": {...}, "m3": {...}, "m4": {...} },
  "violations": [],
  "summary": { "stepsPassed": 4, "stepsTotal": 4, "ratchetViolations": 0 }
}
```

- `violations` is the list to act on. Empty = ship.
- `bundleSizes` flags any single page bundle > the M1 cap (200 KB).
- `summary.stepsPassed === stepsTotal` is the gate for green CI.

## Common Failures

- **Bundle > 200kb**: a workspace package with a large transitive dep was
  pulled into the client. Move the package to `serverExternalPackages` in
  `next.config.ts`, or split the import into a server route.
- **axe serious violation**: usually a contrast or label-association issue.
  Re-run `pnpm test:e2e --grep "axe scan"` for the failing route, then patch
  the OKLCH tokens in `globals.css` or the offending component.
- **Cmd-Enter > 1.5s**: profile the BriefEditor's `useReducer` callback —
  every render must avoid awaiting network I/O on the keystroke path.
- **Diff preview > 100ms**: keep `ConfigDiffPreview` to JSON.stringify
  pretty-print at v1.1 scale; never introduce a syntax-highlighter.

## Design-partner Mode

The shell ships a small floating panel (`DesignPartnerMode.tsx`) that
testers can open to:

- toggle verbose telemetry (Likert prompts after each surface)
- emit `design_partner.likert` events under `/api/telemetry`

State is persisted in `localStorage` so testers don't have to re-enable the
toggle every page load.

## Hand-offs

- If a milestone bar moves, update both `web-loop.mjs` (`ratchet` map) AND
  this skill so the contract stays in one place.
- After M4 ships and design-partner data lands, raise the bar in M2/M3 to
  the observed p75, never the p95.
