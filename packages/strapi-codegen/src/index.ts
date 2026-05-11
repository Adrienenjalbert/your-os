/**
 * @your-os/strapi-codegen
 *
 * Reads either:
 *   - a `ContentTypeDefinition[]` (the typed schema-as-code source from
 *     `@your-os/strapi-template`), or
 *   - the JSON output of Strapi 5's `/api/content-type-builder/content-types`
 *     introspection endpoint
 *
 * and produces a single-file TypeScript module that the tenant's app
 * imports for typed access to its Strapi entries.
 *
 * The output is intentionally hand-rollable too — the generated file has
 * zero runtime dependencies; tenants can vendor it without taking a peer
 * on this package.
 */
export { generateTypes, type CodegenOptions } from "./generator.js";
export { codegenFromContentTypes } from "./from-template.js";
