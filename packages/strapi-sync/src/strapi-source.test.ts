import { describe, expect, it, vi } from "vitest";
import { StrapiContentSource } from "./strapi-source.js";

interface Article {
  slug: string;
  title: string;
  dateModified?: string;
}

function fakeFetch(map: Record<string, unknown>): typeof globalThis.fetch {
  return vi.fn(async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input.toString();
    for (const [pattern, body] of Object.entries(map)) {
      if (url.includes(pattern)) {
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
    }
    return new Response(JSON.stringify({ error: `no match for ${url}` }), { status: 404 });
  }) as unknown as typeof globalThis.fetch;
}

const baseOpts = {
  baseUrl: "https://cms.example.com",
  collection: "articles",
  singularApiId: "article",
  tenantSlug: "career-hub",
};

describe("StrapiContentSource", () => {
  it("list() pages, sorts, and respects publicationState", async () => {
    const fetcher = fakeFetch({
      "/api/articles?": {
        data: [{ slug: "a", title: "A" }],
        meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: 1 } },
      },
    });
    const src = new StrapiContentSource<Article>({ ...baseOpts, fetch: fetcher });
    const out = await src.list({ includeDrafts: true });
    expect(out).toEqual([{ slug: "a", title: "A" }]);
    const [url] = (fetcher as unknown as { mock: { calls: [string][] } }).mock.calls[0]!;
    expect(url).toContain("publicationState=preview");
    expect(url).toContain("sort=publishedAt%3Adesc");
  });

  it("get() filters by slug and returns the first row or null", async () => {
    const fetcher = fakeFetch({
      "filters%5Bslug%5D%5B%24eq%5D=present": { data: [{ slug: "present", title: "P" }] },
      "filters%5Bslug%5D%5B%24eq%5D=absent": { data: [] },
    });
    const src = new StrapiContentSource<Article>({ ...baseOpts, fetch: fetcher });
    expect(await src.get("present")).toEqual({ slug: "present", title: "P" });
    expect(await src.get("absent")).toBeNull();
  });

  it("listSlugs() walks pagination and respects maxSlugs", async () => {
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input.toString();
      const page = Number(new URL(url).searchParams.get("pagination[page]"));
      const data =
        page === 1
          ? {
              data: [{ slug: "a" }, { slug: "b" }],
              meta: { pagination: { page: 1, pageSize: 100, pageCount: 2, total: 4 } },
            }
          : {
              data: [{ slug: "c" }, { slug: "d" }],
              meta: { pagination: { page: 2, pageSize: 100, pageCount: 2, total: 4 } },
            };
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as unknown as typeof globalThis.fetch;

    const src = new StrapiContentSource<Article>({ ...baseOpts, fetch: fetcher, maxSlugs: 3 });
    expect(await src.listSlugs()).toEqual(["a", "b", "c"]);
  });

  it("throws on non-2xx responses with status info", async () => {
    const fetcher = vi.fn(
      async () => new Response("nope", { status: 500, statusText: "Server Error" }),
    ) as unknown as typeof globalThis.fetch;
    const src = new StrapiContentSource<Article>({ ...baseOpts, fetch: fetcher });
    await expect(src.list()).rejects.toThrow(/500/);
  });

  it("getRevisionsSince() classifies publish vs unpublish", async () => {
    const fetcher = fakeFetch({
      "filters%5BupdatedAt%5D%5B%24gt%5D": {
        data: [
          { slug: "a", updatedAt: "2026-01-02", publishedAt: "2026-01-02" },
          { slug: "b", updatedAt: "2026-01-03", publishedAt: null },
        ],
      },
    });
    const src = new StrapiContentSource<Article>({ ...baseOpts, fetch: fetcher });
    const revs = await src.getRevisionsSince("2026-01-01");
    expect(revs).toEqual([
      { slug: "a", dateModified: "2026-01-02", changeType: "update" },
      { slug: "b", dateModified: "2026-01-03", changeType: "unpublish" },
    ]);
  });

  it("forwards Authorization header when apiToken is set", async () => {
    const fetcher = vi.fn(
      async () => new Response(JSON.stringify({ data: [] }), { status: 200 }),
    ) as unknown as typeof globalThis.fetch;
    const src = new StrapiContentSource<Article>({ ...baseOpts, fetch: fetcher, apiToken: "tok" });
    await src.list();
    const init = (fetcher as unknown as { mock: { calls: [string, RequestInit][] } }).mock
      .calls[0]![1];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok");
  });
});
