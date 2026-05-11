/**
 * @your-os/strapi-seo
 *
 * - The canonical Strapi component for universal SEO fields
 *   (`shared.seo`) that gets injected into every editorial content-type.
 * - A mapper that turns a populated Strapi entry into the input
 *   shape `@your-os/seo` expects.
 *
 * Schemas live as plain JSON so they can be dropped into the Strapi
 * codebase via `@your-os/strapi-template`.
 */
export { SEO_COMPONENT, SEO_COMPONENT_PATH } from "./component.js";
export {
  toSeoMetaConfig,
  type StrapiSeoFields,
  type StrapiEntryWithSeo,
} from "./mapper.js";
