import type { TenantConfig } from "@your-os/tenant-config";
import type { LintRules } from "./lint.js";

/**
 * Default banned phrases (subset of Career Hub's BRAND.md). Keep this list
 * byte-equivalent to nextjs-app/scripts/agents/brand-lint.mjs while Career Hub
 * is mid-migration.
 */
export const defaultBannedPhrases: readonly RegExp[] = [
  /\bbest\s+in\s+the\s+industry\b/i,
  /\bindustry[-\s]leading\b/i,
  /\brevolutionary\b/i,
  /\bgame[-\s]changing\b/i,
  /\bgame[-\s]changer\b/i,
  /\bcutting[-\s]edge\b/i,
  /\bworld[-\s]class\b/i,
  /\bunparalleled\b/i,
  /\bseamless\b/i,
  /\beffortlessly?\b/i,
  /\bunleash\b/i,
  /\bdive\s+into\b/i,
  /\bin\s+today's\s+(fast[-\s]paced\s+)?(world|landscape|economy)\b/i,
  /\bone[-\s]stop\s+shop\b/i,
];

/**
 * Default AI-slop patterns (Google Helpful Content System).
 */
export const defaultAiSlopPatterns: readonly RegExp[] = [
  /\bstudies\s+(have\s+)?shown?\b(?!.*\([A-Z])/i,
  /\bmany\s+experts?\s+agree\b/i,
  /\bit's\s+important\s+to\s+(note|remember|understand)\s+that\b/i,
  /\bwhether\s+you're\s+a\s+\w+\s+or\s+a\s+\w+/i,
  /\bin\s+conclusion\b/i,
  /\bto\s+sum\s+(up|it\s+up)\b/i,
];

/**
 * Dollar amount with no immediate citation in same sentence.
 * Catches "$15/hr" without a "(Source Year)" within ~80 chars.
 */
export const defaultDollarPattern: RegExp =
  /\$\d+(?:[,.]?\d+)*(?:\s*(?:[-–]\s*\$?\d+(?:[,.]?\d+)*))?(?:\/(?:hr|hour|year|yr|month|mo|week|wk))?/g;

/**
 * Inline citation pattern: "(SourceName YYYY)" or "(SourceName, YYYY)".
 */
export const defaultInlineCitationPattern: RegExp =
  /\([A-Z][A-Za-z][A-Za-z\s\d&]+,?\s+(?:19|20)\d{2}\)/g;

/**
 * Statistic in body text (number with unit/context).
 */
export const defaultStatisticPattern: RegExp =
  /\b(\d+(?:[,.]?\d+)*\s*(?:%|percent|million|billion|thousand|hundred|hours?|years?|months?|weeks?|days?|times?|x))\b/i;

export const defaultRequiredComponentPatterns: Readonly<Record<string, RegExp>> = {
  AuthorByline: /AuthorByline|authorByline|author:\s*['"]?[A-Z]/,
  DataSourceCitation: /DataSourceCitation|dataSourceCitation|source:\s*['"]/,
  ContentFreshness: /ContentFreshness|lastUpdated|dateModified|lastReviewed/,
};

export const defaultRules: LintRules = {
  bannedPhrases: defaultBannedPhrases,
  aiSlopPatterns: defaultAiSlopPatterns,
  dollarPattern: defaultDollarPattern,
  inlineCitationPattern: defaultInlineCitationPattern,
  statisticPattern: defaultStatisticPattern,
  requiredComponentPatterns: defaultRequiredComponentPatterns,
  citationWindowChars: 200,
  citationLookbackChars: 20,
  articlePathSegment: "/articles/",
};

/**
 * Compose tenant-specific rules from defaults + tenantConfig.brand.
 *
 * - tenant.brand.bannedPhrases EXTENDS the defaults (case-insensitive literal).
 * - tenant.brand.distinctiveAssets MAY surface as required-presence checks
 *   in a future rule (DBA prevalence). Phase 1 only adds banned phrases.
 */
export function buildRulesFromTenantConfig(tenant: Pick<TenantConfig, "brand">): LintRules {
  const tenantBanned = tenant.brand.bannedPhrases.map(
    (phrase) => new RegExp(`\\b${escapeRegex(phrase)}\\b`, "i"),
  );
  return {
    ...defaultRules,
    bannedPhrases: [...defaultBannedPhrases, ...tenantBanned],
  };
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
