import type { Ga4Client, Ga4Row, GscClient, GscRow } from "./types.js";

export class MockGscClient implements GscClient {
  constructor(private readonly rows: GscRow[]) {}
  async topQueries(opts: { limit?: number }): Promise<GscRow[]> {
    return this.rows.slice(0, opts.limit ?? this.rows.length);
  }
}

export class MockGa4Client implements Ga4Client {
  constructor(private readonly rows: Ga4Row[]) {}
  async topPages(opts: { limit?: number }): Promise<Ga4Row[]> {
    return this.rows.slice(0, opts.limit ?? this.rows.length);
  }
}
