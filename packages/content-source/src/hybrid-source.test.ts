import { describe, expect, it } from "vitest";
import { CodeContentSource } from "./code-source.js";
import { HybridContentSource } from "./hybrid-source.js";

interface Article {
  slug: string;
  title: string;
  dateModified?: string;
}

describe("HybridContentSource", () => {
  const primary = new CodeContentSource<Article>({
    entries: [
      { slug: "a", title: "PrimaryA", dateModified: "2026-03-01T00:00:00Z" },
      { slug: "b", title: "PrimaryB", dateModified: "2026-02-01T00:00:00Z" },
    ],
  });
  const secondary = new CodeContentSource<Article>({
    entries: [
      { slug: "b", title: "SecondaryB", dateModified: "2026-01-01T00:00:00Z" },
      { slug: "c", title: "SecondaryC", dateModified: "2026-01-15T00:00:00Z" },
    ],
  });
  const hybrid = new HybridContentSource<Article>(primary, secondary);

  it("get prefers primary", async () => {
    const got = await hybrid.get("b");
    expect(got?.title).toBe("PrimaryB");
  });

  it("get falls back to secondary when primary misses", async () => {
    const got = await hybrid.get("c");
    expect(got?.title).toBe("SecondaryC");
  });

  it("list dedupes by slug, primary wins", async () => {
    const list = await hybrid.list();
    const titles = list.map((e) => e.title);
    expect(titles).toContain("PrimaryB");
    expect(titles).not.toContain("SecondaryB");
    expect(list.find((e) => e.slug === "c")?.title).toBe("SecondaryC");
  });

  it("listSlugs returns the union", async () => {
    expect((await hybrid.listSlugs()).sort()).toEqual(["a", "b", "c"]);
  });
});
