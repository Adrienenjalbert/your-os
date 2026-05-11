import type { ContentEntity, ContentSource, GetOpts, ListOpts, Revision } from "./types.js";

/**
 * Composes two ContentSources. Reads go to `primary` first; on null/empty,
 * falls back to `secondary`. List merges by slug (primary wins on duplicates).
 *
 * Used when a tenant migrates one content type from code to Strapi and wants
 * graceful degradation (Phase 7 dual-source byte-equivalence window), or when
 * a tenant intentionally splits a content type (e.g. evergreen articles in
 * code, time-sensitive in Strapi).
 */
export class HybridContentSource<T extends ContentEntity> implements ContentSource<T> {
  constructor(
    private readonly primary: ContentSource<T>,
    private readonly secondary: ContentSource<T>,
  ) {}

  async list(opts?: ListOpts): Promise<T[]> {
    const [a, b] = await Promise.all([this.primary.list(opts), this.secondary.list(opts)]);
    const seen = new Set<string>();
    const merged: T[] = [];
    for (const entry of [...a, ...b]) {
      if (seen.has(entry.slug)) continue;
      seen.add(entry.slug);
      merged.push(entry);
    }
    return merged;
  }

  async get(slug: string, opts?: GetOpts): Promise<T | null> {
    const fromPrimary = await this.primary.get(slug, opts);
    if (fromPrimary) return fromPrimary;
    return this.secondary.get(slug, opts);
  }

  async listSlugs(): Promise<string[]> {
    const [a, b] = await Promise.all([this.primary.listSlugs(), this.secondary.listSlugs()]);
    return [...new Set([...a, ...b])];
  }

  async getRevisionsSince(iso: string): Promise<Revision[]> {
    const [a, b] = await Promise.all([
      this.primary.getRevisionsSince(iso),
      this.secondary.getRevisionsSince(iso),
    ]);
    return [...a, ...b];
  }

  async warmCache(): Promise<void> {
    await Promise.all([this.primary.warmCache?.(), this.secondary.warmCache?.()]);
  }
}
