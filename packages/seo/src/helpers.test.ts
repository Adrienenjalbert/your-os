import { describe, expect, it } from "vitest";
import { calculateReadingTime, generateKeywords } from "./helpers.js";

describe("calculateReadingTime", () => {
  it("rounds up at 200wpm", () => {
    expect(calculateReadingTime("hello ".repeat(199).trim())).toBe(1);
    expect(calculateReadingTime("hello ".repeat(201).trim())).toBe(2);
  });
  it("respects custom wpm", () => {
    expect(calculateReadingTime("hello ".repeat(300).trim(), 100)).toBe(3);
  });
});

describe("generateKeywords", () => {
  it("dedupes", () => {
    const k = generateKeywords(["jobs", "jobs"]);
    expect(k).toEqual(["jobs"]);
  });
  it("adds location/role/industry derivatives", () => {
    const k = generateKeywords([], "Boston", "Server", "Hospitality");
    expect(k).toContain("jobs in Boston");
    expect(k).toContain("Server salary");
    expect(k).toContain("Hospitality jobs");
  });
});
