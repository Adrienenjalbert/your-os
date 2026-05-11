import type { ContentEntity, ContentSource } from "@your-os/content-source";

export interface HarnessReport {
  matched: number;
  diverged: number;
  divergences: Array<{ slug: string; reason: string }>;
}

/**
 * Dual-source byte-equivalence harness. Renders each entry through a
 * tenant-supplied `render` function (typically the OS page pipeline) using
 * both the code source and the Strapi source, then compares the rendered
 * output byte-for-byte.
 *
 * Used as the kill-condition gate during opt-in migration: if any page
 * diverges, the migration is rolled back.
 */
export async function byteEquivalenceHarness<T extends ContentEntity>(args: {
  code: ContentSource<T>;
  strapi: ContentSource<T>;
  render: (entity: T) => Promise<string> | string;
  /** Slugs to compare. Defaults to the intersection of both sources' listSlugs(). */
  slugs?: string[];
}): Promise<HarnessReport> {
  const slugs = args.slugs ?? (await intersection(args.code, args.strapi));
  let matched = 0;
  const divergences: HarnessReport["divergences"] = [];
  for (const slug of slugs) {
    const [c, s] = await Promise.all([args.code.get(slug), args.strapi.get(slug)]);
    if (!c) {
      divergences.push({ slug, reason: "missing in code source" });
      continue;
    }
    if (!s) {
      divergences.push({ slug, reason: "missing in strapi source" });
      continue;
    }
    const [rc, rs] = await Promise.all([args.render(c), args.render(s)]);
    if (rc === rs) {
      matched += 1;
    } else {
      divergences.push({
        slug,
        reason: firstDiff(rc, rs),
      });
    }
  }
  return { matched, diverged: divergences.length, divergences };
}

async function intersection<T extends ContentEntity>(
  a: ContentSource<T>,
  b: ContentSource<T>,
): Promise<string[]> {
  const [as, bs] = await Promise.all([a.listSlugs(), b.listSlugs()]);
  const setB = new Set(bs);
  return as.filter((s) => setB.has(s));
}

function firstDiff(a: string, b: string): string {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i += 1;
  const start = Math.max(0, i - 20);
  return `byte ${i}: ...${a.slice(start, i + 20)} != ...${b.slice(start, i + 20)}`;
}
