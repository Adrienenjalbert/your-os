---
name: strapi-package-design
description: Patterns for building the @your-os/strapi-* packages without leaking Strapi assumptions into the rest of the OS.
---

# Strapi package design

## Core principle

The OS is CMS-agnostic. Strapi is one supported content source via `@your-os/content-source`. Anything Strapi-specific lives in `@your-os/strapi-*` packages and is composed in only when a tenant declares Strapi mode in `tenant.config.ts`.

## Package responsibilities

- `strapi-template` — schema-as-code, migration runner. Idempotent.
- `strapi-deploy` — provisioning templates. Output: a deployable Render/Railway/Fly project.
- `strapi-sync` — Next.js side: webhook handler, preview routes, tag convention.
- `strapi-seo` — Strapi plugin: universal SEO fields + Yoast-style scoring.
- `strapi-codegen` — introspect Strapi → emit TS types + Zod schemas.
- `strapi-brand-lint-hook` — Strapi `beforePublish` lifecycle → calls `@your-os/brand-lint`.

## Forbidden

- Importing `@your-os/strapi-*` from `@your-os/core`, `seo`, `brand-lint`, `pseo-engine`, `tools-engine`, `analytics`. Use `@your-os/content-source` adapters as the seam.
- Hardcoding Strapi REST/GraphQL URLs. Read from `tenantConfig.strapi.baseUrl`.
- Putting tenant secrets in code. Use env var indirection (`tenantConfig.strapi.apiTokenEnv`).
- Coupling to Strapi Cloud-specific features. The deploy templates are self-host-first.
