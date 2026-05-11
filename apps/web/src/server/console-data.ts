import "server-only";
import {
  type BriefDraft,
  type BriefEditorViewModel,
  type HomeViewModel,
  type OpportunityQueueOptions,
  type OpportunityQueueViewModel,
  briefEditorViewModel,
  homeViewModel,
  opportunityQueueViewModel,
} from "@your-os/console";
import type { TenantConfig } from "@your-os/tenant-config";
import { parseTenantConfig } from "@your-os/tenant-config";
import { getBriefFixture, getBriefs, getOpportunities, getReconciliations } from "./console-seed";
import { readTenantConfig, seedTenantConfig } from "./tenant-store";

/**
 * Loads (or seeds) the working tenant config the console uses for KPI labels
 * and intent-CTA checks. We never crash if the file isn't there yet — the
 * seed lives in `tenant-store` and matches the minimal example.
 */
export async function loadTenantConfigForConsole(): Promise<TenantConfig> {
  const existing = await readTenantConfig();
  if (existing) return existing;
  return parseTenantConfig(seedTenantConfig());
}

export async function loadHomeViewModel(): Promise<HomeViewModel> {
  const [tenant, opportunities, briefs, reconciliations] = await Promise.all([
    loadTenantConfigForConsole(),
    getOpportunities(),
    getBriefs(),
    getReconciliations(),
  ]);
  // Modeled weekly-lift = sum of estimatedClicks for non-rejected briefs.
  // Static fixture data, so we synthesize a believable WoW delta.
  const weeklyLiftClicks = briefs
    .filter((b) => b.status !== "shipped")
    .reduce((acc, b) => acc + b.estimatedClicks, 0);
  return homeViewModel({
    tenant,
    opportunities,
    briefs,
    reconciliations,
    weeklyLiftClicks,
    weeklyLiftWowDeltaPct: 12.5,
  });
}

export async function loadOpportunityQueueViewModel(
  options: OpportunityQueueOptions = {},
): Promise<OpportunityQueueViewModel> {
  const opps = await getOpportunities();
  return opportunityQueueViewModel(opps, options);
}

/**
 * Map opportunity-queue rank → fully-qualified brief href for click-through.
 *
 * v1.1 ships hand-written brief fixtures, so we map by rank: the Nth brief
 * in `getBriefs()` is the Nth opportunity in the ranked queue. This is a
 * best-effort UI affordance — the headless view models stay relationship-
 * free; we only stitch them at the page boundary so the user can click a
 * row and land on the brief that the queue is implying.
 *
 * Returns a *full* href (e.g. `/console/briefs/brief-001`) so call sites
 * can pass the value straight to `<Link href={…}>`. Returning bare ids
 * here previously broke navigation because `<Link href="brief-001">`
 * resolves relative to the current URL, sending users to /console/brief-001
 * (404) instead of /console/briefs/brief-001.
 */
export async function loadOpportunityToBriefMap(): Promise<Map<number, string>> {
  const briefs = await getBriefs();
  const map = new Map<number, string>();
  briefs.forEach((b, i) => {
    map.set(i, `/console/briefs/${b.id}`);
  });
  return map;
}

/**
 * Briefs index — what the user sees when they click "Briefs" in the subnav.
 * Returns the existing summaries with status counts so the index page can
 * show "3 drafts · 1 approved · 0 shipped" without re-loading the briefs.
 */
export async function loadBriefsIndex(): Promise<{
  briefs: Array<BriefSummary & { href: string }>;
  counts: { draft: number; approved: number; shipped: number; total: number };
}> {
  const briefs = await getBriefs();
  const counts = {
    draft: briefs.filter((b) => b.status === "draft").length,
    approved: briefs.filter((b) => b.status === "approved").length,
    shipped: briefs.filter((b) => b.status === "shipped").length,
    total: briefs.length,
  };
  return {
    briefs: briefs.map((b) => ({ ...b, href: `/console/briefs/${b.id}` })),
    counts,
  };
}

import type { BriefSummary } from "@your-os/console";

/**
 * Build the brief editor view model and the underlying draft (so we can hand
 * the draft to the client for the reducer-driven approve / reject flow).
 */
export async function loadBriefEditor(
  briefId: string,
): Promise<{ vm: BriefEditorViewModel; draft: BriefDraft; tenant: TenantConfig } | null> {
  const fixture = getBriefFixture(briefId);
  if (!fixture) return null;
  const [tenant, opps] = await Promise.all([loadTenantConfigForConsole(), getOpportunities()]);
  const opportunity = opps[0];
  if (!opportunity) return null;
  const draft: BriefDraft = {
    id: fixture.id,
    title: fixture.title,
    intent: fixture.intent,
    primaryCta: fixture.primaryCta,
    status: fixture.status,
    opportunity,
    forecast: {
      briefId: fixture.id,
      d30: { low: 4, mid: 9, high: 14 },
      d60: { low: 9, mid: 18, high: 27 },
      d90: { low: 14, mid: 28, high: 42 },
      effectiveConversionRate: 0.04,
      microConversionUplift: 0,
    },
  };
  const vm = briefEditorViewModel(draft, tenant);
  return { vm, draft, tenant };
}
