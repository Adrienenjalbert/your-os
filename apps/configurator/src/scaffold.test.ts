import { describe, expect, it } from "vitest";
import strapiBrief from "./fixtures/minimal-strapi.brief.json" with { type: "json" };
import minimalBrief from "./fixtures/minimal.brief.json" with { type: "json" };
import { discoveryQuestions } from "./questionnaire.js";
import { scaffoldTenant } from "./scaffold.js";
import { parseBrief } from "./schema.js";
import { briefToTenantConfig } from "./translate.js";

describe("Brief schema", () => {
  it("parses both fixture briefs", () => {
    expect(() => parseBrief(minimalBrief)).not.toThrow();
    expect(() => parseBrief(strapiBrief)).not.toThrow();
  });

  it("rejects invalid slugs", () => {
    expect(() =>
      parseBrief({
        ...minimalBrief,
        identity: { ...minimalBrief.identity, slug: "Bad Slug!" },
      }),
    ).toThrow();
  });

  it("requires Strapi block when contentStorage.mode is strapi", () => {
    expect(() =>
      parseBrief({
        ...strapiBrief,
        contentStorage: { mode: "strapi" },
      }),
    ).toThrow();
  });
});

describe("briefToTenantConfig", () => {
  it("translates the code-mode minimal brief into a parseable TenantConfig", () => {
    const cfg = briefToTenantConfig(parseBrief(minimalBrief));
    expect(cfg.identity.slug).toBe("minimal-hub");
    expect(cfg.contentSources.articles?.mode).toBe("code");
    expect(cfg.strapi).toBeUndefined();
  });

  it("translates the Strapi-mode brief and includes strapi config", () => {
    const cfg = briefToTenantConfig(parseBrief(strapiBrief));
    expect(cfg.contentSources.articles?.mode).toBe("strapi");
    expect(cfg.strapi?.baseUrl).toBe("https://cms.minimal-strapi.example.com");
  });
});

describe("scaffoldTenant — Phase 3 gate", () => {
  it("scaffolds the canonical code-mode file set from the minimal brief", async () => {
    const result = await scaffoldTenant(parseBrief(minimalBrief), {
      outDir: "/tmp/configurator-test-minimal",
      dryRun: true,
    });
    const paths = new Set(result.files.map((f) => f.path));
    expect(paths.has("tenant.config.ts")).toBe(true);
    expect(paths.has("AGENTS.md")).toBe(true);
    expect(paths.has("README.md")).toBe(true);
    expect(paths.has("package.json")).toBe(true);
    expect(paths.has("src/content/.gitkeep")).toBe(true);
    for (const f of result.files) {
      expect(f.path.startsWith("strapi/")).toBe(false);
    }
  });

  it("scaffolds Strapi files in addition for the strapi brief", async () => {
    const result = await scaffoldTenant(parseBrief(strapiBrief), {
      outDir: "/tmp/configurator-test-strapi",
      dryRun: true,
    });
    const paths = new Set(result.files.map((f) => f.path));
    expect(paths.has("tenant.config.ts")).toBe(true);
    expect(paths.has("strapi/Dockerfile")).toBe(true);
    expect(paths.has("strapi/render.yaml")).toBe(true);
    expect(paths.has("strapi/.env.example")).toBe(true);
    expect(paths.has("strapi/RUNBOOK.md")).toBe(true);
    expect(paths.has("strapi/schema/content-types.json")).toBe(true);

    const tenantTs = result.files.find((f) => f.path === "tenant.config.ts")!;
    expect(tenantTs.contents).toContain('"mode": "strapi"');
    expect(tenantTs.contents).toContain('"baseUrl": "https://cms.minimal-strapi.example.com"');
  });
});

describe("Discovery questionnaire", () => {
  it("covers every required Brief field", () => {
    const required = [
      "identity.name",
      "identity.slug",
      "identity.domain",
      "identity.industry",
      "identity.businessModel",
      "audience.primaryPersona.name",
      "audience.primaryPersona.pain",
      "audience.primaryPersona.value",
      "conversion.primary",
      "conversion.ctaPattern",
      "brand.primaryDistinctiveAsset",
      "brand.voiceTone",
      "seo.pillars",
      "contentStorage.mode",
    ];
    const paths = new Set(discoveryQuestions.map((q) => q.path));
    for (const p of required) {
      expect(paths.has(p), `missing question for ${p}`).toBe(true);
    }
  });
});
