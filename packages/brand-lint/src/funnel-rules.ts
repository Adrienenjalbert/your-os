/**
 * Funnel discipline rules — enforce intent → CTA → micro-conversion → email
 * coherence at brief / publish time. See
 * .agents/rules/070-funnel-discipline.md.
 *
 * These are STRUCTURED rules: they take a brief-shaped or page-shaped input,
 * not raw file text. They sit alongside the pure-text lintFile() in lint.ts.
 *
 * The four rules:
 *   - INTENT_CTA_MISMATCH
 *   - TOOL_GATE_WITHOUT_SERP_CHECK
 *   - NURTURE_ORPHAN_SIGNUP
 *   - BOFU_HEAVY_NEW_HUB
 *
 * Each rule may be bypassed with `serpOverride: { reason: string }` on the
 * input. Overrides are returned as `info`-severity issues so they show up in
 * the monthly portfolio review.
 */
import type {
  CtaArchetype,
  EmailSequence,
  IntentMapEntry,
  SearchIntent,
  TenantConfig,
} from "@your-os/tenant-config";
import type { LintIssue } from "./lint.js";

export type FunnelLintRuleId =
  | "INTENT_CTA_MISMATCH"
  | "TOOL_GATE_WITHOUT_SERP_CHECK"
  | "NURTURE_ORPHAN_SIGNUP"
  | "BOFU_HEAVY_NEW_HUB";

export interface BriefForLint {
  /** Stable brief ID, used in issue text for cross-referencing in console. */
  id: string;
  /** Search intent classification of the primary keyword. */
  primaryKeywordIntent: SearchIntent;
  /** CTA archetype the page will lead with. */
  primaryCta: CtaArchetype;
  /** Optional: mark this brief as a tool/utility page. */
  isToolPage?: boolean;
  /** Optional: top-3 SERP gating snapshot for tool pages. */
  topSerpsAreUngated?: boolean;
  /** Optional: explicit override + rationale; documented in monthly review. */
  serpOverride?: { reason: string };
}

export interface PageContextForLint {
  /** Total briefs/cluster targets across the tenant's content portfolio. */
  totalClusterTargets: number;
  /** How many of those are BOFU-classed. */
  bofuClusterTargets: number;
  /** Tenant's current domain authority (0..100). Source: ahrefs/semrush API. */
  domainAuthority: number;
}

export interface SequenceForLint {
  sequence: EmailSequence;
  /** The content slug/ID that triggered the signup (e.g., the article tag). */
  triggerSourceContentRef: string;
}

/**
 * INTENT_CTA_MISMATCH — block publish if hero CTA is in the forbidden list
 * for the keyword's intent (per tenant.config.funnel.intentMap).
 *
 * Bypassable with brief.serpOverride.
 */
export function lintIntentCtaMatch(
  brief: BriefForLint,
  tenant: Pick<TenantConfig, "funnel">,
): LintIssue[] {
  const issues: LintIssue[] = [];
  const entry: IntentMapEntry | undefined = tenant.funnel.intentMap[brief.primaryKeywordIntent];
  if (!entry) {
    return issues; // Tenant has not declared a policy for this intent class.
  }
  const forbidden = entry.forbiddenPrimaryCta.includes(brief.primaryCta);
  const allowed = entry.allowedPrimaryCta.includes(brief.primaryCta);

  if (forbidden) {
    if (brief.serpOverride) {
      issues.push({
        severity: "warn",
        rule: "INTENT_CTA_MISMATCH_OVERRIDE",
        line: 0,
        text: `[${brief.id}] override accepted for ${brief.primaryKeywordIntent} → ${brief.primaryCta}: ${brief.serpOverride.reason}`,
        fix: "Document override in monthly portfolio review.",
      });
    } else {
      issues.push({
        severity: "block",
        rule: "INTENT_CTA_MISMATCH",
        line: 0,
        text: `[${brief.id}] CTA '${brief.primaryCta}' is forbidden for intent '${brief.primaryKeywordIntent}'.`,
        fix: `Use one of: ${entry.allowedPrimaryCta.join(", ")} — or add serpOverride with rationale.`,
      });
    }
    return issues;
  }

  if (!allowed) {
    issues.push({
      severity: "warn",
      rule: "INTENT_CTA_NOT_IN_ALLOWED_LIST",
      line: 0,
      text: `[${brief.id}] CTA '${brief.primaryCta}' is not in the allowed list for intent '${brief.primaryKeywordIntent}'.`,
      fix: `Prefer one of: ${entry.allowedPrimaryCta.join(", ")}.`,
    });
  }
  return issues;
}

