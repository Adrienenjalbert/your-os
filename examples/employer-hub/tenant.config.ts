import { defineTenant } from "@your-os/tenant-config";

/**
 * `employer-hub` — first net-new B2B tenant scaffolded by `@your-os/configurator`
 * from `employer-hub.brief.json`. Phase 5 of the Multi-Tenant SEO OS plan.
 *
 * The configurator-emitted tenant.config.ts is the source of truth; this file
 * mirrors that output so the example builds and the integration test can
 * assert round-trip equivalence.
 */
export const tenantConfig = defineTenant({
  identity: {
    name: "Employer Hub",
    slug: "employer-hub",
    domain: "employers.indeedflex.com",
    industry: "flexible-staffing",
    businessModel: "b2b",
  },
  audience: {
    personas: [
      {
        id: "hr-director",
        name: "HR Director",
        pain: "Filling shifts on short notice without quality drop or compliance risk.",
        value: "Pre-vetted W-2 workers, transparent ROI, integrations with our ATS/payroll.",
      },
    ],
    icps: [
      {
        id: "vp-of-operations",
        role: "VP of Operations",
        industry: "warehousing",
      },
    ],
  },
  conversion: {
    primary: "demo_booking",
    ctaPattern: "Book a 30-min demo",
    eventName: "employer_hub_demo_booking",
    attributionParams: ["utm_source", "utm_medium", "utm_campaign"],
  },
  brand: {
    distinctiveAssets: [{ type: "phrase", value: "Pre-vetted W-2 workers", prevalenceTarget: 0.8 }],
    bannedPhrases: [],
    voice: {
      tone: "confident, data-led, no fluff",
      readingLevel: "10th_grade",
      pov: "third_person",
    },
  },
  seo: {
    primarySchemaType: "Article",
    pillars: [
      { slug: "case-studies", name: "Case Studies", intent: "commercial" },
      { slug: "roi-calculators", name: "ROI Calculators", intent: "transactional" },
      { slug: "integrations", name: "Integrations", intent: "commercial" },
      { slug: "comparisons", name: "Comparisons", intent: "commercial" },
      { slug: "playbooks", name: "Playbooks", intent: "informational" },
    ],
    contentClassTargets: { informational: 0.5, commercial: 0.3, brand: 0.2 },
    eeAtSignals: { authorByline: true, citationDensity: "high", dateModifiedRequired: true },
  },
  pSEO: {
    enabled: true,
    dimensions: [{ name: "industry" }, { name: "company-size" }],
  },
  tools: { enabled: ["calculator"] },
  trust: {
    caseStudies: true,
    customerLogos: true,
    complianceBadges: ["soc2", "gdpr", "iso27001"],
    workerReviews: false,
  },
  analytics: {},
  performance: { budgets: { lcpMs: 2500, inpMs: 200, cls: 0.1 } },
  integrations: {
    crm: "hubspot",
    crmConfig: {
      portalIdEnv: "HUBSPOT_PORTAL_ID",
      formIdEnv: "HUBSPOT_DEMO_FORM_ID",
      privateAppTokenEnv: "HUBSPOT_PRIVATE_APP_TOKEN",
    },
  },
  agentContext: {
    emphasize: [
      "B2B buying committee, not single-buyer journey",
      "Demo booking is the only conversion event",
      "ROI / case-study / integration / comparison content classes drive pipeline",
    ],
    forbid: ["B2C language ('shifts near me')", "Single-decision-maker assumptions"],
  },
  contentSources: {
    articles: { mode: "strapi", strapiCollection: "articles" },
    pillars: { mode: "strapi", strapiCollection: "pillars" },
    "case-studies": { mode: "strapi", strapiCollection: "case-studies" },
    "roi-scenarios": { mode: "strapi", strapiCollection: "roi-scenarios" },
    "integration-pages": { mode: "strapi", strapiCollection: "integration-pages" },
    "comparison-pages": { mode: "strapi", strapiCollection: "comparison-pages" },
  },
  strapi: {
    baseUrl: "https://cms.employers.indeedflex.com",
    transport: "rest",
    apiTokenEnv: "STRAPI_API_TOKEN",
    webhookSecretEnv: "STRAPI_WEBHOOK_SECRET",
    draftSecretEnv: "STRAPI_DRAFT_SECRET",
    schemaTemplate: "@your-os/strapi-template@1.x",
  },
});

export default tenantConfig;
