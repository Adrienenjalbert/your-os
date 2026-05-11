import { describe, expect, it } from "vitest";
import { type TenantConfig, defineTenant, parseTenantConfig } from "./index.js";

const careerHubLike: TenantConfig = {
  identity: {
    name: "Career Hub",
    slug: "career-hub",
    domain: "indeedflex.com",
    industry: "flexible-work",
    businessModel: "b2c",
  },
  audience: {
    personas: [
      { id: "students", name: "Students", pain: "Need work around class", value: "Flex shifts" },
    ],
    icps: [],
  },
  conversion: {
    primary: "app_install",
    ctaPattern: "Find $15-$25/hr {role} Shifts",
    eventName: "app_install_click",
    attributionParams: ["utm_source", "utm_medium", "utm_campaign"],
  },
  brand: {
    distinctiveAssets: [{ type: "phrase", value: "Same Day Pay", prevalenceTarget: 0.8 }],
    bannedPhrases: [],
    voice: { tone: "warm", readingLevel: "8th_grade", pov: "second_person" },
  },
  seo: {
    primarySchemaType: "Article",
    pillars: [{ slug: "roles", name: "Roles" }],
    contentClassTargets: { informational: 0.6, transactional: 0.25, brand: 0.15 },
    eeAtSignals: { authorByline: true, citationDensity: "high", dateModifiedRequired: true },
  },
  pSEO: { enabled: true, dimensions: [{ name: "city" }, { name: "role" }] },
  tools: { enabled: ["calculator"] },
  trust: { caseStudies: false, customerLogos: false, complianceBadges: [], workerReviews: true },
  analytics: { ga4MeasurementId: "G-XXX" },
  performance: { budgets: { lcpMs: 2500, inpMs: 200, cls: 0.1 } },
  integrations: { crm: "none", crmConfig: {}, email: undefined },
  agentContext: { emphasize: [], forbid: [] },
  contentSources: {
    articles: { mode: "code" },
    pillars: { mode: "code" },
    tools: { mode: "code" },
  },
};

const employerHubLike: TenantConfig = {
  ...careerHubLike,
  identity: {
    name: "Employer Hub",
    slug: "employer-hub",
    domain: "employer.indeedflex.com",
    industry: "workforce-saas",
    businessModel: "b2b",
  },
  audience: {
    personas: [],
    icps: [
      {
        id: "hr-director",
        role: "HR Director",
        industry: "hospitality",
        companySize: "200-1000",
        buyingCommittee: ["HR", "Operations", "Procurement"],
        cep: "When facing peak-season staffing gaps",
      },
    ],
  },
  conversion: {
    primary: "demo_booking",
    ctaPattern: "Book a 20-min demo",
    eventName: "demo_request_submitted",
    attributionParams: ["utm_source", "utm_medium", "utm_campaign"],
  },
  brand: {
    distinctiveAssets: [{ type: "phrase", value: "W-2 flex workforce", prevalenceTarget: 0.8 }],
    bannedPhrases: [],
    voice: { tone: "authoritative", readingLevel: "10th_grade", pov: "third_person" },
  },
  seo: {
    primarySchemaType: "Service",
    pillars: [{ slug: "hospitality", name: "Hospitality" }],
    contentClassTargets: { tofu: 0.5, mofu: 0.3, bofu: 0.15, sales_enablement: 0.05 },
    eeAtSignals: { authorByline: true, citationDensity: "high", dateModifiedRequired: true },
  },
  trust: {
    caseStudies: true,
    customerLogos: true,
    complianceBadges: ["SOC2", "GDPR"],
    workerReviews: false,
  },
  contentSources: {
    articles: { mode: "strapi", strapiCollection: "articles" },
    caseStudies: { mode: "strapi", strapiCollection: "case-studies" },
    pillars: { mode: "code" },
    tools: { mode: "code" },
  },
  strapi: {
    baseUrl: "https://cms.employer.indeedflex.com",
    transport: "rest",
    apiTokenEnv: "STRAPI_API_TOKEN",
    webhookSecretEnv: "STRAPI_WEBHOOK_SECRET",
    draftSecretEnv: "STRAPI_DRAFT_SECRET",
    schemaTemplate: "@your-os/strapi-template@1.x",
  },
};

