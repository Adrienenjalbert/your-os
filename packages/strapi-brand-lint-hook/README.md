# @your-os/strapi-brand-lint-hook

Strapi beforePublish lifecycle hook → calls @your-os/brand-lint → blocks publish on banned phrases / DBA prevalence < target / missing citations.

## Status

`alpha` — see the [stability legend](../../README.md#packages) and [`@your-os/typescript-config`](../typescript-config/README.md) for what each level guarantees.

## Install

```bash
pnpm add @your-os/strapi-brand-lint-hook
```

## Where it fits

- **Layer**: Strapi track — see the [architecture diagram](../../README.md#architecture-in-one-diagram).
- **Reads from**: `tenant.config.ts` (validated by [`@your-os/tenant-config`](../tenant-config/README.md)).
- **Source of truth for behavior**: `src/` and the in-package tests (`*.test.ts`).

For agent-facing rules and the OS architecture, start at [AGENTS.md](../../AGENTS.md).
