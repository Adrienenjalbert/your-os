import type { TenantConfig } from "@your-os/tenant-config";
import type { SEOSiteContext } from "./metadata.js";

export interface TenantBridgeOptions {
  /** Optional override; defaults to tenant.identity.name. */
  organizationName?: string;
  /** Optional override; defaults to tenant.identity.name. */
  siteName?: string;
  siteOgImageUrl?: string;
  siteTwitterHandle?: string;
  /**
   * Optional canonical-noindex hook (e.g. Career Hub's pillar-launch gate).
   * Tenants own this since it's tenant-specific operational behavior.
   */
  shouldNoindexCanonical?: (canonical: string) => boolean;
}

/**
 * Convert a TenantConfig + tenant-supplied identity overrides into the
 * SEOSiteContext shape this package consumes. Lets tenants pass tenantConfig
 * once and re-use everywhere instead of repeating identity strings.
 */
export function buildSiteContextFromTenant(
  tenant: Pick<TenantConfig, "identity">,
  options: TenantBridgeOptions = {},
): SEOSiteContext {
  return {
    organizationName: options.organizationName ?? tenant.identity.name,
    siteName: options.siteName ?? tenant.identity.name,
    siteOgImageUrl: options.siteOgImageUrl,
    siteTwitterHandle: options.siteTwitterHandle,
    shouldNoindexCanonical: options.shouldNoindexCanonical,
  };
}
