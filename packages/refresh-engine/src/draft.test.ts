import type { TenantConfig } from "@your-os/tenant-config";
import { describe, expect, it } from "vitest";
import type { DecayCandidate } from "./decay.js";
import { draftRefreshPlan } from "./draft.js";

const codeTenant: Pick<TenantConfig, "contentSources"> = {
  contentSources: { articles: { mode: "code" } },
};

const strapiTenant: Pick<TenantConfig, "contentSources"> = {
  contentSources: { articles: { mode: "strapi", strapiCollection: "articles" } },
};

const baseCandidate: DecayCandidate = {
  page: "/guides/warehouse",
  decayScore: 0.7,
  reasons: [
    { id: "stale-date-modified", weight: 0.3, detail: "11mo old" },
    { id: "ranking-drop", weight: 0.4, detail: "down 8" },
  ],
  pillar: "guides",
  briefId: "br-7",
};

describe("draftRefreshPlan", () => {
  it("produces a CodeRefreshPlan for code-mode tenants", () => {
    const plan = draftRefreshPlan(baseCandidate, codeTenant);
    expect(plan.mode).toBe("code");
    if (plan.mode === "code") {
      expect(plan.branchName).toBe("refresh/guides-warehouse");
      expect(plan.filePathsToTouch[0]).toContain("guides");
      expect(plan.checklist.length).toBeGreaterThan(0);
    }
  });

  it("produces a StrapiRefreshPatch for strapi-mode tenants", () => {
    const plan = draftRefreshPlan(baseCandidate, strapiTenant);
    expect(plan.mode).toBe("strapi");
    if (plan.mode === "strapi") {
      expect(plan.briefId).toBe("br-7");
      expect(plan.data.status).toBe("refresh_draft");
      expect(plan.data.decayScore).toBe(0.7);
    }
  });

  it("checklist items reflect which reasons fired", () => {
    const onlyRoos: DecayCandidate = {
      page: "/x",
      decayScore: 0.5,
      reasons: [{ id: "roos-drop", weight: 0.5, detail: "down 25%" }],
    };
    const plan = draftRefreshPlan(onlyRoos, codeTenant);
    if (plan.mode === "code") {
      expect(plan.checklist.some((c) => /CTA/.test(c))).toBe(true);
      // Citation update items shouldn't appear when stale-date-modified didn't fire.
      expect(plan.checklist.some((c) => /citation/i.test(c))).toBe(false);
    }
  });
});