describe("TenantConfigSchema", () => {
  it("accepts a Career Hub-like B2C code-mode config", () => {
    const result = parseTenantConfig(careerHubLike);
    expect(result.identity.businessModel).toBe("b2c");
    expect(result.contentSources.articles?.mode).toBe("code");
    expect(result.strapi).toBeUndefined();
  });

  it("accepts an Employer Hub-like B2B strapi-mode config", () => {
    const result = parseTenantConfig(employerHubLike);
    expect(result.identity.businessModel).toBe("b2b");
    expect(result.contentSources.articles?.mode).toBe("strapi");
    expect(result.strapi?.baseUrl).toBe("https://cms.employer.indeedflex.com");
  });

  it("rejects strapi-mode config that omits tenantConfig.strapi", () => {
    const broken = { ...employerHubLike, strapi: undefined };
    expect(() => parseTenantConfig(broken)).toThrow(/strapi is required/);
  });

  it("rejects invalid slug (uppercase)", () => {
    const broken = {
      ...careerHubLike,
      identity: { ...careerHubLike.identity, slug: "Career-Hub" },
    };
    expect(() => parseTenantConfig(broken)).toThrow(/lowercase alphanumeric/);
  });

  it("defineTenant returns the input as-is (preserves literal types)", () => {
    const out = defineTenant(careerHubLike);
    expect(out).toBe(careerHubLike);
  });

  it("defaults funnel and email when omitted (back-compat for existing tenants)", () => {
    const result = parseTenantConfig(careerHubLike);
    expect(result.funnel).toBeDefined();
    expect(result.funnel.intentMap).toEqual({});
    expect(result.funnel.microConversions.scoringModel).toBe("weighted_sum");
    expect(result.email.provider).toBe("none");
    expect(result.email.sequences).toEqual([]);
  });

  it("accepts a tenant with funnel.intentMap + microConversions populated", () => {
    const withFunnel: TenantConfig = {
      ...careerHubLike,
      funnel: {
        intentMap: {
          informational_early: {
            allowedPrimaryCta: ["newsletter", "lead_magnet", "tool_try"],
            forbiddenPrimaryCta: ["demo", "pricing", "hard_gate_before_value"],
            defaultMicroConversionGoals: ["scroll_75", "newsletter_confirm"],
          },
        },
        microConversions: {
          definitions: [
            { id: "tool_completed", weight: 0.6, pillars: ["roles"], roosContribution: 0.15 },
            { id: "newsletter_confirm", weight: 0.4, roosContribution: 0.05 },
          ],
          scoringModel: "weighted_sum",
        },
        domainAuthorityThreshold: 30,
      },
      email: {
        provider: "kit",
        sequences: [
          {
            id: "pillar_roles_nurture",
            length: 5,
            sourceTrigger: "article_tag",
            pillarSpine: "roles",
            steps: [
              {
                index: 1,
                contentRefs: ["articles/finding-flex-shifts"],
                ctaSoft: true,
                ctaHard: false,
              },
              {
                index: 4,
                contentRefs: ["tools/salary-calculator"],
                ctaSoft: false,
                ctaHard: true,
                mapsToConversion: "app_install_click",
              },
            ],
          },
        ],
        defaults: { newsletterFirstB2c: 4, considerationB2b: 7, demoMotion: 3 },
      },
    };
    const result = parseTenantConfig(withFunnel);
    expect(result.funnel.intentMap.informational_early?.forbiddenPrimaryCta).toContain("demo");
    expect(result.funnel.microConversions.definitions).toHaveLength(2);
    expect(result.email.provider).toBe("kit");
    expect(result.email.sequences[0]?.steps[0]?.contentRefs).toContain(
      "articles/finding-flex-shifts",
    );
  });

  it("supports hybrid content sources with strapi inside", () => {
    const hybrid: TenantConfig = {
      ...careerHubLike,
      contentSources: {
        articles: {
          mode: "hybrid",
          primary: { mode: "strapi", strapiCollection: "articles" },
          fallback: { mode: "code" },
        },
        pillars: { mode: "code" },
      },
      strapi: {
        baseUrl: "https://cms.example.com",
        transport: "rest",
        apiTokenEnv: "STRAPI_API_TOKEN",
        webhookSecretEnv: "STRAPI_WEBHOOK_SECRET",
        draftSecretEnv: "STRAPI_DRAFT_SECRET",
        schemaTemplate: "@your-os/strapi-template@1.x",
      },
    };
    const result = parseTenantConfig(hybrid);
    expect(result.contentSources.articles?.mode).toBe("hybrid");
  });
});
