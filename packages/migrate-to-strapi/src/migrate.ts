import type { ContentEntity, ContentSource } from "@your-os/content-source";

export interface MigrateEntry {
  /** Slug for the destination Strapi entry. */
  slug: string;
  /** Strapi-side payload. */
  data: Record<string, unknown>;
}

export interface MigrateOptions<T extends ContentEntity> {
  /** Source code-mode ContentSource (the data we're migrating from). */
  source: ContentSource<T>;
  /** Strapi REST endpoint for the target collection, e.g. "https://cms.x.com/api/articles" */
  endpoint: string;
  /** API token with write scope. */
  apiToken: string;
  /** Map a code entity to a Strapi `data` payload. */
  mapEntry: (entity: T) => MigrateEntry;
  /** Override fetch (tests). */
  fetch?: typeof globalThis.fetch;
  /** When true, do not POST — collect what would be sent. CI uses this. */
  dryRun?: boolean;
}

export interface MigrateResult {
  attempted: number;
  succeeded: Array<{ slug: string; id: number | string }>;
  failed: Array<{ slug: string; error: string }>;
  /** Populated when dryRun=true. */
  payloads?: MigrateEntry[];
}

/**
 * Walks the source ContentSource page-by-page, maps each entity, and POSTs to
 * Strapi. Idempotent on repeat runs because it filters on `filters[slug][$eq]`
 * before creating (Strapi has no upsert; we approximate).
 */
export async function migrateEntries<T extends ContentEntity>(
  opts: MigrateOptions<T>,
): Promise<MigrateResult> {
  const fetcher = opts.fetch ?? globalThis.fetch.bind(globalThis);
  const result: MigrateResult = {
    attempted: 0,
    succeeded: [],
    failed: [],
    ...(opts.dryRun ? { payloads: [] as MigrateEntry[] } : {}),
  };

  const all = await opts.source.list({ perPage: 1000 });
  for (const entity of all) {
    const entry = opts.mapEntry(entity);
    result.attempted += 1;
    if (opts.dryRun) {
      result.payloads!.push(entry);
      continue;
    }
    try {
      const exists = await checkExists(fetcher, opts.endpoint, opts.apiToken, entry.slug);
      if (exists) {
        result.succeeded.push({ slug: entry.slug, id: exists.id });
        continue;
      }
      const created = await create(fetcher, opts.endpoint, opts.apiToken, entry);
      result.succeeded.push({ slug: entry.slug, id: created.id });
    } catch (err) {
      result.failed.push({
        slug: entry.slug,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return result;
}

async function checkExists(
  fetcher: typeof globalThis.fetch,
  endpoint: string,
  token: string,
  slug: string,
): Promise<{ id: number | string } | null> {
  const url = `${endpoint}?${new URLSearchParams({ "filters[slug][$eq]": slug, "pagination[pageSize]": "1" })}`;
  const res = await fetcher(url, { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`exists-check ${res.status} for ${slug}`);
  const json = (await res.json()) as { data?: Array<{ id: number | string }> };
  return json.data?.[0] ?? null;
}

async function create(
  fetcher: typeof globalThis.fetch,
  endpoint: string,
  token: string,
  entry: MigrateEntry,
): Promise<{ id: number | string }> {
  const res = await fetcher(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ data: entry.data }),
  });
  if (!res.ok) throw new Error(`create ${res.status} for ${entry.slug}`);
  const json = (await res.json()) as { data: { id: number | string } };
  return { id: json.data.id };
}
