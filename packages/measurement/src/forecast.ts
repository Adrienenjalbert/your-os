/**
 * ROOS forecast at brief time.
 *
 * Given a brief's signals (estimated lift in clicks, target keyword intent,
 * the tenant's micro-conversion taxonomy), produce a low/mid/high band of
 * modeled organic conversions over 30/60/90-day windows.
 *
 * Pure. Deterministic for unit tests. Calibration weights are passed in;
 * defaults are hand-tuned and meant to be replaced by `calibrate()` after
 * 30+ briefs have a `ReconciliationReport`.
 */
import type { SearchIntent, TenantConfig } from "@your-os/tenant-config";

export interface BriefSignals {
  /** Brief ID for traceability. */
  briefId: string;
  /** From rank.ts: estimated additional clicks/month. */
  liftClicks: number;
  /** Search intent class — drives downstream conversion-rate assumption. */
  intent: SearchIntent;
  /** Optional pillar slug — opens per-pillar calibration when actuals reconcile. */
  pillar?: string;
  /** Optional persona ID — opens per-persona calibration. */
  persona?: string;
  /** Optional: estimated impressions if the page already has GSC data. */
  monthlyImpressions?: number;
}

export interface ForecastWeights {
  /** Per-intent base conversion rate from organic visit → primary conversion. */
  conversionRateByIntent: Record<SearchIntent, number>;
  /** Multiplier applied to micro-conversion roosContribution. */
  microConversionMultiplier: number;
  /** Confidence band ±% around the mid forecast. Default 0.4 = ±40%. */
  bandWidth: number;
  /** How clicks fan out across 30/60/90 day windows (cumulative ratios). */
  windowRatios: { d30: number; d60: number; d90: number };
}

const DEFAULT_WEIGHTS: ForecastWeights = {
  conversionRateByIntent: {
    informational_early: 0.005,
    informational_problem_aware: 0.012,
    commercial_investigation: 0.04,
    transactional: 0.09,
    navigational: 0.02,
    tool_utility: 0.06,
  },
  microConversionMultiplier: 1.0,
  bandWidth: 0.4,
  windowRatios: { d30: 0.45, d60: 0.78, d90: 1.0 },
};

export interface RoosForecast {
  briefId: string;
  /** All numbers in primary-conversion units (e.g. demos booked, app installs, signups). */
  d30: { low: number; mid: number; high: number };
  d60: { low: number; mid: number; high: number };
  d90: { low: number; mid: number; high: number };
  /** Effective conversion rate the forecast used (for explainability in the console). */
  effectiveConversionRate: number;
  /** Multiplier applied for micro-conversion contribution (visible to user). */
  microConversionUplift: number;
}

/**
 * Compute the ROOS forecast band for a brief.
 *
 * Algorithm:
 *   1. base = liftClicks * conversionRateByIntent[intent]
 *   2. microConv uplift = sum of tenant.funnel.microConversions[*].roosContribution
 *      (capped at +0.5x to avoid runaway compounding)
 *   3. mid = base * (1 + microConv uplift)
 *   4. low = mid * (1 - bandWidth); high = mid * (1 + bandWidth)
 *   5. apply windowRatios to scale to 30/60/90.
 */
export function forecastRoos(
  signals: BriefSignals,
  tenant: Pick<TenantConfig, "funnel">,
  weights: Partial<ForecastWeights> = {},
): RoosForecast {
  const w: ForecastWeights = { ...DEFAULT_WEIGHTS, ...weights };
  const cr = w.conversionRateByIntent[signals.intent] ?? 0.01;

  const microUplift = computeMicroConversionUplift(tenant, signals.pillar, w);
  const monthlyConv = signals.liftClicks * cr * (1 + microUplift);
  const mid = monthlyConv;
  const low = mid * (1 - w.bandWidth);
  const high = mid * (1 + w.bandWidth);

  return {
    briefId: signals.briefId,
    d30: scaleBand({ low, mid, high }, w.windowRatios.d30),
    d60: scaleBand({ low, mid, high }, w.windowRatios.d60),
    d90: scaleBand({ low, mid, high }, w.windowRatios.d90),
    effectiveConversionRate: cr,
    microConversionUplift: microUplift,
  };
}

function computeMicroConversionUplift(
  tenant: Pick<TenantConfig, "funnel">,
  pillar: string | undefined,
  weights: ForecastWeights,
): number {
  const defs = tenant.funnel.microConversions.definitions ?? [];
  let sum = 0;
  for (const d of defs) {
    if (d.pillars && d.pillars.length > 0 && pillar && !d.pillars.includes(pillar)) {
      continue;
    }
    sum += d.roosContribution * weights.microConversionMultiplier;
  }
  return Math.min(sum, 0.5);
}

function scaleBand(
  band: { low: number; mid: number; high: number },
  ratio: number,
): { low: number; mid: number; high: number } {
  return {
    low: round1(band.low * ratio),
    mid: round1(band.mid * ratio),
    high: round1(band.high * ratio),
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export const __forTest = { DEFAULT_WEIGHTS };
