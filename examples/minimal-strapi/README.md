# `examples/minimal-strapi`

Strapi-mode parallel of `examples/minimal`. Used as the gold-standard scaffold target for the
configurator (Phase 4) and as the CI integration surface that keeps every `@your-os/strapi-*`
package working together.

## Layout

- `tenant.config.ts` — Strapi-mode `TenantConfig` (validates against `@your-os/tenant-config`)
- `src/data-source.ts` — wires `@your-os/strapi-sync`'s `StrapiContentSource` into the OS `ContentSource` seam
- `src/integration.test.ts` — integration test exercising every Strapi package end-to-end
- `docker-compose.yml` — local dev stack (Postgres + Strapi 5)
- `scripts/build-static.mjs` — placeholder build that satisfies CI

## Local dev

```bash
docker compose up -d
pnpm install
pnpm exec your-os strapi:migrate --tenant minimal-strapi  # provisions content-types from @your-os/strapi-template
pnpm test
```

## Production deploy

[`@your-os/strapi-deploy`](../../packages/strapi-deploy/README.md) generates the provider-specific files (Render / Railway / Fly + managed Postgres + S3 + nightly backups + restore) committed to the tenant's infra repo. Per-tenant secret rotation is owned by the tenant — never share secrets across tenants ([`.agents/rules/030-strapi-isolation.md`](../../.agents/rules/030-strapi-isolation.md)).
