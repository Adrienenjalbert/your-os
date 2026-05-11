/**
 * Strapi-side shape of the universal SEO component (`shared.seo`). Mirrors
 * `SEO_COMPONENT.attributes` so any change to the component requires a
 * matching change here at compile time.
 */
export interface StrapiSeoFields {
  metaTitle: string;
  metaDescription: string;
  canonicalURL?: string | null;
  keywords?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: { url?: string; alternativeText?: string | null } | null;
  twitterCard?: "summary" | "summary_large_image" | null;
  structuredData?: unknown;
  noIndex?: boolean | null;
}

export interface StrapiEntryWithSeo {
  /** Strapi entry slug; used to build canonical when seo.canonicalURL is empty. */
  slug?: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  /** Author name, if the content-type populates it. */
  author?: { name?: string | null } | null;
  seo: StrapiSeoFields;
}

export interface ToSeoMetaConfigOptions {
  /** Site-relative path used for canonical fallback (e.g. "/articles/[slug]"). */
  canonicalPathPrefix: string;
  /** Origin (no trailing slash) used to absolutize canonical. */
  origin: string;
  /** Force ogType. Defaults to "article". */
  ogType?: "website" | "article" | "profile";
}

/**
 * Map a populated Strapi entry to the input expected by
 * `@your-os/seo`'s `generateSEOMetadata`.
 */
export function toSeoMetaConfig(
  entry: StrapiEntryWithSeo,
  opts: ToSeoMetaConfigOptions,
): import("@your-os/seo").SEOMetaConfig {
  const { seo } = entry;
  const trimmedOrigin = opts.origin.replace(/\/$/, "");
  const slug = entry.slug ?? "";
  const fallbackCanonical = `${trimmedOrigin}${opts.canonicalPathPrefix.replace(/\/$/, "")}/${slug}`;
  const canonical = seo.canonicalURL?.trim() || fallbackCanonical;

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    canonical,
    ogType: opts.ogType ?? "article",
    openGraphTitle: seo.ogTitle ?? undefined,
    openGraphDescription: seo.ogDescription ?? undefined,
    ogImage: seo.ogImage?.url ?? undefined,
    ogImageAlt: seo.ogImage?.alternativeText ?? undefined,
    publishedTime: entry.publishedAt ?? undefined,
    modifiedTime: entry.updatedAt ?? undefined,
    author: entry.author?.name ?? undefined,
    twitterCard: seo.twitterCard ?? undefined,
    keywords: seo.keywords
      ? seo.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)
      : undefined,
    noindex: seo.noIndex ?? undefined,
  };
}
