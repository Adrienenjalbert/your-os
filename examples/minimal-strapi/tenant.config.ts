import { defineTenant } from "@your-os/tenant-config";

/**
 * Strapi-mode tenant fixture. Used by the configurator (Phase 4) as the
 * gold-standard target for Strapi scaffolding, and by CI as the integration
 * surface for `@your-os/strapi-*` packages.
 */
export const tenantConfig = defineTenant({
  identity: {
    name: "Minimal Strapi Hub",
    slug: "minimal-strapi",
    domain: "minimal-strapi.example.com",
    industry: "demo",
    businessModel: "b2c",
  },
  audience: {
    personas: [
      {
        id: "shift-worker",
        name: "Shift worker",
        pain: "Wages change weekly.",
        value: "Compare current pay rates by city.",
      },
    ],
    icps: [],
  },
  conversion: {
    primary: "newsletter",
    ctaPattern: "Subscribe",
    eventName: "newsletter_subscribe",
    attributionParams: ["utm_source", "utm_medium", "utm_campaign"],
  },
  brand: {
    distinctiveAssets: [{ type: "phrase", value: "Real shifts, real pay", prevalenceTarget: 0.8 }],
    bannedPhrases: [],
    voice: { tone: "neutral, plain-language", readingLevel: "8th_grade", pov: "second_person" },
  },
  seo: {
    primarySchemaType: "Article",
    pillars: [{ slug: "guides", name: "Guides", intent: "informational" }],
    contentClassTargets: { informational: 0.7, commercial: 0.3 },
    eeAtSignals: { authorByline: true, citationDensity: "high", dateModifiedRequired: true },
  },
  pSEO: { enabled: false, dimensions: [] },
  tools: { enabled: [] },
  trust: { caseStudies: false, customerLogos: false, complianceBadges: [], workerReviews: false },
  analytics: {},
  performance: { budgets: { lcpMs: 2500, inpMs: 200, cls: 0.1 } },
  integrations: { crm: "none", crmConfig: {} },
  agentContext: { emphasize: ["Strapi mode"], forbid: [] },
  contentSources: {
    articles: { mode: "strapi", strapiCollection: "articles" },
    pillars: { mode: "strapi", strapiCollection: "pillars" },
    clusters: { mode: "strapi", strapiCollection: "clusters" },
  },
  strapi: {
    baseUrl: "https://cms.minimal-strapi.example.com",
    transport: "rest",
    apiTokenEnv: "STRAPI_API_TOKEN",
    webhookSecretEnv: "STRAPI_WEBHOOK_SECRET",
    draftSecretEnv: "STRAPI_DRAFT_SECRET",
    schemaTemplate: "@your-os/strapi-template@1.x",
  },
});

export default tenantConfig;
