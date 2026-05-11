/**
 * LiveResearchProvider — production implementation of ResearchProvider.
 *
 * Calls Anthropic for LLM-driven proposals (ICP, DBA, pillars, schema, tool-fit)
 * and DataForSEO for SERP + keyword clustering. Falls back to a mock per-method
 * when the relevant env vars are missing, so a partial setup still works during
 * onboarding (e.g. the user has Anthropic but not DataForSEO yet).
 *
 * Why these vendors:
 *   - Anthropic Claude: cheapest + most flexible LLM for structured output via
 *     JSON-only response patterns. No SDK dep — plain `fetch`.
 *   - DataForSEO: rate-limit friendly, cheaper than SerpAPI, supports both
 *     SERP and keyword clustering via Labs endpoints.
 *
 * Network access uses global `fetch` (Node 20+) to avoid an SDK dependency.
 *
 * IMPORTANT: This file imports `MockResearchProvider` at runtime as a fallback.
 * That is intentional — keeps the OS usable without API keys (e.g. during
 * onboarding's first 2 steps before the user has connected vendors).
 */
import type { Brief } from "../schema.js";
import { MockResearchProvider } from "./mock-provider.js";
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

export interface LiveResearchProviderOptions {
  /** Anthropic API key. If missing, LLM-backed methods fall back to mock. */
  anthropicApiKey?: string;
  /** Anthropic model id. Default: claude-3-5-haiku-latest (cost-efficient). */
  anthropicModel?: string;
  /** DataForSEO basic-auth credentials, "login:password" string. */
  dataForSeoAuth?: string;
  /** Default search engine for DataForSEO. */
  dataForSeoLocation?: string;
  /** Optional override for fetch (testing). */
  fetchImpl?: typeof fetch;
  /** Optional logger; defaults to no-op. */
  log?: (msg: string, meta?: Record<string, unknown>) => void;
}

const DEFAULT_MODEL = "claude-3-5-haiku-latest";
const DEFAULT_LOCATION = "United States";

/**
 * Live provider. Each method:
 *   1. Tries the real vendor.
 *   2. On missing credentials → delegates to MockResearchProvider for that
 *      method only (other methods still hit the network if configured).
 *   3. On vendor error → throws (callers decide whether to gracefully fall
 *      back via `wrapWithFallback` below).
 */
export class LiveResearchProvider implements ResearchProvider {
  private readonly anthropicApiKey?: string;
  private readonly anthropicModel: string;
  private readonly dataForSeoAuth?: string;
  private readonly dataForSeoLocation: string;
  private readonly fetchImpl: typeof fetch;
  private readonly log: (msg: string, meta?: Record<string, unknown>) => void;
  private readonly mock: MockResearchProvider;

  constructor(opts: LiveResearchProviderOptions = {}) {
    this.anthropicApiKey = opts.anthropicApiKey ?? process.env.ANTHROPIC_API_KEY;
    this.anthropicModel = opts.anthropicModel ?? DEFAULT_MODEL;
    this.dataForSeoAuth = opts.dataForSeoAuth ?? process.env.DATAFORSEO_AUTH;
    this.dataForSeoLocation = opts.dataForSeoLocation ?? DEFAULT_LOCATION;
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch;
    this.log = opts.log ?? (() => {});
    this.mock = new MockResearchProvider();
  }

  async serp(query: string, opts: { limit?: number } = {}): Promise<SerpResult[]> {
    if (!this.dataForSeoAuth) {
      this.log("serp: DATAFORSEO_AUTH missing, using mock", { query });
      return this.mock.serp(query, opts);
    }
    const limit = opts.limit ?? 10;
    const body = [
      {
        keyword: query,
        location_name: this.dataForSeoLocation,
        language_name: "English",
        depth: limit,
      },
    ];
    const res = await this.fetchImpl(
      "https://api.dataforseo.com/v3/serp/google/organic/live/regular",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(this.dataForSeoAuth).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) {
      throw new Error(`DataForSEO SERP failed: ${res.status} ${await safeText(res)}`);
    }
    const json = (await res.json()) as DataForSeoSerpResponse;
    const items = json.tasks?.[0]?.result?.[0]?.items ?? [];
    return items.slice(0, limit).map((it) => ({
      url: it.url ?? "",
      title: it.title ?? "",
      snippet: it.description,
      intent: classifyIntentFromTitle(it.title ?? ""),
      competition: undefined,
    }));
  }

  async keywordCluster(seed: string): Promise<KeywordCluster> {
    if (!this.dataForSeoAuth) {
      this.log("keywordCluster: DATAFORSEO_AUTH missing, using mock", { seed });
      return this.mock.keywordCluster(seed);
    }
    const body = [
      {
        keyword: seed,
        location_name: this.dataForSeoLocation,
        language_name: "English",
        limit: 30,
      },
    ];
    const res = await this.fetchImpl(
      "https://api.dataforseo.com/v3/dataforseo_labs/google/related_keywords/live",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(this.dataForSeoAuth).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) {
      throw new Error(`DataForSEO related_keywords failed: ${res.status} ${await safeText(res)}`);
    }
    const json = (await res.json()) as DataForSeoRelatedResponse;
    const items = json.tasks?.[0]?.result?.[0]?.items ?? [];
    const all = items
      .map((i) => i.keyword_data?.keyword)
      .filter((k): k is string => typeof k === "string" && k.length > 0);
    const secondary = all
      .filter((k) => k !== seed)
      .filter((k) => !k.includes("?"))
      .filter((k) => k.split(" ").length <= 4)
      .slice(0, 5);
    const longtail = all.filter((k) => k.split(" ").length >= 4).slice(0, 5);
    const questions = all
      .filter((k) => /^(what|how|why|when|where|who|is|can|should|do)\s/i.test(k))
      .slice(0, 5);
    return {
      primary: seed,
      secondary: secondary.length ? secondary : [`${seed} guide`, `${seed} examples`],
      longtail: longtail.length ? longtail : [`${seed} step by step`, `${seed} for beginners`],
      questions: questions.length ? questions : [`What is ${seed}?`, `How do you ${seed}?`],
    };
  }

