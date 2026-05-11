/**
 * Content-decay detector.
 *
 * Pure. No I/O. Caller assembles per-page signals; this module computes a
 * weighted decayScore + the list of fired signals so a refresh-PR drafter
 * can act on them.
 */

export interface PageDecaySignals {
  page: string;
  /** ISO date the content was last modified. */
  dateModified: string;
  /** Position delta over the last 30 days for the page's primary query. */
  rankingDelta30d?: number;
  /** ROOS percentage delta over the 90-day baseline. -0.2 = -20%. */
  roosDelta90d?: number;
  /** The data source's version this page consumed at write time. */
  sourceDataVersion?: string;
  /** The current upstream version. If different, the page is stale. */
  currentSourceDataVersion?: string;
  /** Optional pillar slug. */
  pillar?: string;
  /** Optional: brief id this page came from (used for write-back). */
  briefId?: string;
}

export type DecayReasonId =
  | "stale-date-modified"
  | "ranking-drop"
  | "roos-drop"
  | "stale-source-data";

export interface DecayReason {
  id: DecayReasonId;
  weight: number;
  detail: string;
}

export interface DecayCandidate {
  page: string;
  decayScore: number; // sum of fired weights (0 .. 1.5)
  reasons: DecayReason[];
  pillar?: string;
  briefId?: string;
}

export interface DecayWeights {
  staleDateModifiedMonths: number; // threshold in months
  staleDateModifiedWeight: number;
  rankingDropMinDelta: number; // negative number, e.g. -5
  rankingDropWeight: number;
  roosDropMinDelta: number; // negative number, e.g. -0.2
  roosDropWeight: number;
  staleSourceDataWeight: number;
}

const DEFAULT_WEIGHTS: DecayWeights = {
  staleDateModifiedMonths: 6,
  staleDateModifiedWeight: 0.3,
  rankingDropMinDelta: -5,
  rankingDropWeight: 0.4,
  roosDropMinDelta: -0.2,
  roosDropWeight: 0.5,
  staleSourceDataWeight: 0.4,
};

export interface DetectDecayInput {
  pages: PageDecaySignals[];
  weights?: Partial<DecayWeights>;
  /** Hook for a deterministic clock; defaults to () => new Date(). */
  now?: () => Date;
  /** Min decay score to surface a candidate. Default 0.3 (one signal). */
  threshold?: number;
}

export function detectDecay(input: DetectDecayInput): DecayCandidate[] {
  const weights: DecayWeights = { ...DEFAULT_WEIGHTS, ...(input.weights ?? {}) };
  const now = (input.now ?? (() => new Date()))();
  const threshold = input.threshold ?? 0.3;
  const out: DecayCandidate[] = [];

  for (const p of input.pages) {
    const reasons: DecayReason[] = [];
    const ageMonths = monthsSince(p.dateModified, now);
    if (ageMonths >= weights.staleDateModifiedMonths) {
      reasons.push({
        id: "stale-date-modified",
        weight: weights.staleDateModifiedWeight,
        detail: `dateModified ${ageMonths.toFixed(1)}mo ago (threshold ${weights.staleDateModifiedMonths}mo).`,
      });
    }
    if (typeof p.rankingDelta30d === "number" && p.rankingDelta30d <= weights.rankingDropMinDelta) {
      reasons.push({
        id: "ranking-drop",
        weight: weights.rankingDropWeight,
        detail: `position dropped ${p.rankingDelta30d} in 30d (threshold ${weights.rankingDropMinDelta}).`,
      });
    }
    if (typeof p.roosDelta90d === "number" && p.roosDelta90d <= weights.roosDropMinDelta) {
      reasons.push({
        id: "roos-drop",
        weight: weights.roosDropWeight,
        detail: `ROOS down ${(p.roosDelta90d * 100).toFixed(1)}% over 90d (threshold ${(weights.roosDropMinDelta * 100).toFixed(0)}%).`,
      });
    }
    if (
      typeof p.sourceDataVersion === "string" &&
      typeof p.currentSourceDataVersion === "string" &&
      p.sourceDataVersion !== p.currentSourceDataVersion
    ) {
      reasons.push({
        id: "stale-source-data",
        weight: weights.staleSourceDataWeight,
        detail: `source data v${p.sourceDataVersion} → upstream is v${p.currentSourceDataVersion}.`,
      });
    }

    const decayScore = reasons.reduce((s, r) => s + r.weight, 0);
    if (decayScore >= threshold) {
      out.push({
        page: p.page,
        decayScore: round3(decayScore),
        reasons,
        pillar: p.pillar,
        briefId: p.briefId,
      });
    }
  }

  return out.sort((a, b) => b.decayScore - a.decayScore);
}

function monthsSince(iso: string, now: Date): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return (now.getTime() - then) / (1000 * 60 * 60 * 24 * 30.4375);
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export const __forTest = { DEFAULT_WEIGHTS };
