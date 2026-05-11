import type { TenantConfig } from "@your-os/tenant-config";
import { describe, expect, it } from "vitest";
import {
  type BriefForLint,
  type PageContextForLint,
  type SequenceForLint,
  lintBofuHeavyNewHub,
  lintIntentCtaMatch,
  lintNurtureOrphan,
  lintToolGate,
} from "./funnel-rules.js";

const tenant: Pick<TenantConfig, "funnel"> = {
  funnel: {
    intentMap: {
      informational_early: {
        allowedPrimaryCta: ["newsletter", "lead_magnet", "tool_try"],
        forbiddenPrimaryCta: ["demo", "pricing", "hard_gate_before_value"],
        defaultMicroConversionGoals: ["scroll_75", "newsletter_confirm"],
      },
      commercial_investigation: {
        allowedPrimaryCta: ["free_trial", "demo", "pricing", "comparison_tool", "roi_calculator"],
        forbiddenPrimaryCta: [],
        defaultMicroConversionGoals: ["pricing_view"],
      },
    },
    microConversions: {
      definitions: [],
      scoringModel: "weighted_sum",
    },
    domainAuthorityThreshold: 30,
  },
};

describe("lintIntentCtaMatch", () => {
  it("blocks demo CTA on informational_early intent", () => {
    const brief: BriefForLint = {
      id: "br-1",
      primaryKeywordIntent: "informational_early",
      primaryCta: "demo",
    };
    const issues = lintIntentCtaMatch(brief, tenant);
    expect(issues).toHaveLength(1);
    expect(issues[0].rule).toBe("INTENT_CTA_MISMATCH");
    expect(issues[0].severity).toBe("block");
  });

  it("downgrades to warn when serpOverride is supplied", () => {
    const brief: BriefForLint = {
      id: "br-2",
      primaryKeywordIntent: "informational_early",
      primaryCta: "demo",
      serpOverride: { reason: "All top-3 SERPs lead with demo CTA per Q1 2026 audit." },
    };
    const issues = lintIntentCtaMatch(brief, tenant);
    expect(issues).toHaveLength(1);
    expect(issues[0].rule).toBe("INTENT_CTA_MISMATCH_OVERRIDE");
    expect(issues[0].severity).toBe("warn");
  });

  it("warns when CTA is not allowed but not explicitly forbidden", () => {
    const brief: BriefForLint = {
      id: "br-3",
      primaryKeywordIntent: "informational_early",
      primaryCta: "case_study",
    };
    const issues = lintIntentCtaMatch(brief, tenant);
    expect(issues).toHaveLength(1);
    expect(issues[0].rule).toBe("INTENT_CTA_NOT_IN_ALLOWED_LIST");
    expect(issues[0].severity).toBe("warn");
  });

  it("passes when CTA is in the allowed list", () => {
    const brief: BriefForLint = {
      id: "br-4",
      primaryKeywordIntent: "informational_early",
      primaryCta: "newsletter",
    };
    expect(lintIntentCtaMatch(brief, tenant)).toEqual([]);
  });

  it("returns no issues when tenant has no policy for the intent", () => {
    const brief: BriefForLint = {
      id: "br-5",
      primaryKeywordIntent: "navigational",
      primaryCta: "demo",
    };
    expect(lintIntentCtaMatch(brief, tenant)).toEqual([]);
  });
});

describe("lintToolGate", () => {
  it("warns when tool gates and top-3 SERPs are ungated", () => {
    const brief: BriefForLint = {
      id: "br-tool-1",
      primaryKeywordIntent: "tool_utility",
      primaryCta: "hard_gate_before_value",
      isToolPage: true,
      topSerpsAreUngated: true,
    };
    const issues = lintToolGate(brief);
    expect(issues).toHaveLength(1);
    expect(issues[0].rule).toBe("TOOL_GATE_WITHOUT_SERP_CHECK");
  });

  it("does not fire when competitors also gate", () => {
    const brief: BriefForLint = {
      id: "br-tool-2",
      primaryKeywordIntent: "tool_utility",
      primaryCta: "hard_gate_before_value",
      isToolPage: true,
      topSerpsAreUngated: false,
    };
    expect(lintToolGate(brief)).toEqual([]);
  });

  it("does not fire on non-tool pages", () => {
    const brief: BriefForLint = {
      id: "br-tool-3",
      primaryKeywordIntent: "tool_utility",
      primaryCta: "hard_gate_before_value",
    };
    expect(lintToolGate(brief)).toEqual([]);
  });
});

describe("lintNurtureOrphan", () => {
  const baseSeq: SequenceForLint = {
    sequence: {
      id: "seq-1",
      length: 3,
      sourceTrigger: "article_tag",
      pillarSpine: "roles",
      steps: [
        {
          index: 1,
          contentRefs: ["articles/finding-flex-shifts"],
          ctaSoft: true,
          ctaHard: false,
        },
        {
          index: 2,
          contentRefs: ["articles/related"],
          ctaSoft: true,
          ctaHard: false,
        },
      ],
    },
    triggerSourceContentRef: "articles/finding-flex-shifts",
  };

  it("passes when Email 1 references the source content", () => {
    expect(lintNurtureOrphan(baseSeq)).toEqual([]);
  });

  it("blocks when Email 1 omits the source content", () => {
    const broken: SequenceForLint = {
      ...baseSeq,
      sequence: {
        ...baseSeq.sequence,
        steps: baseSeq.sequence.steps.map((s) =>
          s.index === 1 ? { ...s, contentRefs: ["articles/something-else"] } : s,
        ),
      },
    };
    const issues = lintNurtureOrphan(broken);
    expect(issues).toHaveLength(1);
    expect(issues[0].rule).toBe("NURTURE_ORPHAN_SIGNUP");
    expect(issues[0].severity).toBe("block");
  });

  it("blocks when sequence has no Email 1", () => {
    const broken: SequenceForLint = {
      ...baseSeq,
      sequence: {
        ...baseSeq.sequence,
        steps: baseSeq.sequence.steps.filter((s) => s.index !== 1),
      },
    };
    expect(lintNurtureOrphan(broken)).toHaveLength(1);
  });
});

describe("lintBofuHeavyNewHub", () => {
  it("warns when >40% BOFU on low-DA hub", () => {
    const ctx: PageContextForLint = {
      totalClusterTargets: 10,
      bofuClusterTargets: 6,
      domainAuthority: 20,
    };
    const issues = lintBofuHeavyNewHub(ctx, tenant);
    expect(issues).toHaveLength(1);
    expect(issues[0].rule).toBe("BOFU_HEAVY_NEW_HUB");
  });

  it("does not fire when DA crosses threshold", () => {
    const ctx: PageContextForLint = {
      totalClusterTargets: 10,
      bofuClusterTargets: 6,
      domainAuthority: 50,
    };
    expect(lintBofuHeavyNewHub(ctx, tenant)).toEqual([]);
  });

  it("does not fire when BOFU ratio is at or below 40%", () => {
    const ctx: PageContextForLint = {
      totalClusterTargets: 10,
      bofuClusterTargets: 4,
      domainAuthority: 20,
    };
    expect(lintBofuHeavyNewHub(ctx, tenant)).toEqual([]);
  });

  it("safely handles empty cluster portfolio", () => {
    const ctx: PageContextForLint = {
      totalClusterTargets: 0,
      bofuClusterTargets: 0,
      domainAuthority: 10,
    };
    expect(lintBofuHeavyNewHub(ctx, tenant)).toEqual([]);
  });
});
