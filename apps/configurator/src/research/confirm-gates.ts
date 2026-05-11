import type { ResearchReport } from "./runner.js";

export type GateName = "icps" | "dbas" | "pillars" | "schema" | "toolFit";

export interface GateDecision {
  gate: GateName;
  /** "accept" | "edit" | "reject" */
  decision: "accept" | "edit" | "reject";
  /** Edited payload (only used when decision === "edit"). */
  payload?: unknown;
}

export interface ConfirmedReport {
  icpProposals: ResearchReport["icpProposals"];
  dbaProposals: ResearchReport["dbaProposals"];
  pillarProposals: ResearchReport["pillarProposals"];
  schema: ResearchReport["schema"];
  toolFit: ResearchReport["toolFit"];
}

/**
 * Apply Confirmation gate decisions to the raw research report. Each gate
 * either accepts the proposal as-is, edits it (operator-supplied payload),
 * or rejects it (zeroes out / removes from the final config).
 *
 * Pure: no I/O. The UI collects `GateDecision[]` interactively and passes
 * them in; CI passes a fixed accept-all set for round-trip tests.
 */
export function applyGateDecisions(
  report: ResearchReport,
  decisions: GateDecision[],
): ConfirmedReport {
  const out: ConfirmedReport = {
    icpProposals: report.icpProposals,
    dbaProposals: report.dbaProposals,
    pillarProposals: report.pillarProposals,
    schema: report.schema,
    toolFit: report.toolFit,
  };
  for (const d of decisions) {
    if (d.decision === "accept") continue;
    if (d.decision === "reject") {
      switch (d.gate) {
        case "icps":
          out.icpProposals = [];
          break;
        case "dbas":
          out.dbaProposals = [];
          break;
        case "pillars":
          out.pillarProposals = [];
          break;
        case "schema":
          // Schema is required; "reject" reverts to brief.seo.primarySchemaType which the
          // caller already has. Encode that as an explicit no-op.
          break;
        case "toolFit":
          out.toolFit = { ...out.toolFit, score: 0, suggestedTool: undefined };
          break;
      }
      continue;
    }
    // edit
    switch (d.gate) {
      case "icps":
        out.icpProposals = (d.payload as ConfirmedReport["icpProposals"]) ?? out.icpProposals;
        break;
      case "dbas":
        out.dbaProposals = (d.payload as ConfirmedReport["dbaProposals"]) ?? out.dbaProposals;
        break;
      case "pillars":
        out.pillarProposals =
          (d.payload as ConfirmedReport["pillarProposals"]) ?? out.pillarProposals;
        break;
      case "schema":
        out.schema = (d.payload as ConfirmedReport["schema"]) ?? out.schema;
        break;
      case "toolFit":
        out.toolFit = (d.payload as ConfirmedReport["toolFit"]) ?? out.toolFit;
        break;
    }
  }
  return out;
}

/** Convenience: accept-all decision set used by CI. */
export function acceptAll(): GateDecision[] {
  return (["icps", "dbas", "pillars", "schema", "toolFit"] as GateName[]).map((gate) => ({
    gate,
    decision: "accept",
  }));
}
