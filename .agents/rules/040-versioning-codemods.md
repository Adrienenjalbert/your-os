# Rule 040 — Versioning + codemods

## Versioning

- Independent versioning per package, via Changesets.
- Semver: `patch` for bug fixes, `minor` for additive features, `major` for breaking changes.
- `@your-os/tenant-config` schema changes are **almost always** breaking — bump major + ship a codemod.
- `@your-os/strapi-template` schema changes are **almost always** breaking — bump major + ship a codemod + a Strapi migration runner upgrade path.

## Codemods

Required for any breaking change to:

- `tenant.config.ts` schema (add/remove/rename field).
- `@your-os/strapi-template` content-type schemas.
- Public API of any package.

Codemods live in `tooling/codemods/<package>-<from>-to-<to>/`. Use `jscodeshift` for TS, `ts-morph` when AST manipulation needs more power.

## Release flow

1. PR with package change + changeset entry merges to `main`.
2. Changesets bot opens/updates a `Version Packages` PR.
3. Merging that PR bumps versions, updates changelogs, publishes to npm.
4. Release notes auto-generated.

Tenants upgrade by `pnpm up @your-os/*` and running `npx @your-os/codemods` if a major was included.
