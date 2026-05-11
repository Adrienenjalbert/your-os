import { buildSiteContextFromTenant } from "@your-os/seo";
import { tenantConfig } from "../tenant.config.js";

export const seoContext = buildSiteContextFromTenant(tenantConfig, {
  siteOgImageUrl: "https://minimal.example.com/og.png",
  siteTwitterHandle: "@minimaldemo",
});
