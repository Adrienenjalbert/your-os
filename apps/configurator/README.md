# @your-os/configurator

AI-driven onboarding engine. The 4-phase flow — **Discovery → AI Research → Confirmation → Generation** — lives here as a framework-agnostic library.

The hosted UI is in [`apps/web`](../web/README.md), which mounts `OnboardingMachine` behind `/onboarding/[stepId]`. A future CLI/TUI shell can drive the same machine without changes.

## What's in here

```
src/
├── onboarding/      ← OnboardingMachine + step definitions (canonical state machine)
├── research/        ← AI research providers (mock + live), eval harness, golden set
├── fixtures/        ← brief fixtures for CI (career-hub, employer-hub, minimal)
├── questionnaire.ts ← Discovery question bank
├── scaffold.ts      ← Generation: brief → tenant repo files
└── translate.ts     ← brief → tenant.config.ts mapping
```

## Status

CI gate: `examples/employer-hub` is scaffolded by this package from `examples/employer-hub/employer-hub.brief.json`. If that round-trip fails, the configurator regressed.

## Where it fits

- **Layer**: app — hosts the AI flow consumed by `apps/web`.
- **Skill for editing prompts**: [`.agents/skills/configurator-prompt-design.md`](../../.agents/skills/configurator-prompt-design.md).
- **Architecture rules**: [`AGENTS.md`](../../AGENTS.md).
