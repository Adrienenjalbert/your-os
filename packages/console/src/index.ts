/**
 * @your-os/console — v1 thin slice.
 *
 * Headless. Ships:
 *   - keyboard map + resolver
 *   - Home view model
 *   - Opportunity queue view model
 *   - Brief editor view model + reducer (Approve / Edit / Reject)
 *
 * v1 ships only the data layer; web/CLI shells consume it.
 *
 * Deferred (per the plan):
 *   - ROOS dashboard view (v1.1, after 30+ briefs reconcile)
 *   - AI-citation share view (v1.1, paired with @your-os/ai-visibility)
 *   - Experiments view (v1.2, deferred until A/B demand confirms)
 *   - Refresh queue view (v1.1, paired with @your-os/refresh-engine)
 */
export {
  KEYBOARD_MAP,
  resolveKeyboardAction,
  type ConsoleAction,
  type KeyboardBinding,
  type KeyboardEventLike,
} from "./keyboard.js";

export {
  homeViewModel,
  type HomeViewModel,
  type HomeViewModelInput,
  type HomeKpi,
  type BriefSummary,
} from "./views/home.js";

export {
  opportunityQueueViewModel,
  type OpportunityQueueViewModel,
  type OpportunityQueueRow,
  type OpportunityQueueOptions,
} from "./views/opportunity-queue.js";

export {
  briefEditorViewModel,
  briefEditorReducer,
  type BriefDraft,
  type BriefEditorViewModel,
  type BriefEditorState,
  type IntentCtaCheck,
} from "./views/brief-editor.js";
