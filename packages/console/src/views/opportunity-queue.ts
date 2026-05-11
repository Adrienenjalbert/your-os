/**
 * Opportunity queue view model.
 *
 * The queue is the daily surface where the Growth lead spends most of their
 * console time. Sort by lift_per_effort desc, group by kind for scanability,
 * filter by pillar/intent.
 */
import type { Opportunity, OpportunityKind } from "@your-os/control-plane";

export interface OpportunityQueueRow {
  page: string;
  query: string;
  kind: OpportunityKind;
  liftClicks: number;
  effort: number;
  liftPerEffort: number;
  reason: string;
  /** Stable position in the sorted queue (0-indexed). */
  rank: number;
}

export interface OpportunityQueueViewModel {
  totalOpportunities: number;
  shownCount: number;
  rows: OpportunityQueueRow[];
  groupCounts: Partial<Record<OpportunityKind, number>>;
  /** Filter chips with current state (UI may render). */
  filters: {
    kinds: OpportunityKind[];
    /** Free-text query (e.g. partial pillar slug). */
    queryFilter?: string;
  };
}

export interface OpportunityQueueOptions {
  /** If set, only show these kinds. */
  kinds?: OpportunityKind[];
  /** If set, only show rows whose page or query include this string. */
  queryFilter?: string;
  /** Page size (default 25). */
  limit?: number;
}

export function opportunityQueueViewModel(
  opportunities: Opportunity[],
  options: OpportunityQueueOptions = {},
): OpportunityQueueViewModel {
  const limit = options.limit ?? 25;

  // Sort first so rank is stable.
  const sorted = [...opportunities].sort((a, b) => b.liftPerEffort - a.liftPerEffort);
  const ranked: OpportunityQueueRow[] = sorted.map((o, i) => ({
    page: o.page,
    query: o.query,
    kind: o.kind,
    liftClicks: o.liftClicks,
    effort: o.effort,
    liftPerEffort: o.liftPerEffort,
    reason: o.reason,
    rank: i,
  }));

  let filtered = ranked;
  if (options.kinds && options.kinds.length > 0) {
    const set = new Set(options.kinds);
    filtered = filtered.filter((r) => set.has(r.kind));
  }
  if (options.queryFilter) {
    const q = options.queryFilter.toLowerCase();
    filtered = filtered.filter(
      (r) => r.page.toLowerCase().includes(q) || r.query.toLowerCase().includes(q),
    );
  }

  const groupCounts = filtered.reduce<Partial<Record<OpportunityKind, number>>>((acc, r) => {
    acc[r.kind] = (acc[r.kind] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalOpportunities: opportunities.length,
    shownCount: Math.min(filtered.length, limit),
    rows: filtered.slice(0, limit),
    groupCounts,
    filters: {
      kinds: options.kinds ?? [],
      queryFilter: options.queryFilter,
    },
  };
}
