import type { TenantConfig } from "@your-os/tenant-config";

export interface ToleranceSpec {
  /** Required fields that must match exactly. */
  exactFields: string[];
  /**
   * Set-equality fields (compared as sets, ordering doesn't matter).
   * e.g. ["audience.personas[].id", "seo.pillars[].slug"].
   */
  setFields: string[];
  /** Subset fields where actual must contain at least the target's set. */
  subsetFields?: string[];
}

export interface EvalReport {
  passed: boolean;
  failures: Array<{ field: string; expected: unknown; actual: unknown; reason: string }>;
}

/**
 * Tolerance-based comparator. Used by Phase 4's golden-set test:
 *
 *   - Exact-field equality on identity slug, brand DBA prevalence target, etc.
 *   - Set equality on persona ids and pillar slugs (order-independent).
 *   - Subset on icp ids (research may add more icps; that's fine).
 *
 * Returns a structured failure list so test failures point at the field.
 */
export function evaluateAgainstTarget(
  actual: TenantConfig,
  target: TenantConfig,
  spec: ToleranceSpec,
): EvalReport {
  const failures: EvalReport["failures"] = [];

  for (const field of spec.exactFields) {
    const a = pluck(actual, field);
    const t = pluck(target, field);
    if (!deepEqual(a, t)) {
      failures.push({ field, expected: t, actual: a, reason: "exact mismatch" });
    }
  }

  for (const field of spec.setFields) {
    const a = pluckSet(actual, field);
    const t = pluckSet(target, field);
    if (!setEqual(a, t)) {
      failures.push({ field, expected: [...t], actual: [...a], reason: "set mismatch" });
    }
  }

  for (const field of spec.subsetFields ?? []) {
    const a = pluckSet(actual, field);
    const t = pluckSet(target, field);
    for (const x of t) {
      if (!a.has(x)) {
        failures.push({ field, expected: [...t], actual: [...a], reason: `missing element ${x}` });
        break;
      }
    }
  }
  return { passed: failures.length === 0, failures };
}

function pluck(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function pluckSet(obj: unknown, path: string): Set<unknown> {
  // Path syntax: "a.b[].c" or "a.b[]" or "a.b"
  const m = path.match(/^(.+?)\[\](?:\.(.+))?$/);
  if (!m) {
    const v = pluck(obj, path);
    return Array.isArray(v) ? new Set(v) : new Set([v]);
  }
  const [, arrayPath, leafPath] = m;
  const arr = pluck(obj, arrayPath ?? "");
  if (!Array.isArray(arr)) return new Set();
  if (!leafPath) return new Set(arr);
  return new Set(arr.map((x) => pluck(x, leafPath)));
}

function setEqual(a: Set<unknown>, b: Set<unknown>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (typeof a !== "object") return false;
  const ka = Object.keys(a as Record<string, unknown>);
  const kb = Object.keys(b as Record<string, unknown>);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (!deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
      return false;
  }
  return true;
}
