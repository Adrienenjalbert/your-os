# @your-os/tenant-config

The universal `tenant.config.ts` schema. Zod-validated. Every other @your-os/* package reads from here.

## Status

`beta` — see the [stability legend](../../README.md#packages) and [`@your-os/typescript-config`](../typescript-config/README.md) for what each level guarantees.

## Install

```bash
pnpm add @your-os/tenant-config
```

## Where it fits

- **Layer**: core engine (Layer 1) — see the [architecture diagram](../../README.md#architecture-in-one-diagram).
- **Role**: this package **defines** the `tenant.config.ts` schema that every other `@your-os/*` package reads. Change the schema here, regenerate types, then update consumers.
- **Source of truth for behavior**: `src/schema.ts` (Zod schema) and `src/schema.test.ts`.

For agent-facing rules and the OS architecture, start at [AGENTS.md](../../AGENTS.md).
