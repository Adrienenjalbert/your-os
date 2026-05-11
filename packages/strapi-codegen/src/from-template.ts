import { CONTENT_TYPES } from "@your-os/strapi-template";
import { type CodegenOptions, generateTypes } from "./generator.js";

/**
 * Convenience: codegen the default OS content-types.
 * Tenants extending the schema concatenate their additions before passing to
 * `generateTypes` directly.
 */
export function codegenFromContentTypes(opts: CodegenOptions = {}): string {
  return generateTypes(CONTENT_TYPES, opts);
}
