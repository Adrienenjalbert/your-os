/**
 * @your-os/pseo-engine
 *
 * Programmatic SEO scaffolding generalized from Career Hub's `roles x cities`
 * pattern. N-dimensional cell generator with deduplication, slug helpers,
 * uniqueness checks, and template-rendering plumbing.
 *
 * pSEO cells are always code-source (generated at build time, not edited in
 * a CMS). The Strapi adapter never serves pSEO cells.
 */
export {
  generateCells,
  type Dimension,
  type Cell,
  type GenerateCellsOptions,
} from "./generator.js";
export { renderTemplate, type TemplateContext } from "./template.js";
export { uniquenessRatio, type UniquenessReport } from "./uniqueness.js";
