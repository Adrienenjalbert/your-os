import type { Brief } from "../schema.js";
import type {
  DbaProposal,
  IcpProposal,
  KeywordCluster,
  PillarProposal,
  ResearchProvider,
  SchemaSelection,
  SerpResult,
  ToolFitScore,
} from "./types.js";

export interface ResearchReport {
  serp: SerpResult[];
  keywordCluster: KeywordCluster;
  icpProposals: IcpProposal[];
  dbaProposals: DbaProposal[];
  pillarProposals: PillarProposal[];
  schema: SchemaSelection;
  toolFit: ToolFitScore;
}

export interface RunResearchOptions {
  brief: Brief;
  provider: ResearchProvider;
}

/**
 * Runs the AI research chain. Each step depends only on the brief, never on
 * other steps' output, so the runner parallelizes them. The Confirmation gate
 * (`confirm-gates.ts`) walks through the report and lets the operator
 * accept / edit / reject each proposal before scaffold time.
 *
 * keywordCluster is now wired (was declared on the interface but never
 * called); the cluster's primary keyword feeds the pillar/cluster taxonomy
 * surfaced in the configurator's Step 4 (SEO architecture) UI.
 */
export async function runResearch({
  brief,
  provider,
}: RunResearchOptions): Promise<ResearchReport> {
  const serpQuery = `${brief.identity.industry} ${brief.audience.primaryPersona.name}`;
  const seedKeyword = brief.audience.primaryPersona.value || brief.identity.industry;
  const [serp, keywordCluster, icpProposals, dbaProposals, pillarProposals, schema, toolFit] =
    await Promise.all([
      provider.serp(serpQuery, { limit: 10 }),
      provider.keywordCluster(seedKeyword),
      provider.proposeIcps(brief),
      provider.proposeDbas(brief),
      provider.proposePillars(brief),
      provider.selectPrimarySchema(brief),
      provider.scoreToolFit(brief),
    ]);
  return { serp, keywordCluster, icpProposals, dbaProposals, pillarProposals, schema, toolFit };
}
