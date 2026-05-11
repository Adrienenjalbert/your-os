# `.agents/` — guidance for AI agents working ON the OS

This folder guides AI agents (Cursor, Claude Code, etc.) working **on the OS itself**.

It is NOT what ships to tenants. The skills that ship to tenants live in [packages/skills/](../packages/skills/) and are mirrored into per-tenant `AGENTS.md` by [packages/agent-context/](../packages/agent-context/).

## Two audiences, two folders (canonical reference)

> Other docs in the repo (`README.md`, `AGENTS.md`, `CLAUDE.md`) link here instead of restating this. If the policy changes, change it once — here.

| Folder | Audience | Example guidance |
|---|---|---|
| `your-os/.agents/` (this folder) | OS contributors editing `your-os/` source | "Don't put feature code in `packages/core`. Use Changesets. Byte-equivalence required." |
| `your-os/packages/skills/` | Tenant developers consuming `@your-os/*` from a tenant repo | "Use `ToolPageShell` not a one-off. Reuse `getXBySlug` selectors. Match the repo's reuse-first style." |

Conflating these is a common mistake. The first is for **building the engine**; the second ships **with the engine** for downstream tenant repos to consume.

## Always-on rules

Loaded into every agent context working on the OS:

- [rules/000-os-architecture.md](rules/000-os-architecture.md) — monorepo shape, package boundaries, where new code belongs.
- [rules/010-pr-workflow.md](rules/010-pr-workflow.md) — PRs, Changesets, base branch.
- [rules/020-byte-equivalence.md](rules/020-byte-equivalence.md) — extraction-from-Career-Hub gates.
- [rules/030-strapi-isolation.md](rules/030-strapi-isolation.md) — Strapi packages must not leak into Career Hub.
- [rules/040-versioning-codemods.md](rules/040-versioning-codemods.md) — breaking change discipline.
- [rules/050-growth-lead-priorities.md](rules/050-growth-lead-priorities.md) — every change must move ROOS / indexation / citation share / pipeline.
- [rules/060-human-in-the-loop.md](rules/060-human-in-the-loop.md) — five HITL gates, what is autonomous between them.
- [rules/070-funnel-discipline.md](rules/070-funnel-discipline.md) — intent → CTA → micro-conversion → email warm-up → primary conversion.
- [rules/080-seo-operating-standards.md](rules/080-seo-operating-standards.md) — SEO standards binding for OS contributors (phantom-package rule, citation policy, brand-lint contract honesty).

## Strategic context (top-level)

- [../SEO_OPERATING_STANDARDS.md](../SEO_OPERATING_STANDARDS.md) — binding 2026 SEO operating standards.
- [../MISSION.md](../MISSION.md) — operating creed and five principles.
- [../VISION.md](../VISION.md) — 12 / 24 month target state.
- [../AUDIENCE.md](../AUDIENCE.md) — primary persona is a Growth/Performance Marketing lead.
- [../COMPETITIVE.md](../COMPETITIVE.md) — six-category landscape and white space.
- [../AGENTS.md](../AGENTS.md) — top-level entry point for AI agents.

## Skills (on-demand)

- [skills/extract-from-career-hub.md](skills/extract-from-career-hub.md) — playbook for Phase 1+2 extractions.
- [skills/strapi-package-design.md](skills/strapi-package-design.md) — patterns for the Strapi track.
- [skills/configurator-prompt-design.md](skills/configurator-prompt-design.md) — Phase 3+4 chains and golden-set design.
- [skills/quality/web-shell-quality-ratchet.md](skills/quality/web-shell-quality-ratchet.md) — milestones M1–M4 for `apps/web` and how to read `pnpm web:loop` reports.
