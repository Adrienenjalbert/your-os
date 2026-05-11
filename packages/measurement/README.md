# @your-os/measurement

The closed loop's measurement layer. **ROOS forecast + actuals reconciliation + micro-conversion lead-scoring + variance write-back.**

## What this package does

| Function | Inputs | Outputs |
|---|---|---|
| `forecastRoos` | brief signals (intent, lift estimate, persona, micro-conversion taxonomy) | a forecast band (low/mid/high) of modeled organic conversions over 30/60/90 days |
| `reconcileActuals` | brief forecast + actual GSC clicks + GA4 conversions + micro-conversion events | per-window actuals + forecast variance |
| `scoreLead` | session events + tenant.config.funnel.microConversions | numeric lead score 0..1 + tier (cold/warm/hot) |
| `briefVarianceWriteBack` | reconciliation report | Strapi-shaped patch for the brief's `performanceSnapshot` |

## Why it exists

Suite tools (Surfer / Clearscope / MarketMuse) score documents but don't predict revenue. AI-visibility tools (Profound / Peec) report citation share but don't measure conversion. `@your-os/measurement` is the only thing in the OS that:

1. Predicts a ROOS band at brief time so `lift_per_effort` sorting in `apps/control-plane` is grounded.
2. Reconciles those predictions against GSC + GA4 actuals at 30/60/90 days.
3. Translates funnel-layer micro-conversions into a per-session lead score that the email warm-up sequencer reads.
4. Writes everything back to Strapi (or in code-mode, a JSON sidecar) so the calibration weights tune themselves over time.

This package is **pure**: no I/O, no SDK calls. Adapters live in `apps/control-plane`.

## Why a band, not a single number

Ranking forecasts are noisy. A single number gives the Growth lead false precision and damages trust when reality misses. A low/mid/high band:
- captures that ranking position 4 vs 6 has a 5x click-through delta
- is comparable across briefs (every brief has p10/p50/p90)
- calibrates: the weight tuner adjusts when actuals fall outside the band on >X% of briefs

## Public API

```ts
import {
  forecastRoos,
  reconcileActuals,
  scoreLead,
  briefVarianceWriteBack,
  type RoosForecast,
  type ReconciliationReport,
  type LeadScore,
} from "@your-os/measurement";
```

See `src/index.ts` for the full export list.

## Stability

`alpha`. The forecast model is intentionally simple (linear scaling on impressions × CTR-curve × conversion-rate). Real production tenants will calibrate weights from their own actuals.
