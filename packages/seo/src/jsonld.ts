import type { SEOSiteContext } from "./metadata.js";

/**
 * Minimal JSON-LD generators for the most common pSEO + content shapes.
 * Phase 1 ships only the shapes Career Hub uses today; more land in Phase 2
 * via @your-os/core's page shells.
 */

export interface JsonLdInput {
  context: SEOSiteContext;
  baseUrl: string;
}

export function buildOrganizationJsonLd({ context, baseUrl }: JsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: context.organizationName,
    url: baseUrl,
    ...(context.siteOgImageUrl && { logo: context.siteOgImageUrl }),
  };
}

export interface ArticleJsonLdInput extends JsonLdInput {
  article: {
    title: string;
    description: string;
    slug: string;
    publishedDate?: string;
    updatedDate?: string;
    authorName?: string;
    image?: string;
  };
}

export function buildArticleJsonLd({ context, baseUrl, article }: ArticleJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.image ?? context.siteOgImageUrl,
    datePublished: article.publishedDate,
    dateModified: article.updatedDate ?? article.publishedDate,
    author: {
      "@type": "Person",
      name: article.authorName ?? context.organizationName,
    },
    publisher: {
      "@type": "Organization",
      name: context.organizationName,
      logo: {
        "@type": "ImageObject",
        url: context.siteOgImageUrl,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/guides/${article.slug}`,
    },
  };
}

export interface BreadcrumbJsonLdInput {
  baseUrl: string;
  trail: Array<{ name: string; path: string }>;
}

export function buildBreadcrumbJsonLd({ baseUrl, trail }: BreadcrumbJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  };
}
