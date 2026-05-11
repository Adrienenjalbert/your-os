import type { Metadata } from "next";
import { type SEOSiteContext, generateSEOMetadata } from "./metadata.js";

export function generateNotFoundMetadata(
  context: SEOSiteContext,
  entity = "Page",
  baseUrl = "",
): Metadata {
  const label = entity.trim() || "Page";
  return generateSEOMetadata({
    config: {
      title: `${label} Not Found`,
      description: `The requested ${label.toLowerCase()} could not be found.`,
      canonical: `${baseUrl}/404`,
      noindex: true,
      nofollow: true,
    },
    context,
  });
}

export function generateGuideMetadata(
  context: SEOSiteContext,
  article: {
    title: string;
    slug: string;
    description: string;
    category?: string;
    tags?: string[];
    publishedDate?: string;
    updatedDate?: string;
  },
  baseUrl = "",
): Metadata {
  return generateSEOMetadata({
    config: {
      title: article.title,
      description: article.description,
      canonical: `${baseUrl}/guides/${article.slug}`,
      ogType: "article",
      publishedTime: article.publishedDate,
      modifiedTime: article.updatedDate,
      section: article.category,
      tags: article.tags,
      keywords: article.tags ?? [],
    },
    context,
  });
}

export function generateToolMetadata(
  context: SEOSiteContext,
  tool: {
    name: string;
    slug: string;
    description: string;
    keywords?: string[];
    canonicalOverride?: string;
    noindex?: boolean;
  },
  baseUrl = "",
): Metadata {
  return generateSEOMetadata({
    config: {
      title: `${tool.name} | Free Online Calculator`,
      description: tool.description,
      canonical: tool.canonicalOverride ?? `${baseUrl}/tools/${tool.slug}`,
      ogType: "website",
      keywords: tool.keywords ?? [tool.name.toLowerCase(), "calculator", "free tool"],
      noindex: tool.noindex,
    },
    context,
  });
}
