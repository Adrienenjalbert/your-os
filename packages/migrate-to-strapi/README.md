# `@your-os/migrate-to-strapi`

> OPT-IN ONLY. NEVER auto-runs against Career Hub data.

Migrates a code-mode tenant's TypeScript content data files into a Strapi
instance, with a dual-source byte-equivalence harness that gates the cut-over.

## When to use

Use this codemod ONLY when an editorial team explicitly requests editing in
Strapi (e.g. non-engineers want to publish without a PR). Career Hub stays
code-mode by default — its content lives in `nextjs-app/src/features/*/data/*.ts`
and the editorial workflow is git PRs.

## Opt-in trigger

The CLI refuses to run unless you pass:

```bash
pnpm exec your-os-migrate-to-strapi \
  --source ./src/content/articles \
  --endpoint https://cms.your-tenant.com/api/articles \
  --token "$STRAPI_API_TOKEN" \
  --i-confirm-this-is-not-career-hub
```

## Programmatic API

```ts
import { migrateEntries, byteEquivalenceHarness } from "@your-os/migrate-to-strapi";

const result = await migrateEntries({
  source: codeContentSource,
  endpoint: "https://cms.your-tenant.com/api/articles",
  apiToken: process.env.STRAPI_API_TOKEN!,
  mapEntry: (e) => ({ slug: e.slug, data: e }),
});
```

## Cut-over gate

After running `migrateEntries`, run `byteEquivalenceHarness` against both the
code source and the freshly populated Strapi source. The harness returns the
list of slugs whose rendered output diverges. If `diverged > 0`, ROLL BACK —
do not flip the `tenant.config.ts` content-source mode.

```ts
const report = await byteEquivalenceHarness({
  code: codeSource,
  strapi: strapiSource,
  render: (entity) => renderArticleHtml(entity),
});
if (report.diverged > 0) throw new Error("byte-equivalence failed; rolling back.");
```

## Career Hub launch protection

This package is shipped with the OS but is never imported by Career Hub. The
Career Hub `package.json` explicitly does not depend on it; the migration
playbook lives in `STRAPI_OPT_IN_RUNBOOK.md` (in the Career Hub repo, when the
team opts in).
