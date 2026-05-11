export interface GscRow {
  page: string;
  query: string;
  /** 1.0..100+ — Google's average position for this page+query. */
  position: number;
  impressions: number;
  clicks: number;
  /** 0..1 */
  ctr: number;
}

export interface Ga4Row {
  page: string;
  sessions: number;
  /** Conversion event count for the tenant's primary conversion. */
  conversions: number;
  conversionRate: number;
}

export interface GscClient {
  topQueries(opts: { startDate: string; endDate: string; limit?: number }): Promise<GscRow[]>;
}

export interface Ga4Client {
  topPages(opts: { startDate: string; endDate: string; limit?: number }): Promise<Ga4Row[]>;
}
