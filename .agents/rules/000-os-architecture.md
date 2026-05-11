# Rule 000 — OS architecture

Always-on. Every agent working on the OS reads this.

## The four layers

1. **Layer 1 — packages/** (versioned, published to npm as `@your-os/*`).
2. **Layer 2 — packages/cli** scaffolds new tenant repos.
3. **Layer 3 — apps/configurator** = AI-driven onboarding.
4. **Layer 4 — tenants** (career-hub repo, employer-hub repo) consume Layer 1.

## Where code belongs

| Code type | Lives in |
|---|---|
| Versioned, public API for tenants | `packages/<name>` |
| Internal scripts not published | `tooling/scripts` |
| Codemods for breaking changes | `tooling/codemods` |
| Hosted apps | `apps/<name>` |
| Integration tests | `examples/<name>` |
| OS-developer guidance | `.agents/` (here) |
| Tenant-developer skills | `packages/skills` |

## Forbidden

- Cross-package deep imports (`@your-os/core/dist/internal/foo`). Public API only.
- Side-effects at module top-level in `packages/*`. Tree-shaking matters.
- Strapi-anything in non-Strapi packages. Use `@your-os/content-source` as the seam.
- Hardcoded tenant assumptions in `packages/*`. Read from `tenant.config.ts`.
- Touching `../nextjs-app/` from this monorepo. Career Hub is a separate consumer.

## Required

- Every package has: `package.json`, `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`, `src/index.ts`, `README.md`.
- Every published package extends `@your-os/typescript-config/library.json`.
- Every package's `README.md` documents its role + install + API surface.
- New packages added to `packages/` need a Changesets entry on the introducing PR.
