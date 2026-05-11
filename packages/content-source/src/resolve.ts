import type { ContentSourceSpec } from "@your-os/tenant-config";
import { CodeContentSource } from "./code-source.js";
import { HybridContentSource } from "./hybrid-source.js";
import type { ContentEntity, ContentSource } from "./types.js";

export interface ResolveContentSourceArgs<T extends ContentEntity> {
  spec: ContentSourceSpec;
  /**
   * Tenant-supplied factory for code-mode entries (the page knows its own
   * content type; the OS doesn't import tenant data files).
   */
  codeEntries?: () => readonly T[] | Promise<readonly T[]>;
  /**
   * Phase 2B onward: factory that returns a configured StrapiContentSource for
   * the given collection. Provided by `@your-os/strapi-sync` as the seam,
   * never imported here directly so this package stays Strapi-free.
   */
  strapiSourceFactory?: (collection: string, locale?: string) => ContentSource<T>;
}

/**
 * Convert a `tenantConfig.contentSources[type]` spec into a usable
 * ContentSource. The OS never imports Strapi: tenants pass the Strapi factory
 * in (typically wired in their app layout), and code-mode entries are passed
 * in as a thunk so this resolver stays pure.
 */
export async function resolveContentSource<T extends ContentEntity>(
  args: ResolveContentSourceArgs<T>,
): Promise<ContentSource<T>> {
  const { spec } = args;
  if (spec.mode === "code") {
    if (!args.codeEntries) {
      throw new Error(
        "resolveContentSource: spec mode is 'code' but no codeEntries factory was provided.",
      );
    }
    const entries = await args.codeEntries();
    return new CodeContentSource<T>({ entries });
  }
  if (spec.mode === "strapi") {
    if (!args.strapiSourceFactory) {
      throw new Error(
        "resolveContentSource: spec mode is 'strapi' but no strapiSourceFactory was provided. " +
          "Wire one from @your-os/strapi-sync at app boot.",
      );
    }
    return args.strapiSourceFactory(spec.strapiCollection, spec.locale);
  }
  // hybrid: recurse and compose.
  const [primary, fallback] = await Promise.all([
    resolveContentSource<T>({ ...args, spec: spec.primary }),
    resolveContentSource<T>({ ...args, spec: spec.fallback }),
  ]);
  return new HybridContentSource<T>(primary, fallback);
}
