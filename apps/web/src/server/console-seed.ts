import "server-only";
import type { BriefSummary } from "@your-os/console";
import {
  MockGa4Client,
  MockGscClient,
  MockStrapiClient,
  type Opportunity,
  rankOpportunities,
} from "@your-os/control-plane";
import type { ReconciliationReport } from "@your-os/measurement";

/**
 * Dev / design-partner seed for the M2 Console surfaces.
 *
 * Per the v1.1 plan we keep the seed in-memory and process-local — no DB
 * dependency on day zero. Live partner deploys swap MockGsc/MockStrapi for
 * real adapters via `apps/control-plane`.
 */

export const mockGsc = new MockGscClient([
  {
    page: "/guides/payroll-calculator",
    query: "hourly payroll calculator",
    position: 7.4,
    impressions: 12_400,
    clicks: 380,
    ctr: 0.031,
  },
  {
    page: "/guides/payroll-calculator",
    query: "weekly pay calculator",
    position: 4.1,
    impressions: 8_900,
    clicks: 280,
    ctr: 0.031,
  },
  {
    page: "/guides/overtime-pay",
    query: "overtime pay rules",
    position: 11.2,
    impressions: 5_300,
    clicks: 110,
    ctr: 0.021,
  },
  {
    page: "/guides/tax-withholding-2026",
    query: "2026 tax withholding tables",
    position: 14.6,
    impressions: 4_100,
    clicks: 65,
    ctr: 0.016,
  },
  {
    page: "/tools/shift-finder",
    query: "find local hourly shifts",
    position: 9.3,
    impressions: 6_700,
    clicks: 180,
    ctr: 0.027,
  },
]);

export const mockGa4 = new MockGa4Client([
  {
    page: "/guides/payroll-calculator",
    sessions: 4_900,
    conversions: 220,
    conversionRate: 0.045,
  },
  {
    page: "/tools/shift-finder",
    sessions: 3_200,
    conversions: 410,
    conversionRate: 0.128,
  },
]);

export const mockStrapi = new MockStrapiClient();

let cachedOpps: Opportunity[] | null = null;
export async function getOpportunities(): Promise<Opportunity[]> {
  if (cachedOpps) return cachedOpps;
  const gsc = await mockGsc.topQueries({ limit: 50 });
  const ga4 = await mockGa4.topPages({ limit: 50 });
  cachedOpps = rankOpportunities({
    gsc,
    ga4,
    schemaAudit: [{ page: "/guides/overtime-pay", validity: 0.4, missing: ["FAQPage"] }],
    linkGraph: [{ page: "/guides/tax-withholding-2026", inboundLinks: 0, pillar: "guides" }],
    backlinks: [
      {
        page: "/guides/payroll-calculator",
        newReferringDomains30d: 12,
        totalBacklinks: 88,
      },
    ],
  });
  return cachedOpps;
}

/**
 * Hand-written brief fixtures so the queue → brief drilldown has something
 * concrete on day one. Each brief is linked to one of the mock opportunities
 * by index so click-through stays believable.
 */
export async function getBriefs(): Promise<BriefSummary[]> {
  const opps = await getOpportunities();
  return [
    {
      id: "brief-001",
      title: "Striking-distance — hourly payroll calculator",
      status: "draft",
      opportunityKind: opps[0]?.kind ?? "striking-distance",
      estimatedClicks: 380,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: "brief-002",
      title: "CTR-rescue — weekly pay calculator",
      status: "draft",
      opportunityKind: opps[1]?.kind ?? "ctr-rescue",
      estimatedClicks: 220,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
    {
      id: "brief-003",
      title: "Schema-fix — overtime FAQ",
      status: "approved",
      opportunityKind: "schema-fix",
      estimatedClicks: 110,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
  ];
}

export async function getReconciliations(): Promise<ReconciliationReport[]> {
  // v1.1 design-partner test ships before any 30-day window closes — return
  // an empty list so the in-band % KPI shows "no actuals reconciled yet".
  return [];
}

import type { CtaArchetype, SearchIntent } from "@your-os/tenant-config";

export interface MockBriefDraftFixture {
  id: string;
  title: string;
  intent: SearchIntent;
  primaryCta: CtaArchetype;
  status: "draft" | "approved" | "shipped" | "rejected";
}

const FIXTURE_BRIEFS: Record<string, MockBriefDraftFixture> = {
  "brief-001": {
    id: "brief-001",
    title: "Striking-distance — hourly payroll calculator",
    intent: "informational_problem_aware",
    primaryCta: "tool_try",
    status: "draft",
  },
  "brief-002": {
    id: "brief-002",
    title: "CTR-rescue — weekly pay calculator",
    intent: "informational_problem_aware",
    primaryCta: "tool_try",
    status: "draft",
  },
  "brief-003": {
    id: "brief-003",
    title: "Schema-fix — overtime FAQ",
    intent: "informational_early",
    primaryCta: "newsletter",
    status: "approved",
  },
};

export function getBriefFixture(id: string): MockBriefDraftFixture | null {
  return FIXTURE_BRIEFS[id] ?? null;
}

export function listBriefFixtureIds(): string[] {
  return Object.keys(FIXTURE_BRIEFS);
}
