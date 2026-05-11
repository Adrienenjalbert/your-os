import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TenantConfig } from "@your-os/tenant-config";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { initTenant } from "./commands/init.js";
import { syncTenant } from "./commands/sync.js";

const tenant: TenantConfig = {
  identity: {
    name: "Test Hub",
    slug: "test-hub",
    domain: "test.com",
    industry: "x",
    businessModel: "b2c",
  },
  audience: { personas: [], icps: [] },
  conversion: {
    primary: "newsletter",
    ctaPattern: "Subscribe",
    eventName: "newsletter_subscribe",
    attributionParams: ["utm_source"],
  },
  brand: {
    distinctiveAssets: [],
    bannedPhrases: [],
    voice: { tone: "warm", readingLevel: "8th_grade", pov: "second_person" },
  },
  seo: {
    primarySchemaType: "Article",
    pillars: [{ slug: "x", name: "X" }],
    contentClassTargets: {},
    eeAtSignals: { authorByline: true, citationDensity: "high", dateModifiedRequired: true },
  },
  pSEO: { enabled: false, dimensions: [] },
  tools: { enabled: [] },
  trust: { caseStudies: false, customerLogos: false, complianceBadges: [], workerReviews: false },
  analytics: {},
  performance: { budgets: { lcpMs: 2500, inpMs: 200, cls: 0.1 } },
  integrations: { crm: "none", crmConfig: {} },
  agentContext: { emphasize: [], forbid: [] },
  contentSources: { articles: { mode: "code" } },
};

let tmp: string;

beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), "your-os-cli-test-"));
});
afterAll(() => {
  rmSync(tmp, { recursive: true, force: true });
});

describe("initTenant", () => {
  it("scaffolds the canonical file set", async () => {
    const result = await initTenant({ tenant, outDir: tmp });
    const paths = result.files.map((f) => f.path).sort();
    expect(paths).toEqual([
      ".cursor/rules/000-core.mdc",
      ".cursor/rules/010-seo.mdc",
      "AGENTS.md",
      "README.md",
      "package.json",
      "src/content/.gitkeep",
      "tenant.config.ts",
    ]);
  });

  it("written tenant.config.ts is importable shape", async () => {
    const cfg = readFileSync(join(tmp, "tenant.config.ts"), "utf-8");
    expect(cfg).toContain("defineTenant");
    expect(cfg).toContain('"slug": "test-hub"');
  });

  it("AGENTS.md mentions tenant identity + emphasizes", async () => {
    const md = readFileSync(join(tmp, "AGENTS.md"), "utf-8");
    expect(md).toContain("Test Hub");
    expect(md).toContain("newsletter_subscribe");
  });

  it("dryRun returns files without writing", async () => {
    const result = await initTenant({ tenant, outDir: "/non/existent/path", dryRun: true });
    expect(result.files.length).toBeGreaterThan(0);
  });
});

describe("syncTenant", () => {
  it("regenerates AGENTS.md + cursor rules only", async () => {
    const result = await syncTenant({ tenant, outDir: tmp, dryRun: true });
    const paths = result.files.map((f) => f.path).sort();
    expect(paths).toEqual([".cursor/rules/000-core.mdc", ".cursor/rules/010-seo.mdc", "AGENTS.md"]);
  });
});
