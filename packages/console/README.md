# @your-os/console

Headless admin console: view models, reducers, and a keyboard map for the Growth-lead workflow. Framework-agnostic — `apps/web` is the current React/Next.js shell; a CLI/TUI could mount the same exports without changes.

## What's exported

- `homeViewModel(tenant, opps, briefs)` — top-level KPIs + recent activity rail.
- `opportunityQueueViewModel(opps)` — the opportunity queue (sorted, grouped, filterable).
- `briefEditorViewModel(brief, opp, tenant)` — brief editor with inline intent-CTA match check (rule 070).
- `briefEditorReducer` — pure reducer for approve / edit / reject decisions.
- `keyboardMap` + `resolveKeyboardAction` — `cmd-k` (palette), `cmd-enter` (approve), `j/k` (next/prev), `esc` (close).

## Status

`alpha` — see the [stability legend](../../README.md#packages).

## Install

```bash
pnpm add @your-os/console
```

## Where it fits

- **Layer**: core engine (Layer 1) — see the [architecture diagram](../../README.md#architecture-in-one-diagram).
- **Consumed by**: `apps/web` (the v1.1 Web Shell). Imports the exported models/reducers and renders them as React components in `apps/web/src/components/console/`.
- **Why headless**: the Growth-lead decision (`cmd-enter approve`) is what matters; React rendering is a layering concern. Testing the data layer in isolation is faster and survives shell rewrites.
- **Reads from**: `tenant.config.ts` (validated by [`@your-os/tenant-config`](../tenant-config/README.md)), plus opportunity/brief shapes from `@your-os/control-plane` and `@your-os/measurement`.

## Density-first UI principles (for any shell consuming this package)

- Charts must show comparison (week-over-week or vs forecast). Numbers without comparison are forbidden.
- Every chart drills to its source query (GSC / GA4 / Strapi).
- Mobile = read-only. The keyboard-driven approve flow is desktop-only.

For agent-facing rules and the OS architecture, start at [AGENTS.md](../../AGENTS.md).
