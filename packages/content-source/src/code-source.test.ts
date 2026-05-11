import { describe, expect, it } from "vitest";
import { CodeContentSource, defineCodeSource } from "./code-source.js";

interface Article {
  slug: string;
  title: string;
  dateModified?: string;
  pillar: string;
}

const fixtures: Article[] = [
  { slug: "a", title: "Alpha", dateModified: "2026-01-01T00:00:00Z", pillar: "roles" },
  { slug: "b", title: "Bravo", dateModified: "2026-03-01T00:00:00Z", pillar: "guides" },
  { slug: "c", title: "Charlie", dateModified: "2026-02-01T00:00:00Z", pillar: "roles" },
];

describe("CodeContentSource", () => {
  const source = new CodeContentSource<Article>({ entries: fixtures });

  it("lists entries sorted by dateModified desc by default", async () => {
    const list = await source.list();
    expect(list.map((e) => e.slug)).toEqual(["b", "c", "a"]);
  });

  it("paginates", async () => {
    const page1 = await source.list({ page: 1, perPage: 2 });
    const page2 = await source.list({ page: 2, perPage: 2 });
    expect(page1.map((e) => e.slug)).toEqual(["b", "c"]);
    expect(page2.map((e) => e.slug)).toEqual(["a"]);
  });

  it("get returns the entry by slug", async () => {
    const article = await source.get("b");
    expect(article?.title).toBe("Bravo");
  });

  it("get returns null for unknown slug", async () => {
    expect(await source.get("zzz")).toBeNull();
  });

  it("listSlugs returns all slugs", async () => {
    expect((await source.listSlugs()).sort()).toEqual(["a", "b", "c"]);
  });

  it("getRevisionsSince filters by ISO cutoff", async () => {
    const revs = await source.getRevisionsSince("2026-01-15T00:00:00Z");
    expect(revs.map((r) => r.slug).sort()).toEqual(["b", "c"]);
  });

  it("warmCache resolves without error", async () => {
    await expect(source.warmCache()).resolves.toBeUndefined();
  });

  it("defineCodeSource is a typed factory", async () => {
    const s = defineCodeSource<Article>({ entries: fixtures });
    expect(s).toBeInstanceOf(CodeContentSource);
  });
});
