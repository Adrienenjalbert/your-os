/**
 * Minimum shape every content entity must satisfy. Tenants extend with their
 * own fields; the OS only needs slug + a content-type identifier to route.
 */
export interface ContentEntity {
  slug: string;
  /** ISO timestamp. Drives ISR + content-refresh skill. */
  dateModified?: string;
}

export interface ListOpts {
  /** Pagination: 1-indexed page. */
  page?: number;
  /** Pagination: items per page. Default: source-specific. */
  perPage?: number;
  /** Sort field (e.g. 'dateModified'). Source-specific. */
  sort?: string;
  /** Sort direction. Default: 'desc'. */
  order?: "asc" | "desc";
  /** Include drafts (Next.js draft mode active). Strapi-only. */
  includeDrafts?: boolean;
}

export interface GetOpts {
  includeDrafts?: boolean;
}

export interface Revision {
  slug: string;
  dateModified: string;
  /** Inferred event type for ISR routing. */
  changeType: "publish" | "update" | "unpublish";
}

/**
 * Unified read interface. Every page component reads through this; the same
 * page renders identically whether content came from code, Strapi, or hybrid.
 */
export interface ContentSource<T extends ContentEntity> {
  /** List entities (newest first by default). Used by index pages + sitemap. */
  list(opts?: ListOpts): Promise<T[]>;
  /** Single entity by slug. Returns null when not found. */
  get(slug: string, opts?: GetOpts): Promise<T | null>;
  /** All slugs. Used by `generateStaticParams`. */
  listSlugs(): Promise<string[]>;
  /** Revisions since the given ISO timestamp. Powers ISR + audits. */
  getRevisionsSince(iso: string): Promise<Revision[]>;
  /** Optional build-time prefetch (warms in-memory cache for code adapters). */
  warmCache?(): Promise<void>;
}
