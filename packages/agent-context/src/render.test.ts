import type { TenantConfig } from "@your-os/tenant-config";
import { describe, expect, it } from "vitest";
import { renderAgentsMd, renderCursorRules } from "./index.js";

const careerHub: TenantConfig = {
  identity: {
    name: "Career Hub",
    slug: "career-hub",
    domain: "indeedflex.com",
    industry: "flexible-work",
    businessModel: "b2c",
  },
  audience: {
    personas: [{ id: "students", name: "Students", pain: "p", value: "v" }],
    icps: [],
  },
  conversion: {
    primary: "app_install",
    ctaPattern: "Find {role} shifts",
    eventName: "app_install_click",
    attributionParams: ["utm_source"],
  },
  brand: {
    distinctiveAssets: [{ type: "phrase", value: "Same Day Pay", prevalenceTarget: 0.8 }],
    bannedPhrases: [],
    voice: { tone: "warm", readingLevel: "8th_grade", pov: "second_person" },
  },
  seo: {
    primarySchemaType: "Article",
    pillars: [{ slug: "roles", name: "Roles" }],
    contentClassTargets: {},
    eeAtSignals: { authorByline: true, citationDensity: "high", dateModifiedRequired: true },
  },
  pSEO: { enabled: true, dimensions: [] },
  tools: { enabled: [] },
  trust: { caseStudies: false, customerLogos: false, complianceBadges: [], workerReviews: true },
  analytics: {},
  performance: { budgets: { lcpMs: 2500, inpMs: 200, cls: 0.1 } },
  integrations: { crm: "none", crmConfig: {} },
  agentContext: { emphasize: ["Mobile-first"], forbid: ["Desktop-first"] },
  contentSources: { articles: { mode: "code" } },
};

describe("renderAgentsMd", () => {
  it("renders Career Hub identity + DBAs + emphasize/forbid", () => {
    const md = renderAgentsMd({ tenant: careerHub });
    expect(md).toContain("# Career Hub — agent context");
    expect(md).toContain("Same Day Pay");
    expect(md).toContain("Mobile-first");
    expect(md).toContain("Desktop-first");
  });

  it("filters Strapi skills out for code-mode tenants", () => {
    const md = renderAgentsMd({ tenant: careerHub });
    expect(md).not.toContain("strapi-content-modeling");
    expect(md).not.toContain("strapi-publish-flow");
  });

  it("includes Strapi skills when tenant.strapi is present", () => {
    const md = renderAgentsMd({
      tenant: {
        ...careerHub,
        strapi: {
          baseUrl: "https://cms.example.com",
          transport: "rest",
          apiTokenEnv: "T",
          webhookSecretEnv: "W",
          draftSecretEnv: "D",
          schemaTemplate: "@your-os/strapi-template@1.x",
        },
      },
    });
    expect(md).toContain("strapi-content-modeling");
  });

  it("supports preface + omitSkills", () => {
    const md = renderAgentsMd({ tenant: careerHub, preface: "Hello team", omitSkills: true });
    expect(md).toContain("Hello team");
    expect(md).not.toContain("## Skills");
  });
});

describe("renderCursorRules", () => {
  it("emits 2 always-on/glob rule files", () => {
    const files = renderCursorRules({ tenant: careerHub });
    expect(files.map((f) => f.path)).toEqual([
      ".cursor/rules/000-core.mdc",
      ".cursor/rules/010-seo.mdc",
    ]);
    expect(files[0]?.contents).toContain("Career Hub core rules");
    expect(files[1]?.contents).toContain("Pillars in scope: roles");
  });
});
