/**
 * @your-os/content-source
 *
 * The seam that lets a tenant pick code, Strapi, or hybrid per content-type
 * without touching its page components.
 *
 * Phase 1 ships: ContentSource interface + CodeContentSource adapter.
 * Phase 2B will add: StrapiContentSource (in @your-os/strapi-* packages, composed in here).
 */
export type {
  ContentSource,
  ContentEntity,
  ListOpts,
  GetOpts,
  Revision,
} from "./types.js";
export { CodeContentSource, defineCodeSource, type CodeSourceOptions } from "./code-source.js";
export { HybridContentSource } from "./hybrid-source.js";
export { resolveContentSource, type ResolveContentSourceArgs } from "./resolve.js";
