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

/**
 * Deterministic research provider. Used by CI (the golden-set eval harness)
 * and by local-dev sessions when no API keys are present. Outputs are
 * derived purely from the brief — no network, no randomness — so tests are
 * 100% reproducible.
 */
export class MockResearchProvider implements ResearchProvider {
  async serp(query: string, opts: { limit?: number } = {}): Promise<SerpResult[]> {
    const limit = opts.limit ?? 5;
    return Array.from({ length: limit }, (_, i) => ({
      url: `https://example.com/${slug(query)}/${i}`,
      title: `${capitalize(query)} – Result ${i + 1}`,
      snippet: `Mock result ${i + 1} for "${query}".`,
      intent: i === 0 ? "informational" : i % 2 === 0 ? "commercial" : "informational",
      competition: 0.4 + i * 0.05,
    }));
  }

  async keywordCluster(seed: string): Promise<KeywordCluster> {
    const s = slug(seed);
    return {
      primary: seed,
      secondary: [`${seed} guide`, `${seed} tips`, `${seed} examples`].slice(0, 3),
      longtail: [`how to ${seed}`, `${seed} step by step`, `${seed} for beginners`],
      questions: [`What is ${seed}?`, `How do you ${seed}?`, `Why ${seed}?`],
    };
  }

  async proposeIcps(brief: import("../schema.js").Brief): Promise<IcpProposal[]> {
    const base = brief.audience.primaryICP?.role ?? brief.audience.primaryPersona.name;
    return [
      {
        id: slug(base),
        role: base,
        industry: brief.identity.industry,
        pain: brief.audience.primaryPersona.pain,
        cep: `Looking for ${brief.identity.industry} solutions`,
      },
    ];
  }

  async proposeDbas(brief: import("../schema.js").Brief): Promise<DbaProposal[]> {
    return [
      {
        type: "phrase",
        value: brief.brand.primaryDistinctiveAsset,
        rationale: "Carried over from Discovery brief.",
        prevalenceTarget: 0.8,
      },
    ];
  }

  async proposePillars(brief: import("../schema.js").Brief): Promise<PillarProposal[]> {
    return brief.seo.pillars.map((p) => ({
      slug: p.slug,
      name: p.name,
      intent: p.intent,
      topClusters: [`${p.slug}-overview`, `${p.slug}-faq`, `${p.slug}-deep-dive`],
    }));
  }

  async selectPrimarySchema(brief: import("../schema.js").Brief): Promise<SchemaSelection> {
    return {
      primary: brief.seo.primarySchemaType,
      perContentType: {
        article: "Article",
        faq: "FAQPage",
        howto: "HowTo",
      },
      rationale: "Default mapping; override via Confirmation gate.",
    };
  }

  async scoreToolFit(brief: import("../schema.js").Brief): Promise<ToolFitScore> {
    const isCalculatorish = /calculator|estimator|cost|salary|tax|pay|wage/i.test(
      brief.audience.primaryPersona.value,
    );
    return {
      score: isCalculatorish ? 0.85 : 0.35,
      rationale: isCalculatorish
        ? "Persona value mentions money/cost/wage signals — strong calculator fit."
        : "No money/cost signals in persona value; tool-fit is weak.",
      suggestedTool: isCalculatorish
        ? { kind: "calculator", inputs: ["amount", "rate", "period"] }
        : undefined,
    };
  }
}

function slug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
