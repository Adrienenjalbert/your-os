import { describe, expect, it, vi } from "vitest";
import { resolveContentSource } from "./resolve.js";
import type { ContentSource } from "./types.js";

interface Article {
  slug: string;
  title: string;
  dateModified?: string;
}

const codeFixtures: Article[] = [
  { slug: "a", title: "Alpha", dateModified: "2026-01-01T00:00:00Z" },
];

describe("resolveContentSource", () => {
  it("resolves code-mode via codeEntries factory", async () => {
    const source = await resolveContentSource<Article>({
      spec: { mode: "code" },
      codeEntries: () => codeFixtures,
    });
    expect((await source.get("a"))?.title).toBe("Alpha");
  });

  it("throws when code-mode given no codeEntries factory", async () => {
    await expect(resolveContentSource<Article>({ spec: { mode: "code" } })).rejects.toThrow(
      /codeEntries factory/,
    );
  });

  it("delegates strapi-mode to the supplied factory (Strapi never imported here)", async () => {
    const fakeStrapi: ContentSource<Article> = {
      list: vi.fn(async () => []),
      get: vi.fn(async () => ({ slug: "from-strapi", title: "FromStrapi" })),
      listSlugs: vi.fn(async () => ["from-strapi"]),
      getRevisionsSince: vi.fn(async () => []),
    };
    const factory = vi.fn(() => fakeStrapi);
    const source = await resolveContentSource<Article>({
      spec: { mode: "strapi", strapiCollection: "articles" },
      strapiSourceFactory: factory,
    });
    expect(factory).toHaveBeenCalledWith("articles", undefined);
    const got = await source.get("anything");
    expect(got?.title).toBe("FromStrapi");
  });

  it("throws when strapi-mode given no strapiSourceFactory", async () => {
    await expect(
      resolveContentSource<Article>({
        spec: { mode: "strapi", strapiCollection: "articles" },
      }),
    ).rejects.toThrow(/strapiSourceFactory/);
  });

  it("composes hybrid by recursing", async () => {
    const source = await resolveContentSource<Article>({
      spec: {
        mode: "hybrid",
        primary: { mode: "code" },
        fallback: { mode: "code" },
      },
      codeEntries: () => codeFixtures,
    });
    expect((await source.get("a"))?.title).toBe("Alpha");
  });
});
