import { describe, expect, it } from "vitest";
import { generateCells } from "./generator.js";
import { renderTemplate } from "./template.js";
import { uniquenessRatio } from "./uniqueness.js";

describe("generateCells", () => {
  it("produces N-dimensional cartesian product of dimensions", () => {
    const cells = generateCells([
      { name: "role", values: ["server", "barback"] },
      { name: "city", values: ["nyc", "boston"] },
    ]);
    expect(cells).toHaveLength(4);
    expect(cells.map((c) => c.slug).sort()).toEqual([
      "barback-boston",
      "barback-nyc",
      "server-boston",
      "server-nyc",
    ]);
  });

  it("respects skip predicate", () => {
    const cells = generateCells(
      [
        { name: "role", values: ["server"] },
        { name: "city", values: ["nyc", "atlanta"] },
      ],
      { skip: ({ city }) => city === "atlanta" },
    );
    expect(cells.map((c) => c.values.city)).toEqual(["nyc"]);
  });

  it("dedupes by composite slug", () => {
    const cells = generateCells([
      { name: "a", values: ["x", "x"] },
      { name: "b", values: ["y"] },
    ]);
    expect(cells).toHaveLength(1);
  });

  it("returns empty for zero dimensions", () => {
    expect(generateCells([])).toEqual([]);
  });
});

describe("renderTemplate", () => {
  it("substitutes keys", () => {
    expect(renderTemplate("Find {role} jobs in {city}", { role: "server", city: "NYC" })).toBe(
      "Find server jobs in NYC",
    );
  });
  it("throws on missing key", () => {
    expect(() => renderTemplate("hi {x}", { y: "n" })).toThrow(/missing key "x"/);
  });
});

describe("uniquenessRatio", () => {
  it("reports 1.0 for fully unique docs", () => {
    const docs = [
      "Server jobs in NYC pay $20-$30/hr at peak times in upscale venues.",
      "Barback jobs in Boston pay $15-$22/hr in busy nightlife districts only.",
    ];
    expect(uniquenessRatio(docs).ratio).toBe(1);
  });
  it("flags duplicate fingerprints", () => {
    const docs = ["alpha bravo charlie delta echo", "alpha bravo charlie delta echo"];
    const report = uniquenessRatio(docs);
    expect(report.unique).toBe(0);
    expect(report.duplicates).toHaveLength(1);
  });
});
