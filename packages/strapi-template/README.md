# @your-os/strapi-template

Strapi 5 schema-as-code template. Default content-types: Article, Pillar, Cluster, Persona, ICP, CaseStudy, OpportunityBrief, RoleGuide. Includes migration runner.

## Status

`beta` — see the [stability legend](../../README.md#packages) and [`@your-os/typescript-config`](../typescript-config/README.md) for what each level guarantees.

## Install

```bash
pnpm add @your-os/strapi-template
```

## Where it fits

- **Layer**: Strapi track — see the [architecture diagram](../../README.md#architecture-in-one-diagram).
- **Reads from**: `tenant.config.ts` (validated by [`@your-os/tenant-config`](../tenant-config/README.md)).
- **Source of truth for behavior**: `src/` and the in-package tests (`*.test.ts`).

For agent-facing rules and the OS architecture, start at [AGENTS.md](../../AGENTS.md).
