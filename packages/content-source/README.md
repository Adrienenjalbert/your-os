# @your-os/content-source

The ContentSource abstraction + Code/Strapi/Hybrid adapters. The seam that lets tenants pick code, Strapi, or hybrid per content-type.

## Status

`beta` — see the [stability legend](../../README.md#packages) and [`@your-os/typescript-config`](../typescript-config/README.md) for what each level guarantees.

## Install

```bash
pnpm add @your-os/content-source
```

## Where it fits

- **Layer**: core engine (Layer 1) — see the [architecture diagram](../../README.md#architecture-in-one-diagram).
- **Reads from**: `tenant.config.ts` (validated by [`@your-os/tenant-config`](../tenant-config/README.md)).
- **Source of truth for behavior**: `src/` and the in-package tests (`*.test.ts`).

For agent-facing rules and the OS architecture, start at [AGENTS.md](../../AGENTS.md).
