/**
 * Brief editor view model + reducer.
 *
 * The brief editor is the second-most-used surface (after the queue). It:
 *   - Shows the brief content.
 *   - Surfaces inline brand-lint check for INTENT_CTA_MISMATCH (per rule 070).
 *   - Surfaces ROOS forecast band so HITL #2 sign-off is informed.
 *   - Lets the user approve / edit / reject (with cmd-enter for approve).
 *
 * The reducer is pure: ConsoleAction -> next state. The shell wires KEYBOARD_MAP
 * shortcuts to dispatch.
 */
import type { Opportunity } from "@your-os/control-plane";
import type { RoosForecast } from "@your-os/measurement";
import type { CtaArchetype, SearchIntent, TenantConfig } from "@your-os/tenant-config";
import type { ConsoleAction } from "../keyboard.js";

export interface BriefDraft {
  id: string;
  title: string;
  /** Search intent of the primary keyword. */
  intent: SearchIntent;
  /** CTA the brief currently leads with. */
  primaryCta: CtaArchetype;
  /** ROOS forecast band already computed. */
  forecast?: RoosForecast;
  /** Status. */
  status: "draft" | "approved" | "shipped" | "rejected";
  /** Linked opportunity (for traceability). */
  opportunity: Opportunity;
}

export type IntentCtaCheck =
  | { ok: true }
  | { ok: false; severity: "block" | "warn"; reason: string; allowedCtas: CtaArchetype[] };

export interface BriefEditorViewModel {
  briefId: string;
  title: string;
  status: BriefDraft["status"];
  intent: SearchIntent;
  primaryCta: CtaArchetype;
  intentCtaCheck: IntentCtaCheck;
  forecast?: RoosForecast;
  /** Suggested HITL action (Approve / Edit / Reject) given the check + status. */
  suggestedAction: "Approve" | "Edit" | "Reject" | "—";
  /** Footer hint for keyboard shortcuts. */
  hint: string;
}

export function briefEditorViewModel(
  brief: BriefDraft,
  tenant: Pick<TenantConfig, "funnel">,
): BriefEditorViewModel {
  const check = computeIntentCtaCheck(brief, tenant);
  const suggested: BriefEditorViewModel["suggestedAction"] =
    brief.status !== "draft"
      ? "—"
      : check.ok
        ? "Approve"
        : check.severity === "block"
          ? "Edit"
          : "Edit";

  return {
    briefId: brief.id,
    title: brief.title,
    status: brief.status,
    intent: brief.intent,
    primaryCta: brief.primaryCta,
    intentCtaCheck: check,
    forecast: brief.forecast,
    suggestedAction: suggested,
    hint:
      brief.status === "draft"
        ? "Cmd-Enter to approve · E to edit · R to reject · Esc to close"
        : "Read-only.",
  };
}

function computeIntentCtaCheck(
  brief: BriefDraft,
  tenant: Pick<TenantConfig, "funnel">,
): IntentCtaCheck {
  const entry = tenant.funnel.intentMap[brief.intent];
  if (!entry) return { ok: true };
  if (entry.forbiddenPrimaryCta.includes(brief.primaryCta)) {
    return {
      ok: false,
      severity: "block",
      reason: `CTA '${brief.primaryCta}' is forbidden for intent '${brief.intent}'.`,
      allowedCtas: entry.allowedPrimaryCta,
    };
  }
  if (entry.allowedPrimaryCta.length > 0 && !entry.allowedPrimaryCta.includes(brief.primaryCta)) {
    return {
      ok: false,
      severity: "warn",
      reason: `CTA '${brief.primaryCta}' is not in the allowed list for intent '${brief.intent}'.`,
      allowedCtas: entry.allowedPrimaryCta,
    };
  }
  return { ok: true };
}

// ----- reducer -----

export interface BriefEditorState {
  brief: BriefDraft;
  /** Did approve fail because the intent-CTA check blocks? */
  blockedReason: string | null;
}

export function briefEditorReducer(
  state: BriefEditorState,
  action: ConsoleAction,
  tenant: Pick<TenantConfig, "funnel">,
): BriefEditorState {
  switch (action) {
    case "approve-brief": {
      const check = computeIntentCtaCheck(state.brief, tenant);
      if (!check.ok && check.severity === "block") {
        return { ...state, blockedReason: check.reason };
      }
      return {
        brief: { ...state.brief, status: "approved" },
        blockedReason: null,
      };
    }
    case "reject-brief":
      return { brief: { ...state.brief, status: "rejected" }, blockedReason: null };
    case "edit-brief":
      return state; // edit is a UI-only transition (opens form); state unchanged
    default:
      return state;
  }
}
