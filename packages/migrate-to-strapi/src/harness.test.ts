import { CodeContentSource, type ContentEntity } from "@your-os/content-source";
import { describe, expect, it } from "vitest";
import { byteEquivalenceHarness } from "./harness.js";

interface Article extends ContentEntity {
  slug: string;
  title: string;
  body: string;
}

const code = new CodeContentSource<Article>({
  entries: [
    { slug: "a", title: "A", body: "Body A" },
    { slug: "b", title: "B", body: "Body B" },
  ],
});

const strapi = new CodeContentSource<Article>({
  entries: [
    { slug: "a", title: "A", body: "Body A" },
    { slug: "b", title: "B", body: "Body B (different!)" },
  ],
});

const render = (e: Article) => `<article><h1>${e.title}</h1><div>${e.body}</div></article>`;

describe("byteEquivalenceHarness", () => {
  it("matches identical entries and reports byte-level divergences", async () => {
    const report = await byteEquivalenceHarness({ code, strapi, render });
    expect(report.matched).toBe(1);
    expect(report.diverged).toBe(1);
    expect(report.divergences[0]?.slug).toBe("b");
    expect(report.divergences[0]?.reason).toMatch(/byte \d+/);
  });

  it("reports missing entries explicitly", async () => {
    const onlyA = new CodeContentSource<Article>({
      entries: [{ slug: "a", title: "A", body: "Body A" }],
    });
    const report = await byteEquivalenceHarness({
      code,
      strapi: onlyA,
      render,
      slugs: ["a", "b"],
    });
    expect(report.divergences.find((d) => d.slug === "b")?.reason).toBe("missing in strapi source");
  });
});
