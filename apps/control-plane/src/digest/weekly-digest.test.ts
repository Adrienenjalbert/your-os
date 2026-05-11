import { type TenantConfig, parseTenantConfig } from "@your-os/tenant-config";
import { describe, expect, it, vi } from "vitest";
import { MockGa4Client, MockGscClient } from "../ingest/mock.js";
import { slackNotifier } from "../notify/index.js";
import { MockStrapiClient } from "./mock-strapi.js";
import { performanceWriteBack } from "./performance.js";
import { rankOpportunities } from "./rank.js";
import { weeklyDigest } from "./weekly-digest.js";

const tenant: TenantConfig = parseTenantConfig({
  identity: {
    name: "Career Hub",
    slug: "career-hub",
    domain: "indeedflex.com",
    industry: "flexible-work-marketplace",
    businessModel: "b2c",
  },
  audience: { personas: [], icps: [] },
  conversion: {
    primary: "app_install",
    ctaPattern: "Find shifts near you",
    eventName: "app_install_click",
    attributionParams: ["utm_source"],
  },
  brand: {
    distinctiveAssets: [],
    bannedPhrases: [],
    voice: { tone: "warm", readingLevel: "8th_grade", pov: "second_person" },
  },
  seo: { primarySchemaType: "Article", pillars: [{ slug: "g", name: "G" }] },
  pSEO: { enabled: false, dimensions: [] },
  tools: { enabled: [] },
  trust: {},
  analytics: {},
  performance: {},
  integrations: {},
  agentContext: {},
  contentSources: { articles: { mode: "code" } },
});

const fixtureGsc = [
  // striking-distance: position 8, 5000 impr → 5000 * 0.06 = 300 clicks lift
  {
    page: "/guides/warehouse",
    query: "warehouse jobs near me",
    position: 8,
    impressions: 5000,
    clicks: 60,
    ctr: 0.012,
  },
  // ctr-rescue: position 3, 2000 impr, low CTR
  {
    page: "/guides/forklift",
    query: "forklift operator pay",
    position: 3,
    impressions: 2000,
    clicks: 80,
    ctr: 0.04,
  },
  // below floor: ignored
  { page: "/guides/x", query: "x", position: 5, impressions: 10, clicks: 1, ctr: 0.1 },
  // not in striking range, high CTR: ignored
  { page: "/guides/y", query: "y", position: 1, impressions: 1000, clicks: 350, ctr: 0.35 },
];

const fixtureGa4 = [
  { page: "/guides/warehouse", sessions: 100, conversions: 0, conversionRate: 0 },
];

describe("rankOpportunities", () => {
  it("filters out below-floor + ranks by lift_per_effort", () => {
    const opps = rankOpportunities({ gsc: fixtureGsc, ga4: fixtureGa4 });
    expect(opps.length).toBe(2);
    // Striking-distance on warehouse has higher absolute lift (300 clicks)
    // / effort (0.3) → 1000 vs ctr-rescue 40/0.15 = 266.7.
    expect(opps[0]!.kind).toBe("striking-distance");
    expect(opps[1]!.kind).toBe("ctr-rescue");
    // GA4 low conversion enrichment lands on the matching striking-distance opp.
    expect(opps[0]!.reason).toContain("low conversion");
  });

  it("respects the limit option", () => {
    const opps = rankOpportunities({ gsc: fixtureGsc }, { limit: 1 });
    expect(opps.length).toBe(1);
  });

  it("emits schema-fix when audit shows low validity on trafficked pages", () => {
    const opps = rankOpportunities(
      {
        gsc: fixtureGsc,
        schemaAudit: [
          { page: "/guides/warehouse", validity: 0.4, missing: ["Article", "FAQPage"] },
        ],
      },
      { limit: 50 },
    );
    expect(opps.some((o) => o.kind === "schema-fix")).toBe(true);
    const fix = opps.find((o) => o.kind === "schema-fix")!;
    expect(fix.reason).toContain("Article");
  });

  it("emits link-injection when an orphan page has material impressions", () => {
    const opps = rankOpportunities(
      {
        gsc: fixtureGsc,
        linkGraph: [{ page: "/guides/warehouse", inboundLinks: 0, pillar: "guides" }],
      },
      { limit: 50 },
    );
    const inject = opps.find((o) => o.kind === "link-injection");
    expect(inject).toBeDefined();
    expect(inject?.reason).toContain("Orphan");
  });

  it("emits cannibalization-consolidation when 2+ URLs rank for same query", () => {
    const cannibalGsc = [
      ...fixtureGsc,
      // Second URL ranking for same query as warehouse one
      {
        page: "/articles/warehouse-jobs",
        query: "warehouse jobs near me",
        position: 14,
        impressions: 1500,
        clicks: 18,
        ctr: 0.012,
      },
    ];
    const opps = rankOpportunities({ gsc: cannibalGsc }, { limit: 50 });
    const cannibal = opps.find((o) => o.kind === "cannibalization-consolidation");
    expect(cannibal).toBeDefined();
    expect(cannibal?.relatedPages).toEqual(["/articles/warehouse-jobs"]);
  });

  it("emits template-extension when template has traction + room", () => {
    const opps = rankOpportunities(
      {
        gsc: fixtureGsc,
        templates: [
          {
            page: "/guides/warehouse",
            template: "guide-pillar",
            additionalCellsAvailable: 12,
          },
        ],
      },
      { limit: 50 },
    );
    const tmpl = opps.find((o) => o.kind === "template-extension");
    expect(tmpl).toBeDefined();
    expect(tmpl?.query).toBe("guide-pillar");
  });

  it("emits linkable-asset when ref-domains/30d cross the floor", () => {
    const opps = rankOpportunities(
      {
        gsc: fixtureGsc,
        backlinks: [{ page: "/guides/warehouse", newReferringDomains30d: 7, totalBacklinks: 42 }],
      },
      { limit: 50 },
    );
    const linkable = opps.find((o) => o.kind === "linkable-asset");
    expect(linkable).toBeDefined();
    expect(linkable?.reason).toContain("7 new referring domains");
  });

  it("does NOT emit kinds 3..7 when secondary signals are absent (back-compat)", () => {
    const opps = rankOpportunities({ gsc: fixtureGsc }, { limit: 50 });
    expect(opps.every((o) => o.kind === "striking-distance" || o.kind === "ctr-rescue")).toBe(true);
  });
});

