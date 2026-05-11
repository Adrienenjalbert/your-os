import type { TenantConfig } from "@your-os/tenant-config";

export interface TenantBranding {
  organizationName: string;
  primaryCta: { label: string; href: string };
  domain: string;
}

export function tenantBrandingFromConfig(
  tenant: Pick<TenantConfig, "identity" | "conversion">,
  primaryCtaHref: string,
): TenantBranding {
  return {
    organizationName: tenant.identity.name,
    primaryCta: { label: tenant.conversion.ctaPattern, href: primaryCtaHref },
    domain: tenant.identity.domain,
  };
}
