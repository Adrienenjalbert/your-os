import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import {
  type TenantConfig,
  type TenantConfigInput,
  parseTenantConfig,
} from "@your-os/tenant-config";

/**
 * Reads + writes the working tenant.config.ts that the Customise panel edits.
 *
 * The path is configurable via `YOUR_OS_TENANT_CONFIG_PATH` so:
 *   - dev defaults to a local JSON snapshot (no risk of clobbering examples).
 *   - design-partner deploys can point at the partner's repo file.
 *
 * We persist the JSON shape (the validated TenantConfig object), not the TS
 * source. Generating proper TS source is the scaffolder's job
 * (`@your-os/configurator`'s `scaffoldTenant`).
 */
const DEFAULT_PATH = ".your-os/tenant-config.json";

export function getStorePath(): string {
  const raw = process.env.YOUR_OS_TENANT_CONFIG_PATH ?? DEFAULT_PATH;
  return resolve(process.cwd(), raw);
}

export async function readTenantConfig(): Promise<TenantConfig | null> {
  try {
    const buf = await readFile(getStorePath(), "utf8");
    const json = JSON.parse(buf) as unknown;
    return parseTenantConfig(json);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function writeTenantConfig(input: TenantConfigInput): Promise<TenantConfig> {
  const validated = parseTenantConfig(input);
  const path = getStorePath();
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(validated, null, 2)}\n`, "utf8");
  return validated;
}

export interface ConfigDiffEntry {
  path: string;
  before: unknown;
  after: unknown;
}

/**
 * Shallow-keyed diff between two tenant configs. Returns one entry per
 * top-level field that changed; the UI renders deeper detail itself.
 *
 * We deliberately avoid deep-diff libraries — the surface stays static and
 * this keeps the bundle and reasoning simple.
 */
export function diffTenantConfig(
  before: TenantConfig | null,
  after: TenantConfig,
): ConfigDiffEntry[] {
  const out: ConfigDiffEntry[] = [];
  const keys = Object.keys(after) as Array<keyof TenantConfig>;
  for (const key of keys) {
    const a = before ? before[key] : undefined;
    const b = after[key];
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      out.push({ path: String(key), before: a, after: b });
    }
  }
  return out;
}

/** Resolve a dotted path on the tenant config (used by SectionForm). */
export function readPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

/** Immutably set a dotted path; missing intermediates become objects. */
export function writePath<T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown,
): T {
  const parts = path.split(".");
  const next = JSON.parse(JSON.stringify(obj)) as Record<string, unknown>;
  let cursor: Record<string, unknown> = next;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const k = parts[i] as string;
    if (typeof cursor[k] !== "object" || cursor[k] === null) cursor[k] = {};
    cursor = cursor[k] as Record<string, unknown>;
  }
  const last = parts[parts.length - 1] as string;
  cursor[last] = value;
  return next as T;
}

/**
 * Tiny seed config used when the working file is empty. Mirrors
 * examples/minimal so the Customise panel always has *something* to render
 * the first time a partner opens it.
 */
export function seedTenantConfig(): TenantConfigInput {
  return {
    identity: {
      name: "Demo Hub",
      slug: "demo-hub",
      domain: "demo.example.com",
      industry: "demo",
      businessModel: "b2c",
    },
    audience: {
      personas: [{ id: "demo-user", name: "Demo User", pain: "p", value: "v" }],
      icps: [],
    },
    conversion: {
      primary: "newsletter",
      ctaPattern: "Subscribe",
      eventName: "demo_hub_newsletter",
      attributionParams: ["utm_source", "utm_medium", "utm_campaign"],
    },
    brand: {
      distinctiveAssets: [{ type: "phrase", value: "All Demo, All Day", prevalenceTarget: 0.8 }],
      bannedPhrases: [],
      voice: { tone: "warm", readingLevel: "8th_grade", pov: "second_person" },
    },
    seo: {
      primarySchemaType: "Article",
      pillars: [{ slug: "guides", name: "Guides", intent: "informational" }],
      contentClassTargets: { informational: 1 },
      eeAtSignals: { authorByline: true, citationDensity: "high", dateModifiedRequired: true },
    },
    pSEO: { enabled: false, dimensions: [] },
    tools: { enabled: [] },
    trust: {
      caseStudies: false,
      customerLogos: false,
      complianceBadges: [],
      workerReviews: false,
    },
    analytics: {},
    performance: { budgets: { lcpMs: 2500, inpMs: 200, cls: 0.1 } },
    integrations: { crm: "none", crmConfig: {} },
    agentContext: { emphasize: [], forbid: [] },
    contentSources: {
      articles: { mode: "code" },
      pillars: { mode: "code" },
    },
  };
}
