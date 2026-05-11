import type { ContentEntity, ContentSource, GetOpts, ListOpts, Revision } from "./types.js";

export interface CodeSourceOptions<T extends ContentEntity> {
  /** All entries, in their natural order. Pre-validated by the tenant. */
  entries: readonly T[];
  /** Optional default sort field. Defaults to 'dateModified' if present. */
  defaultSort?: keyof T & string;
  /** Optional default sort order. Default: 'desc'. */
  defaultOrder?: "asc" | "desc";
}

/**
 * Code adapter: zero-runtime, build-time, type-safe. Reads from a frozen TS
 * module of entries.
 *
 * This is the only adapter Career Hub ships in Phase 1. The Strapi adapter
 * lands in Phase 2B and is composable via HybridContentSource.
 */
export class CodeContentSource<T extends ContentEntity> implements ContentSource<T> {
  private readonly entries: readonly T[];
  private readonly defaultSort: keyof T & string;
  private readonly defaultOrder: "asc" | "desc";
  private readonly indexBySlug: Map<string, T>;

  constructor(opts: CodeSourceOptions<T>) {
    this.entries = opts.entries;
    this.defaultSort = (opts.defaultSort ?? "dateModified") as keyof T & string;
    this.defaultOrder = opts.defaultOrder ?? "desc";
    this.indexBySlug = new Map(opts.entries.map((entry) => [entry.slug, entry]));
  }

  async list(opts: ListOpts = {}): Promise<T[]> {
    const sortField = (opts.sort ?? this.defaultSort) as keyof T & string;
    const order = opts.order ?? this.defaultOrder;
    const sorted = [...this.entries].sort((a, b) => {
      const av = a[sortField] as unknown;
      const bv = b[sortField] as unknown;
      if (av === bv) return 0;
      if (av === undefined || av === null) return 1;
      if (bv === undefined || bv === null) return -1;
      const cmp = av < bv ? -1 : 1;
      return order === "asc" ? cmp : -cmp;
    });
    if (opts.page !== undefined && opts.perPage !== undefined) {
      const start = (opts.page - 1) * opts.perPage;
      return sorted.slice(start, start + opts.perPage);
    }
    return sorted;
  }

  async get(slug: string, _opts?: GetOpts): Promise<T | null> {
    return this.indexBySlug.get(slug) ?? null;
  }

  async listSlugs(): Promise<string[]> {
    return [...this.indexBySlug.keys()];
  }

  async getRevisionsSince(iso: string): Promise<Revision[]> {
    const cutoff = new Date(iso).getTime();
    return this.entries
      .filter((entry) => {
        if (!entry.dateModified) return false;
        return new Date(entry.dateModified).getTime() > cutoff;
      })
      .map((entry) => ({
        slug: entry.slug,
        dateModified: entry.dateModified ?? new Date(0).toISOString(),
        changeType: "update" as const,
      }));
  }

  async warmCache(): Promise<void> {
    // No-op: code adapter is already in-memory at module load.
  }
}

/**
 * Convenience factory for tenant code that wants the inferred type without
 * the explicit `new CodeContentSource<T>(...)` ceremony.
 */
export function defineCodeSource<T extends ContentEntity>(
  opts: CodeSourceOptions<T>,
): CodeContentSource<T> {
  return new CodeContentSource(opts);
}
