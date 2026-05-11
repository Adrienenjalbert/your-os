/**
 * The 7-step onboarding contract.
 *
 * Each step has:
 *   - id: stable identifier
 *   - title: short copy for UI tabs/breadcrumbs
 *   - oneLiner: one-sentence purpose (shown above the form)
 *   - timeBudgetMinutes: target completion time per step (informs UX density)
 *   - inputs: brief fields the step collects
 *   - parallelResearch: research jobs the runner kicks off when the step starts
 *   - hitlGates: which Confirmation gates the operator owns at this step
 *
 * v1 ships the spine (this file + state.ts). UIs (web/CLI) consume the
 * manifest to render the step. `apps/web` (the v1.1 Web Shell) renders
 * Step 7 (launch preview) using the configurator's outputs.
 */
import type { GateName } from "../research/confirm-gates.js";

export type OnboardingStepId =
  | "identity"
  | "audience-conversion"
  | "brand"
  | "seo-architecture"
  | "content-ops-cms"
  | "integrations"
  | "launch-preview";

export type ResearchJobId =
  | "serp"
  | "keywordCluster"
  | "proposeIcps"
  | "proposeDbas"
  | "proposePillars"
  | "selectPrimarySchema"
  | "scoreToolFit";

export interface StepDefinition {
  id: OnboardingStepId;
  title: string;
  oneLiner: string;
  timeBudgetMinutes: number;
  /** Brief schema paths the step writes to. */
  inputs: string[];
  /** Research jobs run in parallel when the step is entered. */
  parallelResearch: ResearchJobId[];
  /** Confirmation gates the operator owns at this step. */
  hitlGates: GateName[];
  /** Optional: UI hint for when to use HITL discipline (per rule 060). */
  hitlNote?: string;
}

export const ONBOARDING_STEPS: readonly StepDefinition[] = [
  {
    id: "identity",
    title: "Identity",
    oneLiner: "Name the hub. Pick its slug, domain, industry, and business model.",
    timeBudgetMinutes: 3,
    inputs: [
      "identity.name",
      "identity.slug",
      "identity.domain",
      "identity.industry",
      "identity.businessModel",
    ],
    parallelResearch: [],
    hitlGates: [],
    hitlNote:
      "No HITL gate here — this is data entry. The next step kicks off ICP research in the background.",
  },
  {
    id: "audience-conversion",
    title: "Audience & Conversion",
    oneLiner:
      "Tell us who buys (persona + ICP) and what conversion you optimize for. We propose ICPs in parallel.",
    timeBudgetMinutes: 5,
    inputs: [
      // primaryICP.* is optional (B2C tenants often skip it); persona is required.
      "audience.primaryPersona.name",
      "audience.primaryPersona.pain",
      "audience.primaryPersona.value",
      "conversion.primary",
      "conversion.ctaPattern",
    ],
    parallelResearch: ["proposeIcps", "scoreToolFit"],
    hitlGates: ["icps", "toolFit"],
    hitlNote:
      "HITL #2 (Brief sign-off, narrowly): Accept / Edit / Reject the proposed ICPs and tool-fit score.",
  },
  {
    id: "brand",
    title: "Brand & Voice",
    oneLiner:
      "Lock the primary distinctive brand asset, voice, and reading level. We propose 2-4 DBAs in parallel.",
    timeBudgetMinutes: 4,
    inputs: ["brand.primaryDistinctiveAsset", "brand.voiceTone", "brand.readingLevel", "brand.pov"],
    parallelResearch: ["proposeDbas"],
    hitlGates: ["dbas"],
    hitlNote: "Pick the DBAs that survive. The brand-lint will enforce ≥80% prevalence.",
  },
  {
    id: "seo-architecture",
    title: "SEO Architecture",
    oneLiner:
      "Confirm pillars + intent. Pick the primary schema.org type. We run SERP + keyword cluster + pillar research.",
    timeBudgetMinutes: 5,
    inputs: ["seo.pillars", "seo.primarySchemaType"],
    parallelResearch: ["serp", "keywordCluster", "proposePillars", "selectPrimarySchema"],
    hitlGates: ["pillars", "schema"],
    hitlNote:
      "Most opinionated step. Edit pillars to match how the user thinks of the topic, not how Google clusters it.",
  },
  {
    id: "content-ops-cms",
    title: "Content Ops & CMS",
    oneLiner: "Pick code-mode or Strapi. Configure draft/preview/publish flow.",
    timeBudgetMinutes: 4,
    inputs: ["contentStorage.mode", "contentStorage.strapi"],
    parallelResearch: [],
    hitlGates: [],
    hitlNote:
      "Strapi-mode requires a running Strapi instance + 3 secrets. Code-mode lands in 0 minutes.",
  },
  {
    id: "integrations",
    title: "Integrations",
    oneLiner:
      "Wire GSC + GA4 + email provider + Slack. Each is optional but unlocks the closed loop.",
    timeBudgetMinutes: 6,
    inputs: [],
    parallelResearch: [],
    hitlGates: [],
    hitlNote:
      "Skip what you can't authorize now — the console surfaces 'connect later' chips for each missing integration.",
  },
  {
    id: "launch-preview",
    title: "Launch Preview",
    oneLiner:
      "Final review: domain, pillar tree, sample brief, ROOS forecast band, 3 email sequences. Approve to scaffold.",
    timeBudgetMinutes: 3,
    inputs: [],
    parallelResearch: [],
    hitlGates: [],
    hitlNote:
      "HITL #2 finalization: this is the single commit point. After Approve, the repo scaffold runs and the first opportunity briefs land in the console queue.",
  },
] as const;

export const TOTAL_BUDGET_MINUTES: number = ONBOARDING_STEPS.reduce(
  (sum, s) => sum + s.timeBudgetMinutes,
  0,
);

/** Lookup helper. */
export function getStep(id: OnboardingStepId): StepDefinition {
  const step = ONBOARDING_STEPS.find((s) => s.id === id);
  if (!step) throw new Error(`Unknown step: ${id}`);
  return step;
}
