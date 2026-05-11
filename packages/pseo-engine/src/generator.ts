export interface Dimension<T = string> {
  name: string;
  values: readonly T[];
}

export interface Cell {
  /** Composite slug (joined dimension slug values). */
  slug: string;
  /** The picked value per dimension, keyed by dimension name. */
  values: Readonly<Record<string, string>>;
}

export interface GenerateCellsOptions {
  /** Override slug builder. Default joins values with "-". */
  slug?: (values: Record<string, string>) => string;
  /** Skip cells matching this predicate (e.g. impossible role x city pairs). */
  skip?: (values: Record<string, string>) => boolean;
}

/**
 * Cartesian product of N dimensions of strings. Returns one Cell per
 * combination; deduped by composite slug.
 */
export function generateCells(
  dimensions: readonly Dimension[],
  options: GenerateCellsOptions = {},
): Cell[] {
  if (dimensions.length === 0) return [];
  const slugBuilder = options.slug ?? ((values) => Object.values(values).join("-").toLowerCase());

  const acc: Cell[] = [];
  const seen = new Set<string>();

  function recurse(index: number, current: Record<string, string>): void {
    if (index === dimensions.length) {
      if (options.skip?.(current)) return;
      const slug = slugBuilder(current);
      if (seen.has(slug)) return;
      seen.add(slug);
      acc.push({ slug, values: { ...current } });
      return;
    }
    const dim = dimensions[index];
    if (!dim) return;
    for (const value of dim.values) {
      recurse(index + 1, { ...current, [dim.name]: value });
    }
  }
  recurse(0, {});
  return acc;
}
