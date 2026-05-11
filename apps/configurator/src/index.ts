/**
 * @your-os/configurator
 *
 * Phase 3 MVP. Owns the Discovery → Generation flow:
 *
 *   1. Discovery questionnaire collects answers as a `Brief` (see schema.ts).
 *   2. `briefToTenantConfig(brief)` translates the brief into a parsed
 *      `TenantConfig` from `@your-os/tenant-config`.
 *   3. `scaffoldTenant(brief, opts)` runs `@your-os/cli`'s `initTenant` and,
 *      for Strapi-mode briefs, layers `@your-os/strapi-deploy` files +
 *      `@your-os/strapi-template` schema-as-code.
 *
 * Phase 4 will hang AI Research chains + Confirmation gates onto this
 * surface; the scaffold seam stays unchanged.
 */
export {
  BriefSchema,
  parseBrief,
  type Brief,
  type DiscoveryAnswer,
  type DiscoveryQuestion,
} from "./schema.js";
export { discoveryQuestions } from "./questionnaire.js";
export { briefToTenantConfig } from "./translate.js";
export {
  scaffoldTenant,
  type ScaffoldOptions,
  type ScaffoldResult,
  type ScaffoldedFile,
} from "./scaffold.js";

// Phase 4: AI research chain + Confirmation gates + golden-set eval
export type {
  ResearchProvider,
  SerpResult,
  KeywordCluster,
  IcpProposal,
  DbaProposal,
  PillarProposal,
  SchemaSelection,
  ToolFitScore,
} from "./research/types.js";
export { MockResearchProvider } from "./research/mock-provider.js";
export {
  LiveResearchProvider,
  type LiveResearchProviderOptions,
} from "./research/live-provider.js";
export { runResearch, type ResearchReport } from "./research/runner.js";
export {
  applyGateDecisions,
  acceptAll,
  type GateDecision,
  type GateName,
  type ConfirmedReport,
} from "./research/confirm-gates.js";
export { enrichWithResearch } from "./research/enrich.js";
export {
  evaluateAgainstTarget,
  type ToleranceSpec,
  type EvalReport,
} from "./research/eval.js";

// 7-step onboarding state machine + manifest (consumed by web/CLI/console UIs)
export {
  ONBOARDING_STEPS,
  TOTAL_BUDGET_MINUTES,
  getStep,
  type OnboardingStepId,
  type StepDefinition,
  type ResearchJobId,
} from "./onboarding/steps.js";
export {
  OnboardingMachine,
  type OnboardingMachineOptions,
  type OnboardingSnapshot,
  type StepStatus,
} from "./onboarding/state.js";
