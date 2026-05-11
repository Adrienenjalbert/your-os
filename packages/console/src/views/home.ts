/**
 * Home view model — the first thing the Growth lead sees.
 * Density-first: above-the-fold KPIs + recent activity rail.
 *
 * Per .agents/rules/050-growth-lead-priorities.md, every chart shows a
 * comparison (vs forecast, vs prior week). Numbers without comparison are
 * forbidden — this view enforces that contract.
 */
import type { Opportunity } from "@your-os/control-plane";
import type { ReconciliationReport } from "@your-os/measurement";
import type { TenantConfig } from "@your-os/tenant-config";

export interface BriefSummary {
  id: string;
  title: string;
  status: "draft" | "approved" | "shipped";
  opportunityKind: Opportunity["kind"];
  estimatedClicks: number;
  /** ISO date — when the brief was created. */
  createdAt: string;
  /** ISO date — when the brief was last touched. */
  updatedAt: string;
}

export interface HomeKpi {
  id: "open-briefs" | "weekly-lift" | "in-band-pct" | "ai-citation-share";
  label: string;
  value: string;
  /** Comparison string — required. */
  comparison: string;
  /** Optional drill-down link. */
  drilldownUrl?: string;
}

export interface HomeViewModel {
  tenantSlug: string;
  kpis: HomeKpi[];
  recentActivity: Array<{
    kind: "brief_drafted" | "brief_approved" | "brief_shipped" | "reconciliation";
    timestamp: string;
    summary: string;
  }>;
  /** Top 3 opportunities, condensed. */
  topOpportunities: Array<{ kind: Opportunity["kind"]; query: string; liftClicks: number }>;
  /** Footer line surfacing the next HITL gate the user owns. */
  nextHitlGate: string;
}

export interface HomeViewModelInput {
  tenant: Pick<TenantConfig, "identity">;
  opportunities: Opportunity[];
  briefs: BriefSummary[];
  reconciliations: ReconciliationReport[];
  /** Optional: AI-citation share for the latest week. Omit if no CSV imported. */
  aiCitationSharePct?: number;
  aiCitationShareWowDeltaPct?: number;
  /** Comparison week-over-week lift in clicks (sum of approved briefs). */
  weeklyLiftClicks: number;
  weeklyLiftWowDeltaPct: number;
}

export function homeViewModel(input: HomeViewModelInput): HomeViewModel {
  const openBriefs = input.briefs.filter((b) => b.status === "draft" || b.status === "approved");
  const totalReconciled = input.reconciliations.length;
  const inBandCount = input.reconciliations.filter(
    (r) => r.overallCalibration === "in-band",
  ).length;
  const inBandPct =
    totalReconciled === 0 ? null : Math.round((inBandCount / totalReconciled) * 100);

  const kpis: HomeKpi[] = [
    {
      id: "open-briefs",
      label: "Open briefs",
      value: String(openBriefs.length),
      comparison: `${input.briefs.filter((b) => b.status === "draft").length} draft, ${input.briefs.filter((b) => b.status === "approved").length} approved`,
    },
    {
      id: "weekly-lift",
      label: "Modeled weekly lift (clicks)",
      value: input.weeklyLiftClicks.toLocaleString(),
      comparison:
        input.weeklyLiftWowDeltaPct === 0
          ? "flat WoW"
          : `${input.weeklyLiftWowDeltaPct > 0 ? "+" : ""}${input.weeklyLiftWowDeltaPct.toFixed(1)}% WoW`,
    },
    {
      id: "in-band-pct",
      label: "ROOS forecasts in-band",
      value: inBandPct === null ? "—" : `${inBandPct}%`,
      comparison:
        inBandPct === null
          ? "no actuals reconciled yet"
          : inBandPct >= 70
            ? "calibration healthy (≥70%)"
            : "calibration drifting (<70%) — tune weights",
    },
  ];
  if (typeof input.aiCitationSharePct === "number") {
    kpis.push({
      id: "ai-citation-share",
      label: "AI citation share",
      value: `${input.aiCitationSharePct.toFixed(1)}%`,
      comparison:
        input.aiCitationShareWowDeltaPct !== undefined
          ? `${input.aiCitationShareWowDeltaPct > 0 ? "+" : ""}${input.aiCitationShareWowDeltaPct.toFixed(1)}pp WoW`
          : "first import — no comparison yet",
    });
  }

  const recentActivity = [
    ...input.briefs.map((b) => ({
      kind: (b.status === "shipped"
        ? "brief_shipped"
        : b.status === "approved"
          ? "brief_approved"
          : "brief_drafted") as "brief_drafted" | "brief_approved" | "brief_shipped",
      timestamp: b.updatedAt,
      summary: `${b.title} (${b.opportunityKind})`,
    })),
    ...input.reconciliations.map((r) => ({
      kind: "reconciliation" as const,
      timestamp:
        r.windows[r.windows.length - 1]?.window === "d90"
          ? new Date().toISOString()
          : new Date().toISOString(),
      summary: `Brief ${r.briefId} reconciled (${r.overallCalibration})`,
    })),
  ]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 8);

  const topOpportunities = input.opportunities.slice(0, 3).map((o) => ({
    kind: o.kind,
    query: o.query,
    liftClicks: o.liftClicks,
  }));

  const nextHitlGate = computeNextHitlGate(input);

  return {
    tenantSlug: input.tenant.identity.slug,
    kpis,
    recentActivity,
    topOpportunities,
    nextHitlGate,
  };
}

function computeNextHitlGate(input: HomeViewModelInput): string {
  if (input.briefs.some((b) => b.status === "draft")) {
    return "HITL #2 — Brief sign-off pending. Press Cmd-K and pick a brief.";
  }
  // Loose heuristic for cannibalization gate.
  const cannibal = input.opportunities.find((o) => o.kind === "cannibalization-consolidation");
  if (cannibal) {
    return `HITL #4 — Cannibalization merge: "${cannibal.query}" on ${cannibal.relatedPages?.length ?? 0} URLs.`;
  }
  return "All clear. Next HITL: monthly portfolio review.";
}