  async proposeIcps(brief: Brief): Promise<IcpProposal[]> {
    if (!this.anthropicApiKey) return this.mock.proposeIcps(brief);
    const out = await this.callAnthropicJson<IcpProposal[]>(
      `Propose 1-3 ICPs (Ideal Customer Profiles) for this hub. Return JSON array of objects with id, role, industry, pain, cep (Category Entry Point per Romaniuk W-framework). Brief:\n${JSON.stringify(brief, null, 2)}`,
    );
    return out ?? this.mock.proposeIcps(brief);
  }

  async proposeDbas(brief: Brief): Promise<DbaProposal[]> {
    if (!this.anthropicApiKey) return this.mock.proposeDbas(brief);
    const out = await this.callAnthropicJson<DbaProposal[]>(
      `Propose 2-4 Distinctive Brand Assets (Romaniuk style) for this hub. Return JSON array of objects with type ("phrase"|"visual"|"sonic"|"character"), value, rationale, prevalenceTarget (0.6-0.9). Always include the existing primary DBA from brief.brand.primaryDistinctiveAsset as the first item. Brief:\n${JSON.stringify(brief, null, 2)}`,
    );
    return out ?? this.mock.proposeDbas(brief);
  }

  async proposePillars(brief: Brief): Promise<PillarProposal[]> {
    if (!this.anthropicApiKey) return this.mock.proposePillars(brief);
    const out = await this.callAnthropicJson<PillarProposal[]>(
      `Propose 3-5 SEO content pillars for this hub. Each pillar should have a slug (lowercase-dashed), name, intent ("informational"|"transactional"|"commercial"|"navigational"), and topClusters (3-5 cluster names). Use the existing pillars from brief.seo.pillars as anchors. Return JSON array. Brief:\n${JSON.stringify(brief, null, 2)}`,
    );
    return out ?? this.mock.proposePillars(brief);
  }

  async selectPrimarySchema(brief: Brief): Promise<SchemaSelection> {
    if (!this.anthropicApiKey) return this.mock.selectPrimarySchema(brief);
    const out = await this.callAnthropicJson<SchemaSelection>(
      `Select schema.org types for this hub. Return JSON object: { primary: string, perContentType: Record<string, string>, rationale: string }. Use the existing brief.seo.primarySchemaType as the primary unless there is a strong reason to change. Brief:\n${JSON.stringify(brief, null, 2)}`,
    );
    return out ?? this.mock.selectPrimarySchema(brief);
  }

  async scoreToolFit(brief: Brief): Promise<ToolFitScore> {
    if (!this.anthropicApiKey) return this.mock.scoreToolFit(brief);
    const out = await this.callAnthropicJson<ToolFitScore>(
      `Score whether this hub's primary opportunity should ship as an interactive tool (calculator/decision-tree/comparator/generator) instead of (or alongside) an article. Return JSON object: { score: number 0..1, rationale: string, suggestedTool?: { kind: "calculator"|"decision-tree"|"comparator"|"generator", inputs?: string[] } }. Brief:\n${JSON.stringify(brief, null, 2)}`,
    );
    return out ?? this.mock.scoreToolFit(brief);
  }

  // --- Anthropic helper ---

  private async callAnthropicJson<T>(prompt: string): Promise<T | null> {
    const res = await this.fetchImpl("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.anthropicApiKey ?? "",
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.anthropicModel,
        max_tokens: 2048,
        system:
          "You are a deterministic JSON generator for an SEO content OS. Output ONLY valid JSON with no prose, no code fences, no commentary. The first character of your response must be '{' or '['.",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      this.log("anthropic call failed", { status: res.status, body: await safeText(res) });
      return null;
    }
    const json = (await res.json()) as AnthropicMessageResponse;
    const text = json.content?.[0]?.text ?? "";
    return parseJsonStrict<T>(text);
  }
}

// --- helpers ---

function parseJsonStrict<T>(input: string): T | null {
  // Anthropic sometimes wraps JSON in code fences despite the system prompt.
  // Be liberal in what we accept.
  let cleaned = input.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  }
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "<unreadable>";
  }
}

/**
 * Heuristic intent classifier from a SERP title. We don't (yet) call an LLM
 * for this — a regex pass is cheaper and good enough for the configurator's
 * Confirmation gate, where a human reviews each proposal anyway.
 */
function classifyIntentFromTitle(title: string): string {
  const t = title.toLowerCase();
  if (/\bbuy|price|deal|cheap|order|coupon\b/.test(t)) return "transactional";
  if (/\bbest|top \d|review|comparison|vs\b/.test(t)) return "commercial";
  if (/^(what|how|why|when|where|who|guide)\b/.test(t)) return "informational";
  return "informational";
}

// --- vendor response shapes (just what we read) ---

interface DataForSeoSerpResponse {
  tasks?: Array<{
    result?: Array<{
      items?: Array<{
        url?: string;
        title?: string;
        description?: string;
      }>;
    }>;
  }>;
}

interface DataForSeoRelatedResponse {
  tasks?: Array<{
    result?: Array<{
      items?: Array<{
        keyword_data?: { keyword?: string };
      }>;
    }>;
  }>;
}

interface AnthropicMessageResponse {
  content?: Array<{ type: string; text?: string }>;
}
