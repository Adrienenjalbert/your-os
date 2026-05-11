# Changesets

This folder is the source of truth for OS package versioning.

## How to add a changeset

```bash
pnpm changeset
```

Walk through the prompts:

1. Pick the packages your PR changes.
2. Pick the bump type per package (`patch | minor | major`).
3. Write a one-line summary that will appear in the changelog.

Commit the generated `.changeset/*.md` file with your PR.

## How releases happen

When PRs with changesets are merged to `main`, the `release` GitHub Action opens (or updates) a `Version Packages` PR. Merging that PR:

1. Bumps versions in `package.json` files.
2. Updates each package's `CHANGELOG.md`.
3. Publishes to npm via `pnpm changeset publish`.

## Breaking changes (`major`)

Any breaking change to `tenant.config.ts` schema or to a Strapi schema bundled in `@your-os/strapi-template` MUST ship with a codemod under [tooling/codemods/](../tooling/codemods/). No exceptions — that's how tenants take updates without manual rewrites.
