/**
 * Strapi component path expected by `@your-os/strapi-template`'s migration runner.
 * Drop the `SEO_COMPONENT` JSON at `src/components/<SEO_COMPONENT_PATH>.json`
 * inside the tenant's Strapi project.
 */
export const SEO_COMPONENT_PATH = "shared/seo";

/**
 * Universal SEO component used by every editorial content-type.
 * Mirrors `SeoFieldsSchema` in `@your-os/content-types` so the Strapi UI and
 * the TypeScript-typed read path stay in lock-step.
 */
export const SEO_COMPONENT = {
  collectionName: "components_shared_seo",
  info: {
    displayName: "SEO",
    description:
      "Universal SEO fields injected into every editorial content-type by @your-os/strapi-seo.",
    icon: "search",
  },
  options: {},
  attributes: {
    metaTitle: { type: "string", required: true, maxLength: 70 },
    metaDescription: { type: "string", required: true, maxLength: 160 },
    canonicalURL: { type: "string" },
    keywords: { type: "string" },
    ogTitle: { type: "string", maxLength: 70 },
    ogDescription: { type: "string", maxLength: 200 },
    ogImage: { type: "media", multiple: false, allowedTypes: ["images"] },
    twitterCard: {
      type: "enumeration",
      enum: ["summary", "summary_large_image"],
      default: "summary_large_image",
    },
    structuredData: { type: "json" },
    noIndex: { type: "boolean", default: false },
  },
} as const;
