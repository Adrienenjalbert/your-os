/**
 * Career Hub tenant config snapshot.
 *
 * This is the ROUND-TRIP TARGET for the Phase 4 configurator gate. The
 * configurator must be able to produce something close to this from a guided
 * session over Career Hub's seed brief.
 *
 * Mirrors nextjs-app/docs/MARKETING_CONTEXT.md. Update both in lockstep.
 */
import { defineTenant } from "@your-os/tenant-config";

export const careerHubConfig = defineTenant({
  identity: {
    name: "Career Hub",
    slug: "career-hub",
    domain: "indeedflex.com",
    industry: "flexible-work-marketplace",
    businessModel: "b2c",
  },
  audience: {
    personas: [
      {
        id: "students",
        name: "Students",
        pain: "Need work around class schedules",
        value: "No-experience roles, flexible shifts, budget tools",
      },
      {
        id: "career-changers",
        name: "Career Changers",
        pain: "Want to test industries without commitment",
        value: "Role guides, skills analysis, industry comparisons",
      },
      {
        id: "gig-workers",
        name: "Gig Workers",
        pain: "Already freelancing, need W-2 stability",
        value: "Tax tools, earnings calculators, benefits info",
      },
      {
        id: "working-parents",
        name: "Working Parents",
        pain: "Need shifts around childcare/school",
        value: "Schedule flexibility content, childcare cost tools",
      },
      {
        id: "retirees",
        name: "Retirees",
        pain: "Want supplemental income without impact on benefits",
        value: "Part-time guides, benefits calculators, low-demand roles",
      },
    ],
    icps: [],
  },
  conversion: {
    primary: "app_install",
    ctaPattern: "Find ${range} {role} Shifts",
    eventName: "app_install_click",
    attributionParams: ["utm_source", "utm_medium", "utm_campaign", "utm_content"],
  },
  brand: {
    distinctiveAssets: [
      { type: "phrase", value: "Same Day Pay", prevalenceTarget: 0.8 },
      { type: "phrase", value: "W-2 employment", prevalenceTarget: 0.8 },
      { type: "phrase", value: "Choose your own shifts", prevalenceTarget: 0.8 },
    ],
    bannedPhrases: [],
    voice: { tone: "warm", readingLevel: "8th_grade", pov: "second_person" },
  },
  seo: {
    primarySchemaType: "Article",
    pillars: [
      { slug: "roles", name: "Roles", intent: "informational" },
      { slug: "cities", name: "Cities", intent: "navigational" },
      { slug: "guides", name: "Guides", intent: "informational" },
      { slug: "tools", name: "Tools", intent: "transactional" },
      { slug: "financial-tips", name: "Financial Tips", intent: "informational" },
      { slug: "industries", name: "Industries", intent: "informational" },
    ],
    contentClassTargets: { informational: 0.6, transactional: 0.25, brand: 0.15 },
    eeAtSignals: { authorByline: true, citationDensity: "high", dateModifiedRequired: true },
  },
  pSEO: {
    enabled: true,
    dimensions: [{ name: "city" }, { name: "role" }],
  },
  tools: { enabled: ["calculator", "decision-tool"] },
  trust: {
    caseStudies: false,
    customerLogos: false,
    complianceBadges: [],
    workerReviews: true,
  },
  analytics: { ga4MeasurementId: "G-XXXXXXXX" },
  performance: { budgets: { lcpMs: 2500, inpMs: 200, cls: 0.1 } },
  integrations: { crm: "none", crmConfig: {} },
  agentContext: {
    emphasize: [
      "Mobile-first hourly worker audience",
      "App download is the only conversion event",
      "City x role pSEO is the proprietary moat",
    ],
    forbid: ["Desktop-first design assumptions", "Email capture forms"],
  },
  contentSources: {
    articles: { mode: "code" },
    guides: { mode: "code" },
    pillars: { mode: "code" },
    tools: { mode: "code" },
    cities: { mode: "code" },
    roles: { mode: "code" },
    pSeoCells: { mode: "code", generator: "@your-os/pseo-engine" },
  },
});
