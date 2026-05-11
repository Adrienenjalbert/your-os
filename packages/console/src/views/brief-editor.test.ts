import type { Opportunity } from "@your-os/control-plane";
import type { TenantConfig } from "@your-os/tenant-config";
import { describe, expect, it } from "vitest";
import { type BriefDraft, briefEditorReducer, briefEditorViewModel } from "./brief-editor.js";

const opp: Opportunity = {
  page: "/guides/warehouse",
  query: "warehouse jobs near me",
  kind: "striking-distance",
  liftClicks: 300,
  effort: 0.3,
  liftPerEffort: 1000,
  reason: "pos 8",
};

const tenantWithPolicy: Pick<TenantConfig, "funnel"> = {
  funnel: {
    intentMap: {
      informational_early: {
        allowedPrimaryCta: ["newsletter", "lead_magnet", "tool_try"],
        forbiddenPrimaryCta: ["demo", "pricing", "hard_gate_before_value"],
        defaultMicroConversionGoals: [],
      },
    },
    microConversions: { definitions: [], scoringModel: "weighted_sum" },
    domainAuthorityThreshold: 30,
  },
};

const baseBrief: BriefDraft = {
  id: "br-1",
  title: "Definitive guide to warehouse jobs",
  intent: "informational_early",
  primaryCta: "newsletter",
  status: "draft",
  opportunity: opp,
};

describe("briefEditorViewModel", () => {
  it("passes the intent-CTA check when CTA is in the allowed list", () => {
    const vm = briefEditorViewModel(baseBrief, tenantWithPolicy);
    expect(vm.intentCtaCheck.ok).toBe(true);
    expect(vm.suggestedAction).toBe("Approve");
  });

  it("blocks when CTA is forbidden for the intent", () => {
    const bad: BriefDraft = { ...baseBrief, primaryCta: "demo" };
    const vm = briefEditorViewModel(bad, tenantWithPolicy);
    expect(vm.intentCtaCheck.ok).toBe(false);
    if (!vm.intentCtaCheck.ok) {
      expect(vm.intentCtaCheck.severity).toBe("block");
    }
    expect(vm.suggestedAction).toBe("Edit");
  });

  it("warns when CTA isn't allowed but isn't explicitly forbidden", () => {
    const warn: BriefDraft = { ...baseBrief, primaryCta: "case_study" };
    const vm = briefEditorViewModel(warn, tenantWithPolicy);
    expect(vm.intentCtaCheck.ok).toBe(false);
    if (!vm.intentCtaCheck.ok) {
      expect(vm.intentCtaCheck.severity).toBe("warn");
    }
  });

  it("returns read-only hint when brief is approved", () => {
    const approved: BriefDraft = { ...baseBrief, status: "approved" };
    const vm = briefEditorViewModel(approved, tenantWithPolicy);
    expect(vm.suggestedAction).toBe("—");
    expect(vm.hint).toMatch(/read-only/i);
  });
});

describe("briefEditorReducer", () => {
  it("approve-brief flips status to approved when the check passes", () => {
    const next = briefEditorReducer(
      { brief: baseBrief, blockedReason: null },
      "approve-brief",
      tenantWithPolicy,
    );
    expect(next.brief.status).toBe("approved");
    expect(next.blockedReason).toBe(null);
  });

  it("approve-brief blocks (and surfaces reason) when CTA is forbidden", () => {
    const next = briefEditorReducer(
      { brief: { ...baseBrief, primaryCta: "demo" }, blockedReason: null },
      "approve-brief",
      tenantWithPolicy,
    );
    expect(next.brief.status).toBe("draft");
    expect(next.blockedReason).toMatch(/forbidden/);
  });

  it("reject-brief flips status to rejected", () => {
    const next = briefEditorReducer(
      { brief: baseBrief, blockedReason: null },
      "reject-brief",
      tenantWithPolicy,
    );
    expect(next.brief.status).toBe("rejected");
  });

  it("ignores unrelated actions", () => {
    const state = { brief: baseBrief, blockedReason: null };
    const next = briefEditorReducer(state, "next-item", tenantWithPolicy);
    expect(next).toEqual(state);
  });
});
