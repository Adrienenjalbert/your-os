/**
 * Aggregate citations into per-pillar / per-persona share metrics that the
 * console KPI cards consume.
 */
import type { Citation } from "./import.js";

/** Map from URL pattern → pillar slug. Patterns match by `startsWith`. */
export type PillarMap = Record<string, string>;

/** Map from URL pattern → persona ID. Patterns match by `startsWith`. */
export type PersonaTags = Record<string, string>;

export interface PillarShare {
  pillar: string;
  citations: number;
  /** Average position. */
  avgPosition: number;
  /** Sum of vendor-reported share values. */
  totalShare: number;
}

export function aggregateByPillar(citations: Citation[], map: PillarMap): PillarShare[] {
  const buckets = new Map<string, { count: number; positionSum: number; shareSum: number }>();
  for (const c of citations) {
    const pillar = lookupByPrefix(c.url, map);
    if (!pillar) continue;
    const b = buckets.get(pillar) ?? { count: 0, positionSum: 0, shareSum: 0 };
    b.count += 1;
    b.positionSum += c.position;
    b.shareSum += c.share ?? 0;
    buckets.set(pillar, b);
  }
  return [...buckets.entries()]
    .map(([pillar, b]) => ({
      pillar,
      citations: b.count,
      avgPosition: b.count === 0 ? 0 : round2(b.positionSum / b.count),
      totalShare: round4(b.shareSum),
    }))
    .sort((a, b) => b.citations - a.citations);
}

export interface PersonaShare {
  personaId: string;
  citations: number;
  totalShare: number;
}

export function aggregateByPersona(citations: Citation[], tags: PersonaTags): PersonaShare[] {
  const buckets = new Map<string, { count: number; shareSum: number }>();
  for (const c of citations) {
    const personaId = lookupByPrefix(c.url, tags);
    if (!personaId) continue;
    const b = buckets.get(personaId) ?? { count: 0, shareSum: 0 };
    b.count += 1;
    b.shareSum += c.share ?? 0;
    buckets.set(personaId, b);
  }
  return [...buckets.entries()]
    .map(([personaId, b]) => ({
      personaId,
      citations: b.count,
      totalShare: round4(b.shareSum),
    }))
    .sort((a, b) => b.citations - a.citations);
}

export interface WowDelta {
  thisWeek: number;
  lastWeek: number;
  /** Percentage points (not %): thisWeek - lastWeek. */
  deltaPp: number;
  /** Relative change: (thisWeek - lastWeek) / lastWeek. */
  deltaPct: number;
}

export function wowDelta(thisWeek: number, lastWeek: number): WowDelta {
  const deltaPp = round4(thisWeek - lastWeek);
  const deltaPct = lastWeek === 0 ? 0 : round4((thisWeek - lastWeek) / lastWeek);
  return {
    thisWeek: round4(thisWeek),
    lastWeek: round4(lastWeek),
    deltaPp,
    deltaPct,
  };
}

function lookupByPrefix(url: string, map: Record<string, string>): string | undefined {
  for (const [pattern, value] of Object.entries(map)) {
    if (url.startsWith(pattern) || url.includes(pattern)) return value;
  }
  return undefined;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
