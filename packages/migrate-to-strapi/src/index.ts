/**
 * @your-os/migrate-to-strapi
 *
 * OPT-IN ONLY. This codemod migrates a code-mode tenant's TypeScript
 * content data files into a Strapi instance. It is NEVER auto-run against
 * Career Hub data — the editorial team explicitly opts in by:
 *
 *   1. Standing up Strapi via `@your-os/strapi-deploy`.
 *   2. Provisioning the schema via `@your-os/strapi-template` migrations.
 *   3. Running `pnpm exec your-os-migrate-to-strapi` with explicit `--source` and `--target` flags.
 *
 * The dual-source byte-equivalence harness (`harness.ts`) renders both the
 * code source and the Strapi source through the same OS pipeline and asserts
 * the rendered output is byte-identical. This is the kill condition for a
 * partial migration: if any page diverges, the migration is rolled back.
 */
export {
  migrateEntries,
  type MigrateOptions,
  type MigrateResult,
  type MigrateEntry,
} from "./migrate.js";
export { byteEquivalenceHarness, type HarnessReport } from "./harness.js";
