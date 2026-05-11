import "server-only";
import {
  LiveResearchProvider,
  MockResearchProvider,
  type ResearchProvider,
} from "@your-os/configurator";

/**
 * Hybrid factory (per the v1.1 plan):
 *   - dev / CI            → MockResearchProvider (deterministic, hermetic)
 *   - preview / production with ANTHROPIC_API_KEY → LiveResearchProvider with
 *     per-method mock fallback for any vendor whose key is missing.
 *
 * The factory NEVER throws — a missing key just degrades to the mock so the
 * Onboarding shell stays usable end to end on day-zero.
 */
export type ResearchMode = "mock" | "live" | "hybrid";

export interface ProviderFactoryOptions {
  /** Override mode for tests (otherwise resolved from env). */
  mode?: ResearchMode;
}

export function getResearchProvider(opts: ProviderFactoryOptions = {}): ResearchProvider {
  const mode = opts.mode ?? resolveMode();
  if (mode === "mock") return new MockResearchProvider();
  return new LiveResearchProvider({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    anthropicModel: process.env.ANTHROPIC_MODEL,
    dataForSeoAuth: process.env.DATAFORSEO_AUTH,
  });
}

export function resolveMode(): ResearchMode {
  const explicit = process.env.YOUR_OS_RESEARCH_MODE;
  if (explicit === "mock" || explicit === "live" || explicit === "hybrid") return explicit;
  if (process.env.NODE_ENV === "test") return "mock";
  if (process.env.ANTHROPIC_API_KEY || process.env.DATAFORSEO_AUTH) return "live";
  return "mock";
}
