# Rule 030 — Strapi isolation

The Strapi track (Phase 2B) must never leak into Career Hub.

## Hard rules

- Career Hub repo never imports `@your-os/strapi-*`.
- `@your-os/core`, `@your-os/seo`, `@your-os/brand-lint`, `@your-os/pseo-engine`, `@your-os/tools-engine`, `@your-os/analytics`, `@your-os/cli` core commands — none of these may import `@your-os/strapi-*`.
- The only seam is `@your-os/content-source`. Tenants pick `mode: "code" | "strapi" | "hybrid"` per content-type.
- `examples/minimal` (code-mode) must not depend on any `@your-os/strapi-*` package.
- `examples/minimal-strapi` may depend on Strapi packages, but its CI is a separate matrix job; it must not gate `examples/minimal` builds.

## Why

Strapi work is a separate parallel track on the build plan. The principle: a tenant in code-mode never ships, downloads, or evaluates a single byte of Strapi-related code. This protects bundle size, reduces blast radius, and lets Career Hub stay in code-mode forever if it prefers.

## How CI enforces

- ESLint/Biome import-restriction rule blocks `@your-os/strapi-*` imports outside Strapi packages.
- A `pnpm why` check in CI fails if `@your-os/example-minimal` resolves any `@your-os/strapi-*` package.
