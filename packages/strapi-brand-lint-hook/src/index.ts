/**
 * @your-os/strapi-brand-lint-hook
 *
 * Strapi 5 lifecycle hook (`beforePublish`) that runs `@your-os/brand-lint`
 * against the editor's content body. On any error-level issue, the publish is
 * blocked with an `ApplicationError` shown inline in the admin UI.
 *
 * Wire-up (in the tenant's Strapi project):
 *
 *   // src/api/article/content-types/article/lifecycles.ts
 *   import { createBrandLintLifecycles } from "@your-os/strapi-brand-lint-hook";
 *   import careerHubConfig from "../../../../../../tenant.config";
 *   export default createBrandLintLifecycles({
 *     tenantConfig: careerHubConfig,
 *     bodyFields: ["body"],
 *   });
 */
export {
  createBrandLintLifecycles,
  lintEntry,
  type BrandLintHookOptions,
  type LintEntryResult,
} from "./hook.js";
