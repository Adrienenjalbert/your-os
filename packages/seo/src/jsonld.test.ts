import { describe, expect, it } from "vitest";
import { buildArticleJsonLd, buildBreadcrumbJsonLd, buildOrganizationJsonLd } from "./jsonld.js";
import type { SEOSiteContext } from "./metadata.js";

const ctx: SEOSiteContext = {
  organizationName: "Indeed Flex",
  siteName: "Career Hub",
  siteOgImageUrl: "https://indeedflex.com/og.png",
};

describe("JSON-LD builders", () => {
  it("organization", () => {
    const ld = buildOrganizationJsonLd({ context: ctx, baseUrl: "https://indeedflex.com" });
    expect(ld).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Indeed Flex",
      url: "https://indeedflex.com",
      logo: "https://indeedflex.com/og.png",
    });
  });

  it("article", () => {
    const ld = buildArticleJsonLd({
      context: ctx,
      baseUrl: "https://indeedflex.com",
      article: {
        title: "Server Pay in NYC",
        description: "d",
        slug: "server-pay-nyc",
        publishedDate: "2026-01-01",
        updatedDate: "2026-02-01",
      },
    });
    expect(ld["@type"]).toBe("Article");
    expect(ld.dateModified).toBe("2026-02-01");
    expect(ld.mainEntityOfPage["@id"]).toBe("https://indeedflex.com/guides/server-pay-nyc");
  });

  it("breadcrumb", () => {
    const ld = buildBreadcrumbJsonLd({
      baseUrl: "https://indeedflex.com",
      trail: [
        { name: "Home", path: "/" },
        { name: "Roles", path: "/roles" },
        { name: "Server", path: "/roles/server" },
      ],
    });
    expect(ld.itemListElement).toHaveLength(3);
    expect(ld.itemListElement[2]).toMatchObject({
      position: 3,
      name: "Server",
      item: "https://indeedflex.com/roles/server",
    });
  });
});
