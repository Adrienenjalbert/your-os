import { CONTENT_TYPES } from "@your-os/strapi-template";
import type { TenantConfig } from "@your-os/tenant-config";
import type { Opportunity } from "./rank.js";

export interface DraftedBrief {
  /** Strapi `data` payload for `POST /api/opportunity-briefs`. */
  data: {
    targetKeyword: string;
    suggestedTitle: string;
    estimatedLift: { clicks: number; effort: number; liftPerEffort: number; kind: string };
    citationSeeds: string[];
    internalLinkSuggestions: string[];
    targetWordCount: number;
    createdBy: "weekly-digest-agent";
    createdAt: string;
    status: "draft";
    performanceSnapshot: null;
  };
}

export interface StrapiClient {
  createOpportunityBrief(
    data: DraftedBrief["data"],
  ): Promise<{ id: number | string; slug?: string }>;
  /** Used by performance write-back. */
  updateOpportunityBriefById(id: number | string, data: Record<string, unknown>): Promise<void>;
}

export interface DraftOptions {
  tenant: TenantConfig;
  opportunities: Opportunity[];
  /** Hook for a deterministic clock; CI passes `() => new Date("2026-01-01")`. */
  now?: () => Date;
}

/**
 * Drafts `OpportunityBrief` Strapi entries, validating the payload shape against
 * the OS schema definition for `opportunity-brief` (so a future schema change to
 * `@your-os/strapi-template` is caught here at CI time, not in production).
 */
export async function draftOpportunityBriefs(
  client: StrapiClient,
  opts: DraftOptions,
): Promise<Array<{ opportunity: Opportunity; created: { id: number | string; slug?: string } }>> {
  assertOpportunityBriefSchemaIsCompatible();
  const now = (opts.now ?? (() => new Date()))().toISOString();
  const out: Array<{ opportunity: Opportunity; created: { id: number | string; slug?: string } }> =
    [];

  for (const opp of opts.opportunities) {
    const data: DraftedBrief["data"] = {
      targetKeyword: opp.query,
      suggestedTitle: titleCase(`Definitive guide to ${opp.query}`),
      estimatedLift: {
        clicks: opp.liftClicks,
        effort: opp.effort,
        liftPerEffort: opp.liftPerEffort,
        kind: opp.kind,
      },
      citationSeeds: defaultCitationSeeds(opts.tenant),
      internalLinkSuggestions: [opp.page],
      targetWordCount: targetWordCountForKind(opp.kind),
      createdBy: "weekly-digest-agent",
      createdAt: now,
      status: "draft",
      performanceSnapshot: null,
    };
    const created = await client.createOpportunityBrief(data);
    out.push({ opportunity: opp, created });
  }
  return out;
}

function targetWordCountForKind(kind: Opportunity["kind"]): number {
  switch (kind) {
    case "striking-distance":
      return 1800;
    case "linkable-asset":
      return 2400; // depth + originality drives links
    case "template-extension":
      return 600; // pSEO cells skew shorter
    case "schema-fix":
    case "ctr-rescue":
    case "link-injection":
      return 0; // no rewrite — these are structural fixes, not content rewrites
    case "cannibalization-consolidation":
      return 1500; // merged article carries combined intent
    default:
      return 1200;
  }
}

function defaultCitationSeeds(tenant: TenantConfig): string[] {
  if (tenant.identity.businessModel === "b2c") {
    return ["https://www.bls.gov/", "https://www.dol.gov/", "https://www.irs.gov/"];
  }
  if (tenant.identity.businessModel === "b2b") {
    return ["https://www.gartner.com/", "https://www.shrm.org/", "https://www.bls.gov/"];
  }
  return ["https://www.bls.gov/"];
}

function titleCase(s: string): string {
  return s
    .split(" ")
    .map((w) => (w.length === 0 ? w : w[0]!.toUpperCase() + w.slice(1)))
    .join(" ");
}

/**
 * Sanity-check that the `opportunity-brief` content-type from
 * `@your-os/strapi-template` still has the fields we rely on. Throws loudly
 * at module-load if a schema change broke us.
 */
function assertOpportunityBriefSchemaIsCompatible(): void {
  const def = CONTENT_TYPES.find((c) => c.apiId === "opportunity-brief");
  if (!def)
    throw new Error(
      "brief-drafter: opportunity-brief schema missing from @your-os/strapi-template",
    );
  const required = [
    "targetKeyword",
    "suggestedTitle",
    "estimatedLift",
    "citationSeeds",
    "internalLinkSuggestions",
    "targetWordCount",
    "createdBy",
    "createdAt",
    "status",
    "performanceSnapshot",
  ];
  for (const key of required) {
    if (!(key in def.attributes)) {
      throw new Error(
        `brief-drafter: opportunity-brief.${key} missing — control-plane is incompatible.`,
      );
    }
  }
}
