/**
 * @your-os/measurement
 *
 * The measurement layer of the closed loop:
 *   - forecastRoos: predicted ROOS band at brief time
 *   - reconcileActuals: 30/60/90-day reconciliation against GSC + GA4
 *   - briefVarianceWriteBack: Strapi-shaped patch for performanceSnapshot
 *   - scoreLead: per-session lead scoring from micro-conversion events
 *
 * Pure. No I/O. No SDK dependencies. Adapters live in apps/control-plane.
 */
export {
  forecastRoos,
  type BriefSignals,
  type ForecastWeights,
  type RoosForecast,
} from "./forecast.js";

export {
  reconcileActuals,
  briefVarianceWriteBack,
  type WindowKey,
  type WindowActuals,
  type ReconciliationInput,
  type ReconciliationReport,
  type WindowReconciliation,
  type BriefVariancePatch,
} from "./reconcile.js";

export {
  scoreLead,
  type MicroConversionEvent,
  type LeadScoreInput,
  type LeadScore,
  type LeadTier,
  type LeadScoreThresholds,
} from "./lead-score.js";
