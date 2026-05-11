/**
 * @your-os/core
 *
 * CMS-agnostic page shells. Tenants compose these in their App Router
 * routes; the same shell renders identically whether the data came from
 * code, Strapi, or hybrid (the `ContentSource` plumbing is the seam).
 *
 * Phase 2: ships the shells + primitives needed by examples/minimal.
 * Phase 5: more shells added as Employer Hub surfaces them.
 */
export { PageContainer } from "./components/PageContainer.js";
export { PageSection } from "./components/PageSection.js";
export { StandardPageLayout } from "./components/StandardPageLayout.js";
export { ContentPageShell } from "./components/ContentPageShell.js";
export { ToolPageShell } from "./components/ToolPageShell.js";
export { RolePageShell } from "./components/RolePageShell.js";
export { FAQSection } from "./components/FAQSection.js";
export { CTASection } from "./components/CTASection.js";
export { InternalLinkHub } from "./components/InternalLinkHub.js";
export { Breadcrumbs } from "./components/Breadcrumbs.js";

export type { TenantBranding } from "./theming.js";
export { tenantBrandingFromConfig } from "./theming.js";