/**
 * TOOL_GATE_WITHOUT_SERP_CHECK — warn if a tool page gates inputs while top-3
 * SERPs are ungated. Loses the pogo-stick contest.
 */
export function lintToolGate(brief: BriefForLint): LintIssue[] {
  if (!brief.isToolPage) return [];
  // The "gate" interpretation: hard_gate_before_value as the primary CTA.
  if (brief.primaryCta !== "hard_gate_before_value") return [];
  if (brief.topSerpsAreUngated === false) return []; // Competitors also gate; OK.
  if (brief.serpOverride) {
    return [
      {
        severity: "warn",
        rule: "TOOL_GATE_WITHOUT_SERP_CHECK_OVERRIDE",
        line: 0,
        text: `[${brief.id}] gated tool override: ${brief.serpOverride.reason}`,
        fix: "Document override in monthly portfolio review.",
      },
    ];
  }
  return [
    {
      severity: "warn",
      rule: "TOOL_GATE_WITHOUT_SERP_CHECK",
      line: 0,
      text: `[${brief.id}] tool gates inputs; top-3 SERP gating not confirmed (or competitors are ungated).`,
      fix: "Either ungate to first value, or add serpOverride after confirming all top-3 SERPs gate too.",
    },
  ];
}

/**
 * NURTURE_ORPHAN_SIGNUP — block if Email 1 of a sequence does not reference
 * the source content that triggered the signup. Generic templates kill
 * activation (Val Geisler).
 */
export function lintNurtureOrphan(input: SequenceForLint): LintIssue[] {
  const { sequence, triggerSourceContentRef } = input;
  const firstStep = sequence.steps.find((s) => s.index === 1);
  if (!firstStep) {
    return [
      {
        severity: "block",
        rule: "NURTURE_ORPHAN_SIGNUP",
        line: 0,
        text: `[seq:${sequence.id}] sequence has no step at index 1 — cannot validate source content reference.`,
        fix: "Add a step 1 that references the triggering content.",
      },
    ];
  }
  if (!firstStep.contentRefs.includes(triggerSourceContentRef)) {
    return [
      {
        severity: "block",
        rule: "NURTURE_ORPHAN_SIGNUP",
        line: 0,
        text: `[seq:${sequence.id}] step 1 contentRefs ${JSON.stringify(firstStep.contentRefs)} does not include triggering source '${triggerSourceContentRef}'.`,
        fix: "Reference the source article in Email 1 (Val Geisler activation principle).",
      },
    ];
  }
  return [];
}

/**
 * BOFU_HEAVY_NEW_HUB — warn if more than 40% of cluster targets are BOFU on
 * a tenant whose domain authority is below the threshold. New hubs need TOFU
 * breadth before BOFU depth ranks.
 */
export function lintBofuHeavyNewHub(
  ctx: PageContextForLint,
  tenant: Pick<TenantConfig, "funnel">,
): LintIssue[] {
  const threshold = tenant.funnel.domainAuthorityThreshold;
  if (ctx.domainAuthority >= threshold) return [];
  if (ctx.totalClusterTargets === 0) return [];
  const bofuRatio = ctx.bofuClusterTargets / ctx.totalClusterTargets;
  if (bofuRatio <= 0.4) return [];
  return [
    {
      severity: "warn",
      rule: "BOFU_HEAVY_NEW_HUB",
      line: 0,
      text: `${(bofuRatio * 100).toFixed(0)}% of cluster targets are BOFU on a hub with DA=${ctx.domainAuthority} (threshold ${threshold}).`,
      fix: "Rebalance toward TOFU informational + commercial-investigation clusters until DA crosses the threshold.",
    },
  ];
}
