/**
 * Byte-equivalence test: @your-os/brand-lint output for a fixture must match
 * the Career Hub baseline rule-by-rule.
 *
 * Why this matters: Phase 1 extraction promises Career Hub's `pnpm brand:lint`
 * keeps producing the same blocks and warns. If this test ever drifts,
 * something in @your-os/brand-lint defaults regressed.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defaultRules, lintFile } from "@your-os/brand-lint";
import { describe, expect, it } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface ExpectedIssue {
  severity: "block" | "warn";
  rule: string;
  lineContains: string;
}

interface ExpectedFile {
  filePath: string;
  issues: ExpectedIssue[];
}

describe("byte-equivalence: @your-os/brand-lint vs Career Hub baseline", () => {
  const expectedPath = join(__dirname, "fixtures/brand-lint/expected.json");
  const fixturePath = join(__dirname, "fixtures/brand-lint/sample-content.ts");
  const expected = JSON.parse(readFileSync(expectedPath, "utf-8")) as ExpectedFile;
  const fixture = readFileSync(fixturePath, "utf-8");

  it("produces exactly the expected issue set (rule + line text)", () => {
    const actual = lintFile(fixture, expected.filePath, defaultRules);
    // Build a normalized comparison view.
    const actualNorm = actual.map((i) => ({
      severity: i.severity,
      rule: i.rule,
      text: i.text,
    }));
    for (const e of expected.issues) {
      const match = actualNorm.find(
        (a) =>
          a.severity === e.severity &&
          a.rule === e.rule &&
          a.text.toLowerCase().includes(e.lineContains.toLowerCase()),
      );
      expect(
        match,
        `expected ${e.severity} ${e.rule} containing "${e.lineContains}" — got: ${JSON.stringify(actualNorm, null, 2)}`,
      ).toBeDefined();
    }
    expect(actualNorm).toHaveLength(expected.issues.length);
  });
});
