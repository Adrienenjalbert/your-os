import { describe, expect, it } from "vitest";
import { lintFile } from "./lint.js";
import { defaultRules } from "./rules.js";

describe("lintFile (byte-equivalent to Career Hub brand-lint)", () => {
  it("flags banned phrases as block", () => {
    const content = "This is a revolutionary approach to flexible work.";
    const issues = lintFile(content, "src/features/x/data/y.ts", defaultRules);
    const banned = issues.filter((i) => i.rule === "banned_phrase");
    expect(banned).toHaveLength(1);
    expect(banned[0]?.severity).toBe("block");
    expect(banned[0]?.line).toBe(1);
  });

  it("flags multiple banned phrases on different lines", () => {
    const content = ["seamless integration", "world-class teams", "cutting-edge"].join("\n");
    const issues = lintFile(content, "src/features/x/data/y.ts", defaultRules);
    const banned = issues.filter((i) => i.rule === "banned_phrase");
    expect(banned).toHaveLength(3);
    // Issue order is per-pattern across all lines (matches Career Hub baseline);
    // every reported line is unique and present.
    expect(banned.map((b) => b.line).sort()).toEqual([1, 2, 3]);
  });

  it("flags AI-slop patterns as block", () => {
    const content = "In conclusion, you should download the app.";
    const issues = lintFile(content, "src/features/x/data/y.ts", defaultRules);
    const slop = issues.filter((i) => i.rule === "ai_slop");
    expect(slop).toHaveLength(1);
  });

  it("flags missing citation for a dollar amount", () => {
    const content = "Workers earn $20/hr at peak times in this role.";
    const issues = lintFile(content, "src/features/x/data/y.ts", defaultRules);
    const missing = issues.filter((i) => i.rule === "missing_citation");
    expect(missing).toHaveLength(1);
  });

  it("does NOT flag a dollar amount with an inline citation in window", () => {
    const content = "Workers earn $20/hr at peak times (BLS 2025).";
    const issues = lintFile(content, "src/features/x/data/y.ts", defaultRules);
    const missing = issues.filter((i) => i.rule === "missing_citation");
    expect(missing).toHaveLength(0);
  });

  it("emits component WARN only inside an /articles/ path", () => {
    const content = "no components here";
    const inside = lintFile(content, "src/features/articles/data/y.ts", defaultRules);
    const outside = lintFile(content, "src/features/x/data/y.ts", defaultRules);
    expect(inside.filter((i) => i.rule === "missing_component_signal")).toHaveLength(1);
    expect(outside.filter((i) => i.rule === "missing_component_signal")).toHaveLength(0);
  });

  it("returns empty issues for a clean fixture", () => {
    const content = `
import { AuthorByline } from "@/components";
const data = {
  title: "Clean fixture",
  source: "BLS 2025",
  author: "Jane",
  dateModified: "2026-01-01",
  body: "All numbers cited (BLS 2025).",
};
`;
    const issues = lintFile(content, "src/features/x/data/y.ts", defaultRules);
    expect(issues).toEqual([]);
  });

  it("inline citation regex resets lastIndex per check (no false negatives across dollars)", () => {
    // Three dollar amounts on three separate lines so the per-line citation
    // window (lookback 20 + forward 200) cannot reuse the earlier line's
    // citation. The third has no citation in window.
    const content = [
      "$15/hr (BLS 2025).",
      "$20/hr (BLS 2025).",
      "$25/hr without citation here on the line.",
    ].join("\n");
    const issues = lintFile(content, "src/features/x/data/y.ts", defaultRules);
    const missing = issues.filter((i) => i.rule === "missing_citation");
    expect(missing).toHaveLength(1);
    expect(missing[0]?.text).toContain("$25/hr");
  });
});
