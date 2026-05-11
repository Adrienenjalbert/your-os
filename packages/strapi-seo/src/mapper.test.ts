import { describe, expect, it } from "vitest";
import { toSeoMetaConfig } from "./mapper.js";

describe("toSeoMetaConfig", () => {
  it("uses canonicalURL when present", () => {
    const out = toSeoMetaConfig(
      {
        slug: "remote-work",
        publishedAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-02-01T00:00:00Z",
        author: { name: "Alex" },
        seo: {
          metaTitle: "Remote Work Guide",
          metaDescription: "How to work remotely.",
          canonicalURL: "https://example.com/remote-work",
          keywords: "remote, work, guide",
          ogImage: { url: "https://cdn.example.com/og.png", alternativeText: "Remote work" },
          twitterCard: "summary_large_image",
          noIndex: false,
        },
      },
      { canonicalPathPrefix: "/articles", origin: "https://example.com" },
    );
    expect(out.canonical).toBe("https://example.com/remote-work");
    expect(out.title).toBe("Remote Work Guide");
    expect(out.keywords).toEqual(["remote", "work", "guide"]);
    expect(out.author).toBe("Alex");
    expect(out.ogImage).toBe("https://cdn.example.com/og.png");
    expect(out.publishedTime).toBe("2026-01-01T00:00:00Z");
  });

  it("falls back to origin + path prefix + slug", () => {
    const out = toSeoMetaConfig(
      {
        slug: "remote-work",
        seo: { metaTitle: "T", metaDescription: "D" },
      },
      { canonicalPathPrefix: "/articles/", origin: "https://example.com/" },
    );
    expect(out.canonical).toBe("https://example.com/articles/remote-work");
  });

  it("defaults ogType to article", () => {
    const out = toSeoMetaConfig(
      { slug: "x", seo: { metaTitle: "T", metaDescription: "D" } },
      { canonicalPathPrefix: "/articles", origin: "https://example.com" },
    );
    expect(out.ogType).toBe("article");
  });
});