describe("weeklyDigest — Phase 6 gate", () => {
  it("ranks opportunities + writes valid OpportunityBrief Strapi entries", async () => {
    const strapi = new MockStrapiClient();
    const report = await weeklyDigest({
      tenant,
      gsc: new MockGscClient(fixtureGsc),
      ga4: new MockGa4Client(fixtureGa4),
      strapi,
      startDate: "2026-04-01",
      endDate: "2026-04-30",
      now: () => new Date("2026-05-01T00:00:00Z"),
    });
    expect(report.opportunities.length).toBe(2);
    expect(strapi.created.length).toBe(2);

    const top = strapi.created[0]!;
    expect(top.data.targetKeyword).toBe("warehouse jobs near me");
    expect(top.data.estimatedLift.kind).toBe("striking-distance");
    expect(top.data.createdBy).toBe("weekly-digest-agent");
    expect(top.data.status).toBe("draft");
    expect(top.data.createdAt).toBe("2026-05-01T00:00:00.000Z");
    expect(top.data.citationSeeds.length).toBeGreaterThan(0);
    expect(strapi.created[1]!.data.estimatedLift.kind).toBe("ctr-rescue");
  });

  it("notifies Slack when briefs were drafted", async () => {
    const strapi = new MockStrapiClient();
    const fetchMock = vi.fn(
      async () => new Response(null, { status: 200 }),
    ) as unknown as typeof globalThis.fetch;
    const notifier = slackNotifier({
      webhookUrl: "https://hooks.slack.com/services/X",
      fetch: fetchMock,
    });
    await weeklyDigest({
      tenant,
      gsc: new MockGscClient(fixtureGsc),
      ga4: new MockGa4Client(fixtureGa4),
      strapi,
      notifier,
      startDate: "2026-04-01",
      endDate: "2026-04-30",
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

describe("performanceWriteBack", () => {
  it("writes performanceSnapshot and flips status at 90 days", async () => {
    const strapi = new MockStrapiClient();
    const gsc = new MockGscClient([
      { page: "/g/x", query: "x", position: 4.5, impressions: 1000, clicks: 80, ctr: 0.08 },
    ]);
    const ga4 = new MockGa4Client([
      { page: "/g/x", sessions: 200, conversions: 8, conversionRate: 0.04 },
    ]);
    const report = await performanceWriteBack({
      shipped: [{ briefId: 7, targetKeyword: "x", landedUrl: "/g/x" }],
      windowDays: 90,
      startIso: "2026-01-01",
      endIso: "2026-04-01",
      gsc,
      ga4,
      strapi,
    });
    expect(report.written).toBe(1);
    expect(report.summaries[0]!.actualClicks).toBe(80);
    expect(report.summaries[0]!.actualConversions).toBe(8);
    const update = strapi.updates[0]!;
    expect((update.data as { status?: string }).status).toBe("shipped");
    expect(
      (update.data as { performanceSnapshot: { actualClicks: number } }).performanceSnapshot
        .actualClicks,
    ).toBe(80);
  });
});
