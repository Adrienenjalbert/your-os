import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineTenant } from "@your-os/tenant-config";
import { describe, expect, it } from "vitest";
import { doctor } from "./doctor.js";

const baseTenant = defineTenant({
  identity: {
    name: "Test",
    slug: "test",
    domain: "example.com",
    industry: "x",
    businessModel: "b2c",
  },
  audience: { personas: [{ id: "p", name: "p", pain: "p", value: "v" }], icps: [] },
  conversion: {
    primary: "app_install",
    ctaPattern: "Find {x}",
    eventName: "ev",
    attributionParams: [],
  },
  brand: {
    distinctiveAssets: [{ type: "phrase", value: "Test Asset", prevalenceTarget: 0.8 }],
    bannedPhrases: ["forbidden"],
    voice: { tone: "warm", readingLevel: "8th_grade", pov: "second_person" },
  },
  seo: {
    primarySchemaType: "Article",
    pillars: [{ slug: "p", name: "P", intent: "informational" }],
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
});

describe("doctor", () => {
  it("passes when config is valid and no content files exist (skipped check)", async () => {
    const cwd = mkdtempSync(join(tmpdir(), "doctor-"));
    try {
      const report = await doctor({ cwd, tenant: baseTenant });
      expect(report.exitCode).toBe(0);
      const ids = report.checks.map((c) => c.id);
      expect(ids).toContain("config");
      expect(ids).toContain("brand-lint");
      expect(ids).toContain("strapi-schema");
      expect(report.checks.find((c) => c.id === "brand-lint")?.status).toBe("skipped");
      expect(report.checks.find((c) => c.id === "strapi-schema")?.status).toBe("skipped");
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it("fails when sample content contains a banned phrase", async () => {
    const cwd = mkdtempSync(join(tmpdir(), "doctor-"));
    try {
      mkdirSync(join(cwd, "src/content"), { recursive: true });
      writeFileSync(
        join(cwd, "src/content/article.ts"),
        'export const article = { body: "This is forbidden content." };\n',
      );
      const report = await doctor({ cwd, tenant: baseTenant });
      expect(report.exitCode).toBe(1);
      const lint = report.checks.find((c) => c.id === "brand-lint");
      expect(lint?.status).toBe("fail");
      expect(lint?.detail).toMatch(/block/);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});
