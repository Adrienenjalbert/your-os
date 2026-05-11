---
"@your-os/tenant-config": minor
"@your-os/content-source": minor
"@your-os/brand-lint": minor
"@your-os/seo": minor
---

Phase 1 first extractions from Career Hub.

- `@your-os/tenant-config`: Zod-validated `tenant.config.ts` schema covering identity, audience, conversion, brand, SEO, pSEO, tools, trust, analytics, performance, integrations, agentContext, contentSources, strapi. `defineTenant()` helper preserves literal types; `parseTenantConfig()` validates at boot.
- `@your-os/content-source`: `ContentSource<T>` interface + `CodeContentSource` (zero-runtime, type-safe) + `HybridContentSource` (composes two sources for Phase 7 dual-source migration) + `resolveContentSource()` (turns a tenant config spec into a usable source; takes a Strapi factory injected by `@your-os/strapi-sync` later so this package stays Strapi-free).
- `@your-os/brand-lint`: Byte-equivalent extraction of Career Hub's `pnpm brand:lint`. Programmatic `lintFile()` + `runCli()` + `your-os-brand-lint` bin. Default rules mirror Career Hub's `nextjs-app/scripts/agents/brand-lint.mjs`. `buildRulesFromTenantConfig()` extends defaults with tenant-specific banned phrases.
- `@your-os/seo`: Byte-equivalent extraction of Career Hub's `nextjs-app/src/lib/seo/`. `generateSEOMetadata()`, `generateGuideMetadata()`, `generateToolMetadata()`, `generateNotFoundMetadata()`, JSON-LD builders for Organization/Article/Breadcrumb, `calculateReadingTime`, `generateKeywords`. Tenant constants injected via `SEOSiteContext` (no module-level Career Hub references).

Phase 1 gate met:

- All four packages: vitest passes (50+ tests across the four).
- Byte-equivalence verified: `examples/career-hub-snapshot/brand-lint.test.ts` produces the same 3 blocks (banned_phrase, ai_slop, missing_citation) as the Career Hub baseline run on the same fixture.
- Career Hub repo NOT touched. Re-pointing Career Hub's imports to these packages is a separate Career Hub PR.
