import type { TenantConfig } from "@your-os/tenant-config";
import type { Ga4Client, GscClient } from "../ingest/types.js";
import type { Notifier } from "../notify/index.js";
import { type StrapiClient, draftOpportunityBriefs } from "./brief-drafter.js";
import {
  type BacklinkGrowthRow,
  type InternalLinkGraphRow,
  type Opportunity,
  type RankWeights,
  type SchemaAuditRow,
  type TemplateUsageRow,
  rankOpportunities,
} from "./rank.js";

export interface WeeklyDigestInput {
  tenant: TenantConfig;
  gsc: GscClient;
  ga4?: Ga4Client;
  strapi: StrapiClient;
  notifier?: Notifier;
  startDate: string;
  endDate: string;
  weights?: Partial<RankWeights>;
  /** Cap drafted briefs per run. Default 5 (90/10 discipline). */
  maxBriefs?: number;
  now?: () => Date;
  /** Optional secondary signals — when provided, unlock kinds 3..7. */
  schemaAudit?: SchemaAuditRow[];
  linkGraph?: InternalLinkGraphRow[];
  templates?: TemplateUsageRow[];
  backlinks?: BacklinkGrowthRow[];
}

export interface WeeklyDigestReport {
  opportunities: Opportunity[];
  drafted: Array<{ opportunity: Opportunity; created: { id: number | string; slug?: string } }>;
}

/**
 * The weekly-digest agent. CI runs this against fixture GSC/GA4 data and
 * asserts the ranking + Strapi entries match the expected shape.
 */
export async function weeklyDigest(input: WeeklyDigestInput): Promise<WeeklyDigestReport> {
  const [gsc, ga4] = await Promise.all([
    input.gsc.topQueries({ startDate: input.startDate, endDate: input.endDate, limit: 500 }),
    input.ga4?.topPages({ startDate: input.startDate, endDate: input.endDate, limit: 500 }),
  ]);
  const opportunities = rankOpportunities(
    {
      gsc,
      ga4,
      schemaAudit: input.schemaAudit,
      linkGraph: input.linkGraph,
      templates: input.templates,
      backlinks: input.backlinks,
    },
    { weights: input.weights, limit: input.maxBriefs ?? 5 },
  );

  const drafted = await draftOpportunityBriefs(input.strapi, {
    tenant: input.tenant,
    opportunities,
    now: input.now,
  });

  if (input.notifier && drafted.length > 0) {
    const top = drafted
      .slice(0, 3)
      .map((d) => d.opportunity.query)
      .join(", ");
    await input.notifier.notify({
      title: `[${input.tenant.identity.slug}] Weekly digest: ${drafted.length} briefs drafted`,
      body: `Top opportunities: ${top}.`,
    });
  }

  return { opportunities, drafted };
}
