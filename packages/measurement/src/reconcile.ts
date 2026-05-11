/**
 * Reconcile a brief's ROOS forecast against actuals at 30/60/90 days.
 *
 * Pure. Caller fetches actuals from GSC/GA4 (or fixtures) and passes them in.
 * The output is a `ReconciliationReport` that:
 *   - says whether actuals fell inside the forecast band
 *   - computes signed variance % vs the mid
 *   - emits a `briefVarianceWriteBack` patch for Strapi
 */
import type { RoosForecast } from "./forecast.js";

export type WindowKey = "d30" | "d60" | "d90";

export interface WindowActuals {
  window: WindowKey;
  actualClicks: number;
  actualConversions: number;
  /** Optional: count of micro-conversions logged in this window. */
  actualMicroConversions?: number;
}

export interface ReconciliationInput {
  forecast: RoosForecast;
  actuals: WindowActuals[];
}

export interface WindowReconciliation {
  window: WindowKey;
  forecastBand: { low: number; mid: number; high: number };
  actualConversions: number;
  actualClicks: number;
  /** Signed variance vs the mid: (actual - mid) / mid. */
  variancePctVsMid: number;
  /** Did the actual land inside [low, high]? */
  insideBand: boolean;
}

export interface ReconciliationReport {
  briefId: string;
  windows: WindowReconciliation[];
  /** Summary across windows: was the brief well-calibrated? */
  overallCalibration: "in-band" | "underforecast" | "overforecast" | "mixed";
}

export function reconcileActuals(input: ReconciliationInput): ReconciliationReport {
  const { forecast, actuals } = input;
  const windows: WindowReconciliation[] = actuals.map((a) => {
    const band = forecast[a.window];
    const variancePct = band.mid === 0 ? 0 : (a.actualConversions - band.mid) / band.mid;
    return {
      window: a.window,
      forecastBand: band,
      actualConversions: a.actualConversions,
      actualClicks: a.actualClicks,
      variancePctVsMid: roundN(variancePct, 4),
      insideBand: a.actualConversions >= band.low && a.actualConversions <= band.high,
    };
  });

  const overall = computeOverallCalibration(windows);

  return {
    briefId: forecast.briefId,
    windows,
    overallCalibration: overall,
  };
}

function computeOverallCalibration(
  windows: WindowReconciliation[],
): ReconciliationReport["overallCalibration"] {
  if (windows.every((w) => w.insideBand)) return "in-band";
  const allUnder = windows.every((w) => !w.insideBand && w.variancePctVsMid < 0);
  if (allUnder) return "overforecast";
  const allOver = windows.every((w) => !w.insideBand && w.variancePctVsMid > 0);
  if (allOver) return "underforecast";
  return "mixed";
}

/**
 * Strapi-shaped write-back patch. Apply to the OpportunityBrief entry's
 * `performanceSnapshot`. The brief drafter declares `performanceSnapshot:
 * null` at draft time; this fills it in.
 */
export interface BriefVariancePatch {
  briefId: string;
  data: {
    status: "shipped";
    performanceSnapshot: {
      reconciledAt: string;
      windows: WindowReconciliation[];
      overallCalibration: ReconciliationReport["overallCalibration"];
    };
  };
}

export function briefVarianceWriteBack(
  report: ReconciliationReport,
  now: () => Date = () => new Date(),
): BriefVariancePatch {
  return {
    briefId: report.briefId,
    data: {
      status: "shipped",
      performanceSnapshot: {
        reconciledAt: now().toISOString(),
        windows: report.windows,
        overallCalibration: report.overallCalibration,
      },
    },
  };
}

function roundN(n: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
}
