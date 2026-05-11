import type { Metadata } from "next";

/**
 * SEO config shape, extracted unchanged from Career Hub's
 * `nextjs-app/src/lib/seo/types.ts`.
 */
export interface SEOMetaConfig {
  // Required
  title: string;
  description: string;
  canonical: string;

  // Open Graph
  ogType?: "website" | "article" | "profile";
  openGraphTitle?: string;
  openGraphDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;

  // Article specific
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];

  // Twitter
  twitterCard?: "summary" | "summary_large_image" | "app";
  twitterTitle?: string;
  twitterDescription?: string;

  // Additional
  noindex?: boolean;
  nofollow?: boolean;
  keywords?: string[];

  // Geo
  geoRegion?: string;
  geoPlacename?: string;

  // Language
  lang?: string;
  alternateLanguages?: Array<{ lang: string; href: string }>;
}

/**
 * Per-tenant constants previously hard-coded in Career Hub's
 * `src/lib/site/constants.ts`. Tenants pass these once at app boot.
 */
export interface SEOSiteContext {
  organizationName: string;
  siteName: string;
  siteOgImageUrl?: string;
  siteTwitterHandle?: string;
  /**
   * Hook for tenant-specific noindex gating (e.g. Career Hub's pillar-launch
   * gate). Returns true to force noindex when the user did not pass an
   * explicit value. Default: () => false.
   */
  shouldNoindexCanonical?: (canonical: string) => boolean;
}

export interface SEOMetaInput {
  config: SEOMetaConfig;
  context: SEOSiteContext;
}

/**
 * Tenant-agnostic equivalent of Career Hub's `generateSEOMetadata`. Algorithm
 * is byte-identical when given equivalent inputs (same constants, same
 * config). The phased-launch noindex behavior is moved behind a hook supplied
 * by the tenant.
 */
export function generateSEOMetadata({ config, context }: SEOMetaInput): Metadata {
  const {
    title,
    description,
    canonical,
    ogType = "website",
    openGraphTitle,
    openGraphDescription,
    ogImage = context.siteOgImageUrl,
    ogImageAlt = title,
    publishedTime,
    modifiedTime,
    author = context.organizationName,
    section,
    tags = [],
    twitterCard = "summary_large_image",
    twitterTitle,
    twitterDescription,
    noindex,
    nofollow,
    keywords = [],
    alternateLanguages = [],
  } = config;

  const tenantGated = context.shouldNoindexCanonical?.(canonical) ?? false;
  const resolvedNoindex = noindex ?? tenantGated;
  const resolvedNofollow = nofollow ?? false;

  const fullTitle = title.includes(context.organizationName)
    ? title
    : `${title} | ${context.organizationName}`;
  const siteName = context.siteName;

  return {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    authors: [{ name: author }],
    creator: context.organizationName,
    publisher: context.organizationName,

    openGraph: {
      type: ogType as "website" | "article" | "profile",
      siteName,
      title: openGraphTitle ?? fullTitle,
      description: openGraphDescription ?? description,
      url: canonical,
      locale: "en_US",
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: ogImageAlt,
            },
          ]
        : undefined,
      ...(ogType === "article" && {
        publishedTime,
        modifiedTime,
        authors: [author],
        section,
        tags,
      }),
    },

    twitter: {
      card: twitterCard,
      site: context.siteTwitterHandle,
      title: twitterTitle ?? fullTitle,
      description: twitterDescription ?? description,
      images: ogImage ? [ogImage] : undefined,
    },

    robots: {
      index: !resolvedNoindex,
      follow: !resolvedNofollow,
      googleBot: {
        index: !resolvedNoindex,
        follow: !resolvedNofollow,
        "max-video-preview": -1,
        "max-image-preview": "large" as const,
        "max-snippet": -1,
      },
    },

    alternates: {
      canonical,
      languages:
        alternateLanguages.length > 0
          ? Object.fromEntries(alternateLanguages.map((a) => [a.lang, a.href]))
          : undefined,
    },
  };
}
