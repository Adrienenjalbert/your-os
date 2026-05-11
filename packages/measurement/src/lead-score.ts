/**
 * Per-session lead scoring from micro-conversion events.
 *
 * Reads `tenant.config.funnel.microConversions.definitions` and applies the
 * configured `scoringModel` to a stream of events from one session/visitor.
 *
 * The output is a 0..1 score plus a tier (cold/warm/hot) the email warm-up
 * sequencer reads to decide which sequence step to fire.
 *
 * Pure. Deterministic. The calling adapter (apps/control-plane) handles
 * persistence, deduping, and the actual email-provider integration.
 */
import type { MicroConversionDefinition, TenantConfig } from "@your-os/tenant-config";

export interface MicroConversionEvent {
  /** Stable id matching tenant.funnel.microConversions.definitions[].id. */
  id: string;
  /** Optional pillar slug — used for pillar-scoped definitions. */
  pillar?: string;
  /** Unix epoch ms. */
  ts: number;
}

export interface LeadScoreInput {
  events: MicroConversionEvent[];
}

export type LeadTier = "cold" | "warm" | "hot";

export interface LeadScore {
  score: number; // 0..1
  tier: LeadTier;
  /** Which definitions contributed (and by how much) — drives explainability. */
  contributions: Array<{
    id: string;
    weight: number;
    contribution: number;
  }>;
}

export interface LeadScoreThresholds {
  warm: number; // default 0.3
  hot: number; // default 0.7
}

const DEFAULT_THRESHOLDS: LeadScoreThresholds = { warm: 0.3, hot: 0.7 };

/**
 * Compute a lead score for a session.
 *
 * scoringModel:
 *   - "weighted_sum": sum of weights of unique events, capped at 1.
 *   - "max":          max weight of any event in the session.
 *   - "first_high":   the weight of the FIRST event whose weight ≥ 0.7;
 *                     otherwise sum (used for high-intent funnel motions).
 */
export function scoreLead(
  input: LeadScoreInput,
  tenant: Pick<TenantConfig, "funnel">,
  thresholds: Partial<LeadScoreThresholds> = {},
): LeadScore {
  const t = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const defs = tenant.funnel.microConversions.definitions ?? [];
  const defIndex = new Map(defs.map((d) => [d.id, d]));
  const seen = new Set<string>();
  const contributions: LeadScore["contributions"] = [];

  // Dedup events by (id) — repeating the same micro-conversion in a session
  // doesn't compound. (Repeats are a UX signal, not a funnel signal.)
  const uniqueEvents: MicroConversionEvent[] = [];
  for (const e of input.events) {
    const key = e.id;
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueEvents.push(e);
  }

  for (const e of uniqueEvents) {
    const def = defIndex.get(e.id);
    if (!def) continue;
    if (def.pillars && def.pillars.length > 0 && e.pillar && !def.pillars.includes(e.pillar)) {
      continue;
    }
    contributions.push({ id: e.id, weight: def.weight, contribution: def.weight });
  }

  const model = tenant.funnel.microConversions.scoringModel;
  let score = 0;
  if (model === "max") {
    score = contributions.reduce((m, c) => Math.max(m, c.contribution), 0);
  } else if (model === "first_high") {
    const firstHigh = contributions.find((c) => c.weight >= 0.7);
    score = firstHigh
      ? firstHigh.contribution
      : Math.min(
          1,
          contributions.reduce((s, c) => s + c.contribution, 0),
        );
  } else {
    score = Math.min(
      1,
      contributions.reduce((s, c) => s + c.contribution, 0),
    );
  }

  return {
    score: round3(score),
    tier: score >= t.hot ? "hot" : score >= t.warm ? "warm" : "cold",
    contributions,
  };
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export const __forTest = { DEFAULT_THRESHOLDS };

// Re-exporting MicroConversionDefinition so consumers don't need to import
// from @your-os/tenant-config separately for the common case.
export type { MicroConversionDefinition };
