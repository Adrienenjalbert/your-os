import { CodeContentSource, type ContentEntity } from "@your-os/content-source";
import { describe, expect, it, vi } from "vitest";
import { migrateEntries } from "./migrate.js";

interface Article extends ContentEntity {
  slug: string;
  title: string;
  body: string;
  dateModified?: string;
}

const sample: Article[] = [
  { slug: "a", title: "A", body: "Body A" },
  { slug: "b", title: "B", body: "Body B" },
];

describe("migrateEntries", () => {
  it("dryRun returns the payload set without HTTP calls", async () => {
    const fetchMock = vi.fn() as unknown as typeof globalThis.fetch;
    const result = await migrateEntries<Article>({
      source: new CodeContentSource<Article>({ entries: sample }),
      endpoint: "https://cms.example.com/api/articles",
      apiToken: "tok",
      fetch: fetchMock,
      dryRun: true,
      mapEntry: (e) => ({ slug: e.slug, data: { slug: e.slug, title: e.title, body: e.body } }),
    });
    expect(result.attempted).toBe(2);
    expect(result.payloads?.length).toBe(2);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts to Strapi when entry doesn't already exist", async () => {
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetchMock = (async (input: unknown, init?: RequestInit) => {
      const url = typeof input === "string" ? input : String(input);
      calls.push({ url, init });
      if (url.includes("$eq")) {
        return new Response(JSON.stringify({ data: [] }), { status: 200 });
      }
      return new Response(JSON.stringify({ data: { id: calls.length } }), { status: 201 });
    }) as unknown as typeof globalThis.fetch;

    const result = await migrateEntries<Article>({
      source: new CodeContentSource<Article>({ entries: [sample[0]!] }),
      endpoint: "https://cms.example.com/api/articles",
      apiToken: "tok",
      fetch: fetchMock,
      mapEntry: (e) => ({ slug: e.slug, data: { slug: e.slug, title: e.title } }),
    });
    expect(result.succeeded.length).toBe(1);
    expect(result.failed.length).toBe(0);
  });

  it("skips entries that already exist (idempotent)", async () => {
    const fetchMock = (async () =>
      new Response(JSON.stringify({ data: [{ id: 99 }] }), {
        status: 200,
      })) as unknown as typeof globalThis.fetch;
    const result = await migrateEntries<Article>({
      source: new CodeContentSource<Article>({ entries: [sample[0]!] }),
      endpoint: "https://cms.example.com/api/articles",
      apiToken: "tok",
      fetch: fetchMock,
      mapEntry: (e) => ({ slug: e.slug, data: {} }),
    });
    expect(result.succeeded[0]?.id).toBe(99);
  });

  it("captures per-entry failures without aborting the batch", async () => {
    const fetchMock = (async (input: unknown) => {
      const url = typeof input === "string" ? input : String(input);
      if (url.includes("$eq")) return new Response("nope", { status: 500 });
      return new Response("nope", { status: 500 });
    }) as unknown as typeof globalThis.fetch;
    const result = await migrateEntries<Article>({
      source: new CodeContentSource<Article>({ entries: sample }),
      endpoint: "https://cms.example.com/api/articles",
      apiToken: "tok",
      fetch: fetchMock,
      mapEntry: (e) => ({ slug: e.slug, data: {} }),
    });
    expect(result.failed.length).toBe(2);
    expect(result.succeeded.length).toBe(0);
  });
});
