/**
 * @your-os/tenant-config
 *
 * The universal injection point. Every other @your-os/* package reads from
 * here. Zod-validated so misconfigured tenants fail at boot, not in production.
 *
 * Two reference tenants:
 *  - Career Hub: B2C, code-mode for all content sources, app-install conversion.
 *  - Employer Hub: B2B, strapi-mode for editorial, demo-booking conversion.
 *
 * Schema design rules (per .agents/rules/040-versioning-codemods.md):
 *  - Add new fields as optional. Bump minor.
 *  - Renaming/removing fields is breaking. Bump major + ship a codemod.
 */
export {
  defineTenant,
  parseTenantConfig,
  TenantConfigSchema,
  type TenantConfig,
  type TenantConfigInput,
  type ContentSourceMode,
  type ContentSourceSpec,
  type BusinessModel,
  type ConversionEvent,
  type DistinctiveBrandAsset,
  type SearchIntent,
  type CtaArchetype,
  type IntentMapEntry,
  type MicroConversionDefinition,
  type EmailSequence,
  type EmailSequenceStep,
} from "./schema.js";
