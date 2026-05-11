import type { Brief } from "../schema.js";

/**
 * `ResearchProvider` is the only seam the configurator opens to the outside
 * world. Production uses Anthropic + a SERP API behind this interface; CI uses
 * the deterministic `MockResearchProvider` so the golden-set harness is
 * hermetic.
 */
export interface ResearchProvider {
  serp: (query: string, opts?: { limit?: number }) => Promise<SerpResult[]>;
  keywordCluster: (seed: string) => Promise<KeywordCluster>;
  proposeIcps: (brief: Brief) => Promise<IcpProposal[]>;
  proposeDbas: (brief: Brief) => Promise<DbaProposal[]>;
  proposePillars: (brief: Brief) => Promise<PillarProposal[]>;
  selectPrimarySchema: (brief: Brief) => Promise<SchemaSelection>;
  scoreToolFit: (brief: Brief) => Promise<ToolFitScore>;
}

export interface SerpResult {
  url: string;
  title: string;
  snippet?: string;
  /** "informational" | "transactional" | "commercial" | "navigational" */
  intent?: string;
  /** 0-1 estimate of competition. */
  competition?: number;
}

export interface KeywordCluster {
  primary: string;
  secondary: string[];
  longtail: string[];
  questions: string[];
}

export interface IcpProposal {
  id: string;
  role: string;
  industry?: string;
  pain: string;
  cep: string;
}

export interface DbaProposal {
  type: "phrase" | "visual" | "sonic" | "character";
  value: string;
  rationale: string;
  /** Romaniuk prevalence target. Default 0.8. */
  prevalenceTarget?: number;
}

export interface PillarProposal {
  slug: string;
  name: string;
  intent: "informational" | "transactional" | "commercial" | "navigational";
  topClusters: string[];
}

export interface SchemaSelection {
  primary: string;
  /** Schema.org types worth populating per content-type. */
  perContentType: Record<string, string>;
  rationale: string;
}

export interface ToolFitScore {
  /** 0-1 — should this opportunity become an interactive tool, not (only) an article? */
  score: number;
  rationale: string;
  suggestedTool?:
    | { kind: "calculator"; inputs: string[] }
    | { kind: "decision-tree" }
    | { kind: "comparator" }
    | { kind: "generator" };
}
