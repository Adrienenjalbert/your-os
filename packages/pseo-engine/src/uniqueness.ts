export interface UniquenessReport {
  total: number;
  unique: number;
  ratio: number;
  duplicates: string[];
}

/**
 * Per the seo-foundations skill: pSEO uniqueness is the highest-impact
 * Schwartz-discipline check. We require ≥80% unique pages by tokenized
 * comparison (rough proxy for "real" uniqueness, not just templated diffs).
 */
export function uniquenessRatio(documents: readonly string[]): UniquenessReport {
  const fingerprints = documents.map(fingerprint);
  const counts = new Map<string, number>();
  for (const fp of fingerprints) {
    counts.set(fp, (counts.get(fp) ?? 0) + 1);
  }
  const duplicates: string[] = [];
  let unique = 0;
  for (const [fp, count] of counts) {
    if (count === 1) {
      unique++;
    } else {
      duplicates.push(fp);
    }
  }
  return {
    total: documents.length,
    unique,
    ratio: documents.length === 0 ? 1 : unique / documents.length,
    duplicates,
  };
}

function fingerprint(doc: string): string {
  // Lowercase, collapse whitespace, drop non-word chars. Cheap shingle proxy.
  const normalized = doc
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // Take 5-grams to better detect "templated only" content.
  const tokens = normalized.split(" ");
  const shingles: string[] = [];
  for (let i = 0; i + 5 <= tokens.length; i++) {
    shingles.push(tokens.slice(i, i + 5).join(" "));
  }
  // Sort shingles + hash to get a stable fingerprint.
  return shingles.sort().join("|");
}
