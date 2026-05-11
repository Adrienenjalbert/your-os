import { defineTenant } from "@your-os/tenant-config";

/**
 * Bare-minimum code-mode tenant. Used as the canonical CI integration test
 * for `@your-os/*` packages. If this stops building, the OS is broken.
 */
export const tenantConfig = defineTenant({
  identity: {
    name: "Minimal Hub",
    slug: "minimal-hub",
    domain: "minimal.example.com",
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
    eventName: "newsletter_subscribe",
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
  tools: { enabled: ["calculator"] },
  trust: { caseStudies: false, customerLogos: false, complianceBadges: [], workerReviews: false },
  analytics: {},
  performance: { budgets: { lcpMs: 2500, inpMs: 200, cls: 0.1 } },
  integrations: { crm: "none", crmConfig: {} },
  agentContext: { emphasize: ["Mobile-first"], forbid: [] },
  contentSources: {
    articles: { mode: "code" },
    pillars: { mode: "code" },
    tools: { mode: "code" },
  },
  funnel: {
    intentMap: {},
    microConversions: { definitions: [], scoringModel: "weighted_sum" },
    domainAuthorityThreshold: 30,
  },
  email: {
    provider: "none",
    sequences: [],
    defaults: { newsletterFirstB2c: 4, considerationB2b: 7, demoMotion: 3 },
  },
});

export default tenantConfig;
