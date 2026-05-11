import type { Ga4Client, GscClient } from "../ingest/types.js";
import type { StrapiClient } from "./brief-drafter.js";

export interface WriteBackInput {
  /** OpportunityBriefs we shipped, with the URL the work landed on. */
  shipped: Array<{ briefId: number | string; targetKeyword: string; landedUrl: string }>;
  windowDays: 30 | 60 | 90;
  startIso: string;
  endIso: string;
  gsc: GscClient;
  ga4?: Ga4Client;
  strapi: StrapiClient;
}

export interface WriteBackReport {
  written: number;
  /** Per-brief summary the attribution skill consumes. */
  summaries: Array<{
    briefId: number | string;
    actualClicks: number;
    actualImpressions: number;
    actualPosition: number;
    actualConversions?: number;
  }>;
}

/**
 * 30/60/90-day performance write-back. Pulls actuals from GSC/GA4, writes a
 * `performanceSnapshot` JSON onto the Brief, and (when window === 90) flips
 * its status to "shipped" if not already terminal.
 */
export async function performanceWriteBack(input: WriteBackInput): Promise<WriteBackReport> {
  const gscRows = await input.gsc.topQueries({
    startDate: input.startIso,
    endDate: input.endIso,
    limit: 1000,
  });
  const ga4Rows = await input.ga4?.topPages({
    startDate: input.startIso,
    endDate: input.endIso,
    limit: 1000,
  });

  const summaries: WriteBackReport["summaries"] = [];
  let written = 0;
  for (const brief of input.shipped) {
    const matching = gscRows.filter(
      (r) => r.page === brief.landedUrl && r.query === brief.targetKeyword,
    );
    const actualClicks = matching.reduce((s, r) => s + r.clicks, 0);
    const actualImpressions = matching.reduce((s, r) => s + r.impressions, 0);
    const actualPosition = matching.length
      ? matching.reduce((s, r) => s + r.position * r.impressions, 0) /
        Math.max(actualImpressions, 1)
      : 0;
    const ga = ga4Rows?.find((r) => r.page === brief.landedUrl);
    const actualConversions = ga?.conversions;

    summaries.push({
      briefId: brief.briefId,
      actualClicks,
      actualImpressions,
      actualPosition,
      actualConversions,
    });

    await input.strapi.updateOpportunityBriefById(brief.briefId, {
      performanceSnapshot: {
        windowDays: input.windowDays,
        windowStart: input.startIso,
        windowEnd: input.endIso,
        actualClicks,
        actualImpressions,
        actualPosition,
        actualConversions,
      },
      ...(input.windowDays === 90 ? { status: "shipped" } : {}),
    });
    written += 1;
  }
  return { written, summaries };
}
