export type Severity = "block" | "warn";

export interface LintIssue {
  severity: Severity;
  rule: string;
  line: number;
  text: string;
  fix: string;
}

export interface LintRules {
  bannedPhrases: readonly RegExp[];
  aiSlopPatterns: readonly RegExp[];
  dollarPattern: RegExp;
  inlineCitationPattern: RegExp;
  statisticPattern: RegExp;
  requiredComponentPatterns: Readonly<Record<string, RegExp>>;
  /** chars to look forward from a $ amount when searching for an inline citation */
  citationWindowChars: number;
  /** chars to include before a $ amount in the citation-search window */
  citationLookbackChars: number;
  /** path segment that triggers required-component WARN issues */
  articlePathSegment: string;
}

/**
 * Pure file linter. Identical algorithm to Career Hub's
 * nextjs-app/scripts/agents/brand-lint.mjs (lintFile function), refactored to
 * accept rules as input.
 *
 * Returns a flat list of issues. Caller decides how to render/aggregate.
 */
export function lintFile(content: string, relPath: string, rules: LintRules): LintIssue[] {
  const issues: LintIssue[] = [];
  const lines = content.split("\n");

  for (const pattern of rules.bannedPhrases) {
    lines.forEach((line, i) => {
      if (pattern.test(line)) {
        issues.push({
          severity: "block",
          rule: "banned_phrase",
          line: i + 1,
          text: line.trim().slice(0, 120),
          fix: `Remove banned phrase matching ${pattern}`,
        });
      }
    });
  }

  for (const pattern of rules.aiSlopPatterns) {
    lines.forEach((line, i) => {
      if (pattern.test(line)) {
        issues.push({
          severity: "block",
          rule: "ai_slop",
          line: i + 1,
          text: line.trim().slice(0, 120),
          fix: `Rewrite to avoid AI-slop pattern ${pattern}`,
        });
      }
    });
  }

  // Citation density: per Aggarwal et al. (Princeton GEO KDD 2024), citations
  // are the highest-impact GEO signal. For every dollar amount, an inline
  // citation must exist within citationWindowChars of the match.
  // INLINE_CITATION uses /g flag so we must reset lastIndex per check.
  const dollarLines: Array<{ line: number; dollar: string; text: string }> = [];
  lines.forEach((line, i) => {
    const dollars = line.match(rules.dollarPattern) || [];
    let cursor = 0;
    for (const dollar of dollars) {
      const idx = line.indexOf(dollar, cursor);
      cursor = idx + dollar.length;
      const window = line.slice(
        Math.max(0, idx - rules.citationLookbackChars),
        idx + rules.citationWindowChars,
      );
      rules.inlineCitationPattern.lastIndex = 0;
      if (!rules.inlineCitationPattern.test(window)) {
        dollarLines.push({ line: i + 1, dollar, text: line.trim().slice(0, 120) });
      }
    }
  });
  for (const item of dollarLines) {
    issues.push({
      severity: "block",
      rule: "missing_citation",
      line: item.line,
      text: `${item.dollar} → ${item.text}`,
      fix: "Add inline citation (Source Year) after the dollar amount",
    });
  }

  // Mandatory-component check (informational on .ts data files for articles).
  const componentChecks: string[] = [];
  for (const [name, pattern] of Object.entries(rules.requiredComponentPatterns)) {
    if (!pattern.test(content)) {
      componentChecks.push(name);
    }
  }
  if (componentChecks.length > 0 && relPath.includes(rules.articlePathSegment)) {
    issues.push({
      severity: "warn",
      rule: "missing_component_signal",
      line: 1,
      text: `File doesn't reference: ${componentChecks.join(", ")}`,
      fix: "Confirm the page rendering wires these components (DBA enforcement)",
    });
  }

  return issues;
}
