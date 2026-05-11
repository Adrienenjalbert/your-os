/**
 * @your-os/control-plane
 *
 * Phase 6 — the hosted side of the OS. Owns:
 *
 *   1. GSC + GA4 ingest (interfaces only; production wires real APIs).
 *   2. Weekly-digest agent that ranks opportunities and drafts
 *      `OpportunityBrief` entries straight into the tenant's Strapi.
 *   3. Performance write-back: 30/60/90-day actuals → Brief
 *      `performanceSnapshot` so the attribution skill can compare predictions.
 *   4. brand-lint + Lighthouse history aggregator.
 *   5. Slack notifier seam.
 *
 * Every external call lives behind a small interface so CI runs without
 * network access; production wires real adapters in `apps/control-plane/src/adapters/`.
 */
export type {
  GscRow,
  Ga4Row,
  GscClient,
  Ga4Client,
} from "./ingest/types.js";
export { MockGscClient, MockGa4Client } from "./ingest/mock.js";
export {
  rankOpportunities,
  type Opportunity,
  type OpportunityKind,
  type RankInput,
  type RankWeights,
  type SchemaAuditRow,
  type InternalLinkGraphRow,
  type TemplateUsageRow,
  type BacklinkGrowthRow,
} from "./digest/rank.js";
export {
  weeklyDigest,
  type WeeklyDigestInput,
  type WeeklyDigestReport,
} from "./digest/weekly-digest.js";
export {
  draftOpportunityBriefs,
  type DraftOptions,
  type DraftedBrief,
  type StrapiClient,
} from "./digest/brief-drafter.js";
export { MockStrapiClient } from "./digest/mock-strapi.js";
export {
  performanceWriteBack,
  type WriteBackInput,
  type WriteBackReport,
} from "./digest/performance.js";
export {
  type Notifier,
  consoleNotifier,
  slackNotifier,
} from "./notify/index.js";
