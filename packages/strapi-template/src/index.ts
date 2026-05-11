/**
 * @your-os/strapi-template
 *
 * Strapi 5 schema-as-code. Each Strapi instance pulls its content-type
 * schemas from this package via `pnpm exec your-os strapi:migrate`. Admin
 * schema editing is disabled in production
 * (STRAPI_ADMIN_DISABLE_CONTENT_TYPE_BUILDER=true) so schemas can never
 * drift from this source of truth.
 *
 * Default content-types (universal across tenants):
 *   article, pillar, cluster, persona, icp, case-study, opportunity-brief,
 *   role-guide. Each gets the universal SEO field bundle from
 *   `@your-os/strapi-seo`.
 */
export { CONTENT_TYPES, type ContentTypeDefinition, type StrapiAttribute } from "./schema.js";
export {
  MigrationRunner,
  type Migration,
  type MigrationContext,
  type MigrationResult,
} from "./migration-runner.js";
export { TEMPLATE_VERSION } from "./version.js";
