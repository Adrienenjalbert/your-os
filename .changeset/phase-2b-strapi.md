---
"@your-os/strapi-template": minor
"@your-os/strapi-deploy": minor
"@your-os/strapi-sync": minor
"@your-os/strapi-seo": minor
"@your-os/strapi-codegen": minor
"@your-os/strapi-brand-lint-hook": minor
---

Phase 2B — Strapi track ships:

- `@your-os/strapi-template` — schema-as-code content types + migration runner.
- `@your-os/strapi-deploy` — Render / Railway / Fly deploy file generators with Postgres + S3 + per-tenant secret discipline + RUNBOOK.md.
- `@your-os/strapi-sync` — webhook handler with HMAC verification + canonical `{tenant}:{contentType}:{slug}` tag scheme + preview/exit-preview helpers + `StrapiContentSource` adapter (implements `@your-os/content-source`).
- `@your-os/strapi-seo` — universal `shared.seo` Strapi component + mapper from Strapi entry → `@your-os/seo` metadata input.
- `@your-os/strapi-codegen` — TypeScript codegen from `ContentTypeDefinition[]` into a hand-rollable single-file types module + CLI.
- `@your-os/strapi-brand-lint-hook` — Strapi 5 `beforePublish`/`beforeUpdate` lifecycle that runs `@your-os/brand-lint` and blocks publish on banned phrases / missing citations.

CI gate met: `examples/minimal-strapi` typechecks + tests against every `@your-os/strapi-*` package end-to-end. Career Hub launch protection unchanged — no Strapi integration is wired into Career Hub by this release.
