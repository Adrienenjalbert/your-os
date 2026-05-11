/**
 * @your-os/refresh-engine
 *
 * Content-decay detector + refresh-PR drafter. Pure. The freshness loop step
 * of the closed-loop diagram.
 */
export {
  detectDecay,
  type DecayCandidate,
  type DecayReason,
  type DecayReasonId,
  type DecayWeights,
  type DetectDecayInput,
  type PageDecaySignals,
} from "./decay.js";

export {
  draftRefreshPlan,
  type RefreshPlan,
  type CodeRefreshPlan,
  type StrapiRefreshPatch,
  type RefreshMode,
} from "./draft.js";
