import type { TenantConfig } from "@your-os/tenant-config";
import { describe, expect, it } from "vitest";
import { lintFile } from "./lint.js";
import { buildRulesFromTenantConfig, defaultBannedPhrases } from "./rules.js";

const baseTenant: Pick<TenantConfig, "brand"> = {
  brand: {
    distinctiveAssets: [],
    bannedPhrases: ["franchise opportunity", "limited time"],
    voice: { tone: "warm", readingLevel: "8th_grade", pov: "second_person" },
  },
};

describe("buildRulesFromTenantConfig", () => {
  it("extends defaults with tenant banned phrases", () => {
    const rules = buildRulesFromTenantConfig(baseTenant);
    expect(rules.bannedPhrases.length).toBe(defaultBannedPhrases.length + 2);
  });

  it("flags tenant-added phrases on lint", () => {
    const rules = buildRulesFromTenantConfig(baseTenant);
    const issues = lintFile(
      "Apply for our franchise opportunity today.",
      "src/features/x/data/y.ts",
      rules,
    );
    expect(issues.filter((i) => i.rule === "banned_phrase")).toHaveLength(1);
  });

  it("escapes regex metacharacters in tenant phrases", () => {
    const rules = buildRulesFromTenantConfig({
      brand: {
        distinctiveAssets: [],
        bannedPhrases: ["a+b", "c.d"],
        voice: { tone: "warm", readingLevel: "8th_grade", pov: "second_person" },
      },
    });
    const issues = lintFile("Try a+b instead of c.d.", "src/features/x/data/y.ts", rules);
    expect(issues.filter((i) => i.rule === "banned_phrase")).toHaveLength(2);
  });
});
