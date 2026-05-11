import { type Article, ArticleSchema } from "@your-os/content-types";

export const article: Article = ArticleSchema.parse({
  slug: "getting-started",
  title: "Getting started with Minimal Hub",
  description: "A demo article that proves @your-os/* packages compose end-to-end.",
  body: "Welcome. This article exists so the example builds (BLS 2025).",
  pillarSlug: "guides",
  authorName: "Demo Author",
  dateModified: "2026-04-12T00:00:00.000Z",
  citations: [{ source: "BLS", url: "https://bls.gov", year: 2025 }],
  personaIds: ["demo-user"],
  icpIds: [],
  seo: { noIndex: false, keywords: ["demo", "minimal"] },
});
