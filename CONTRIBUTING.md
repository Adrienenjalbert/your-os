# Contributing to your-os

This monorepo is the source of truth for the multi-tenant SEO content OS that powers Career Hub (B2C, code-mode) and Employer Hub (B2B, Strapi-mode).

## Setup

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm test
pnpm lint
```

## Workflow

1. Create a branch off `main`.
2. Make your change. Add tests.
3. Run `pnpm changeset` and select the packages your change touches + the bump type. Commit the resulting `.changeset/*.md` file.
4. Open a PR. CI runs `lint`, `typecheck`, `test`, `build` plus integration checks against `examples/minimal` and `examples/minimal-strapi`.
5. Merge to `main`. The release workflow opens a `Version Packages` PR.
6. Merging the `Version Packages` PR publishes to npm.

## Hard rules

- **Never touch Career Hub directly from this repo.** Career Hub lives at `../nextjs-app/` (eventually a separate repo) and consumes `@your-os/*` via npm. If your change requires Career Hub-side work, that's a Career Hub PR.
- **Strapi packages are isolated.** Career Hub never imports `@your-os/strapi-*`. Anything that depends on Strapi must compose via `@your-os/content-source`, never as a hard import.
- **Breaking `tenant.config.ts` or Strapi-template schema changes require a codemod** under `tooling/codemods/`. No exceptions.
- **One feature per PR.** Mixed-scope PRs get split.
- **CI gates are byte-equivalence** where the change touches an extracted-from-Career-Hub helper. Add a fixture under `examples/career-hub-snapshot/` and assert byte-identical output.

## Folder layout

See [README.md](README.md) for the full layout. TL;DR:

- `apps/` — apps and shells (`web` Next.js shell, `configurator`, `control-plane`, `docs`).
- `packages/` — versioned libraries published to npm as `@your-os/*` (26 packages: core engine, Strapi track, tooling configs, headless `@your-os/console`).
- `examples/` — bare-minimum tenant projects used as integration tests in CI.
- `tooling/` — internal scripts and generators (not published).
- `.agents/` — guidance for AI agents working **on the OS itself** (not what ships to tenants — those skills live in `packages/skills/`).

## Testing

- Unit: `vitest` per-package.
- Integration: `examples/minimal` (code-mode) + `examples/minimal-strapi` (Docker Compose Strapi + Postgres).
- E2E: Playwright in `examples/*` (Phase 3+).

## Releasing

Don't release manually. The Changesets workflow handles it. If something is wrong with a release, file an issue, don't paper over with `pnpm publish`.
