/**
 * @your-os/brand-lint
 *
 * Brand DBA + banned-phrase + AI-slop + GEO citation density linter.
 *
 * Extracted byte-equivalent from Career Hub's
 * `nextjs-app/scripts/agents/brand-lint.mjs`. The defaults here MUST stay in
 * sync with that script while Career Hub is mid-migration.
 *
 * Usage (programmatic):
 *
 *   import { lintFile, defaultRules } from "@your-os/brand-lint";
 *   const issues = lintFile(content, "src/features/x/data/y.ts", defaultRules);
 *
 * Usage (CLI):
 *
 *   pnpm exec your-os-brand-lint --all
 *   pnpm exec your-os-brand-lint --staged --budget 1500
 *   pnpm exec your-os-brand-lint src/features/x/data/y.ts
 */
export {
  lintFile,
  type LintIssue,
  type LintRules,
  type Severity,
} from "./lint.js";
export {
  defaultRules,
  defaultBannedPhrases,
  defaultAiSlopPatterns,
  defaultDollarPattern,
  defaultInlineCitationPattern,
  defaultStatisticPattern,
  defaultRequiredComponentPatterns,
  buildRulesFromTenantConfig,
} from "./rules.js";
export { findContentFiles, type FindContentFilesOptions } from "./fs.js";
export { runCli, type CliOptions, type CliResult } from "./run.js";
export {
  lintIntentCtaMatch,
  lintToolGate,
  lintNurtureOrphan,
  lintBofuHeavyNewHub,
  type FunnelLintRuleId,
  type BriefForLint,
  type PageContextForLint,
  type SequenceForLint,
} from "./funnel-rules.js";
