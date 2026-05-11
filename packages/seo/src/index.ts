/**
 * @your-os/seo
 *
 * Tenant-agnostic SEO helpers extracted from Career Hub. Same algorithms,
 * tenant-injected constants. Designed to be byte-equivalent to Career Hub's
 * pre-extraction output when given the same inputs.
 */
export {
  generateSEOMetadata,
  type SEOMetaConfig,
  type SEOSiteContext,
  type SEOMetaInput,
} from "./metadata.js";
export { generateNotFoundMetadata, generateGuideMetadata, generateToolMetadata } from "./pages.js";
export { calculateReadingTime, generateKeywords } from "./helpers.js";
export {
  buildArticleJsonLd,
  buildOrganizationJsonLd,
  buildBreadcrumbJsonLd,
  type JsonLdInput,
} from "./jsonld.js";
export { buildSiteContextFromTenant } from "./tenant-bridge.js";
