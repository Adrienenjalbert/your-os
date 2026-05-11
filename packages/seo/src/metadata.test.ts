import { describe, expect, it } from "vitest";
import { type SEOSiteContext, generateSEOMetadata } from "./metadata.js";

const careerHubContext: SEOSiteContext = {
  organizationName: "Indeed Flex",
  siteName: "Indeed Flex Career Hub",
  siteOgImageUrl: "https://indeedflex.com/og.png",
  siteTwitterHandle: "@indeedflex",
};

describe("generateSEOMetadata", () => {
  it("appends organization name to title when not present", () => {
    const m = generateSEOMetadata({
      config: { title: "Picking Up Shifts", description: "d", canonical: "https://x" },
      context: careerHubContext,
    });
    expect(m.title).toBe("Picking Up Shifts | Indeed Flex");
  });

  it("does not double-append organization name", () => {
    const m = generateSEOMetadata({
      config: { title: "Indeed Flex Careers", description: "d", canonical: "https://x" },
      context: careerHubContext,
    });
    expect(m.title).toBe("Indeed Flex Careers");
  });

  it("populates canonical alternate", () => {
    const m = generateSEOMetadata({
      config: {
        title: "T",
        description: "d",
        canonical: "https://indeedflex.com/roles/server",
      },
      context: careerHubContext,
    });
    expect(m.alternates?.canonical).toBe("https://indeedflex.com/roles/server");
  });

  it("respects explicit noindex over tenant gate", () => {
    const m = generateSEOMetadata({
      config: { title: "T", description: "d", canonical: "https://x", noindex: true },
      context: { ...careerHubContext, shouldNoindexCanonical: () => false },
    });
    expect(m.robots).toMatchObject({ index: false });
  });

  it("falls back to tenant gate when noindex unset", () => {
    const m = generateSEOMetadata({
      config: { title: "T", description: "d", canonical: "https://x/draft" },
      context: { ...careerHubContext, shouldNoindexCanonical: (c) => c.includes("draft") },
    });
    expect(m.robots).toMatchObject({ index: false });
  });

  it("emits article-specific OG fields when ogType=article", () => {
    const m = generateSEOMetadata({
      config: {
        title: "T",
        description: "d",
        canonical: "https://x",
        ogType: "article",
        publishedTime: "2026-01-01T00:00:00Z",
        modifiedTime: "2026-02-01T00:00:00Z",
        section: "Roles",
        tags: ["server", "hospitality"],
      },
      context: careerHubContext,
    });
    expect(m.openGraph).toMatchObject({
      type: "article",
      publishedTime: "2026-01-01T00:00:00Z",
      modifiedTime: "2026-02-01T00:00:00Z",
      section: "Roles",
      tags: ["server", "hospitality"],
    });
  });

  it("uses siteOgImageUrl as default ogImage and surfaces width/height/alt", () => {
    const m = generateSEOMetadata({
      config: { title: "T", description: "d", canonical: "https://x" },
      context: careerHubContext,
    });
    expect(m.openGraph?.images).toEqual([
      {
        url: "https://indeedflex.com/og.png",
        width: 1200,
        height: 630,
        alt: "T",
      },
    ]);
  });
});
