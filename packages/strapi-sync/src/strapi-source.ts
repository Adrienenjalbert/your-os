import type {
  ContentEntity,
  ContentSource,
  GetOpts,
  ListOpts,
  Revision,
} from "@your-os/content-source";
import { buildCollectionTag, buildEntryTag } from "./webhook.js";

export interface StrapiContentSourceOptions {
  /** Strapi base URL, e.g. "https://cms.example.com". No trailing slash. */
  baseUrl: string;
  /**
   * Strapi 5 plural API id, e.g. "articles" (matches the URL segment).
   * The model UID (`api::article.article`) is derived from `singularApiId`.
   */
  collection: string;
  /** Singular api id used for tag namespacing. e.g. "article". */
  singularApiId: string;
  /** Tenant slug, used for `revalidateTag` keys (matches `@your-os/strapi-sync` tag convention). */
  tenantSlug: string;
  /** Read API token (Strapi 5 - "API Tokens" w/ read scope). */
  apiToken?: string;
  /** Locale code; passes through as `?locale=...`. */
  locale?: string;
  /** Pagination ceiling for `listSlugs()`. Defaults to 1000. */
  maxSlugs?: number;
  /** Override `fetch` (tests / runtime). Defaults to global. */
  fetch?: typeof globalThis.fetch;
}

interface StrapiListResponse<T> {
  data: T[];
  meta?: { pagination?: { page: number; pageSize: number; pageCount: number; total: number } };
}

/**
 * Strapi 5 content source. Implements `ContentSource<T>` so any page/component
 * built on `@your-os/content-source` can transparently swap to Strapi.
 *
 * Notes:
 *   - Calls `fetch` with cached responses tagged via Next.js' `next.tags`. The
 *     companion `createRevalidateHandler` invalidates these tags on Strapi
 *     `entry.publish`/`update`/`delete` webhooks → ISR latency p95 < 60s.
 *   - Adapter is intentionally framework-agnostic: it only sets the `next`
 *     fetch option, which Next.js consumes; non-Next runtimes ignore it.
 */
export class StrapiContentSource<T extends ContentEntity> implements ContentSource<T> {
  private readonly fetcher: typeof globalThis.fetch;
  constructor(private readonly opts: StrapiContentSourceOptions) {
    this.fetcher = opts.fetch ?? globalThis.fetch.bind(globalThis);
  }

  async list(opts: ListOpts = {}): Promise<T[]> {
    const params = new URLSearchParams();
    params.set("pagination[page]", String(opts.page ?? 1));
    params.set("pagination[pageSize]", String(opts.perPage ?? 25));
    params.set("sort", `${opts.sort ?? "publishedAt"}:${opts.order ?? "desc"}`);
    params.set("publicationState", opts.includeDrafts ? "preview" : "live");
    if (this.opts.locale) params.set("locale", this.opts.locale);
    const url = `${this.opts.baseUrl}/api/${this.opts.collection}?${params.toString()}`;
    const json = await this.request<StrapiListResponse<T>>(url, {
      collectionTag: true,
    });
    return json.data ?? [];
  }

  async get(slug: string, opts: GetOpts = {}): Promise<T | null> {
    const params = new URLSearchParams();
    params.set("filters[slug][$eq]", slug);
    params.set("pagination[pageSize]", "1");
    params.set("publicationState", opts.includeDrafts ? "preview" : "live");
    if (this.opts.locale) params.set("locale", this.opts.locale);
    const url = `${this.opts.baseUrl}/api/${this.opts.collection}?${params.toString()}`;
    const json = await this.request<StrapiListResponse<T>>(url, { entrySlug: slug });
    return json.data?.[0] ?? null;
  }

  async listSlugs(): Promise<string[]> {
    const slugs: string[] = [];
    const max = this.opts.maxSlugs ?? 1000;
    let page = 1;
    const pageSize = 100;
    while (slugs.length < max) {
      const params = new URLSearchParams();
      params.set("pagination[page]", String(page));
      params.set("pagination[pageSize]", String(pageSize));
      params.set("fields[0]", "slug");
      const url = `${this.opts.baseUrl}/api/${this.opts.collection}?${params.toString()}`;
      const json = await this.request<StrapiListResponse<{ slug: string }>>(url, {
        collectionTag: true,
      });
      const data = json.data ?? [];
      for (const row of data) if (row?.slug) slugs.push(row.slug);
      const meta = json.meta?.pagination;
      if (!meta || page >= meta.pageCount) break;
      page += 1;
    }
    return slugs.slice(0, max);
  }

  async getRevisionsSince(iso: string): Promise<Revision[]> {
    const params = new URLSearchParams();
    params.set("filters[updatedAt][$gt]", iso);
    params.set("pagination[pageSize]", "100");
    params.set("sort", "updatedAt:asc");
    params.set("fields[0]", "slug");
    params.set("fields[1]", "updatedAt");
    params.set("fields[2]", "publishedAt");
    const url = `${this.opts.baseUrl}/api/${this.opts.collection}?${params.toString()}`;
    const json = await this.request<
      StrapiListResponse<{ slug: string; updatedAt: string; publishedAt: string | null }>
    >(url, { collectionTag: true });
    return (json.data ?? []).map((row) => ({
      slug: row.slug,
      dateModified: row.updatedAt,
      changeType: row.publishedAt ? "update" : "unpublish",
    }));
  }

  private async request<R>(
    url: string,
    tags: { entrySlug?: string; collectionTag?: boolean },
  ): Promise<R> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (this.opts.apiToken) headers.Authorization = `Bearer ${this.opts.apiToken}`;
    const next: Record<string, unknown> = {};
    const tagList: string[] = [];
    if (tags.collectionTag) {
      tagList.push(
        buildCollectionTag(
          this.opts.tenantSlug,
          `api::${this.opts.singularApiId}.${this.opts.singularApiId}`,
        ),
      );
    }
    if (tags.entrySlug) {
      tagList.push(
        buildEntryTag(
          this.opts.tenantSlug,
          `api::${this.opts.singularApiId}.${this.opts.singularApiId}`,
          tags.entrySlug,
        ),
      );
    }
    if (tagList.length > 0) next.tags = tagList;

    const init: RequestInit & { next?: Record<string, unknown> } = { headers };
    if (Object.keys(next).length > 0) init.next = next;

    const res = await this.fetcher(url, init);
    if (!res.ok) {
      throw new Error(`[StrapiContentSource] ${res.status} ${res.statusText} for ${url}`);
    }
    return (await res.json()) as R;
  }
}
