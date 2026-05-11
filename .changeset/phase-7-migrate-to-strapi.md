---
"@your-os/migrate-to-strapi": minor
---

Phase 7 — opt-in `migrate-to-strapi` codemod ships:

- `migrateEntries(opts)` — walks a code-mode `ContentSource`, maps each entity, and idempotently POSTs to Strapi (skips already-migrated slugs via `filters[slug][$eq]`).
- `byteEquivalenceHarness({ code, strapi, render })` — dual-source rendering harness; returns diverged slugs with byte-level diff cursors. The kill-condition for partial migrations.
- `your-os-migrate-to-strapi` CLI — refuses to run without `--i-confirm-this-is-not-career-hub` to defeat accidental invocation.

Career Hub launch protection: this package is shipped but is never imported by Career Hub. The opt-in trigger is documented in `packages/migrate-to-strapi/README.md`.
