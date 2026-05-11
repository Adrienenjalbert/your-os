import { execSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { findContentFiles } from "./fs.js";
import type { LintIssue, LintRules } from "./lint.js";
import { lintFile } from "./lint.js";
import { defaultRules } from "./rules.js";

export interface CliOptions {
  /** Tenant repo root. Default: process.cwd(). */
  cwd?: string;
  /** Files to lint explicitly. Wins over staged/all. */
  files?: readonly string[];
  /** Pull files from `git diff --cached`. */
  staged?: boolean;
  /** Walk `srcDir` for content data files. */
  all?: boolean;
  /** Where to walk when --all. Default: <cwd>/src/features. */
  srcDir?: string;
  /** Optional max blocking-issue count. > budget = exit 1; <= budget = exit 0. */
  budget?: number | null;
  /** Pass tenant-aware rules. Default: OS defaults. */
  rules?: LintRules;
  /** Console-like sink for output. Default: process.stdout/err console. */
  logger?: Pick<Console, "log" | "error">;
  /** Show per-rule breakdown summary. */
  breakdown?: boolean;
}

export interface CliResult {
  filesScanned: number;
  totalBlocks: number;
  totalWarns: number;
  ruleCounts: Record<string, number>;
  exitCode: 0 | 1 | 2;
  fileIssues: Array<{ file: string; issues: LintIssue[] }>;
}

/**
 * The CLI body, exposed as a pure function so tests can drive it without
 * spawning the bin. The bin (`cli.ts`) is just an arg parser around this.
 */
export async function runCli(options: CliOptions = {}): Promise<CliResult> {
  const cwd = options.cwd ?? process.cwd();
  const logger = options.logger ?? console;
  const rules = options.rules ?? defaultRules;
  const srcDir = options.srcDir ?? resolve(cwd, "src/features");

  let files: string[] = [];
  if (options.files && options.files.length > 0) {
    files = options.files.map((f) => resolve(cwd, f));
  } else if (options.staged) {
    const staged = getStagedContentFiles(cwd);
    if (staged === null) {
      logger.error("brand-lint --staged requires git");
      return emptyResult(2);
    }
    files = staged;
  } else if (options.all) {
    files = await findContentFiles(srcDir);
  } else {
    logger.error("Usage: your-os-brand-lint [--all | --staged | <file>...]");
    return emptyResult(2);
  }

  if (files.length === 0) {
    logger.log("brand-lint: no content data files to lint");
    return emptyResult(0);
  }

  logger.log(`brand-lint: scanning ${files.length} file(s)\n`);

  let totalBlocks = 0;
  let totalWarns = 0;
  const ruleCounts: Record<string, number> = {};
  const fileIssues: Array<{ file: string; issues: LintIssue[] }> = [];

  for (const file of files) {
    let content: string;
    try {
      content = await readFile(file, "utf-8");
    } catch {
      continue;
    }
    const relPath = relative(cwd, file);
    const issues = lintFile(content, relPath, rules);
    const blocks = issues.filter((i) => i.severity === "block").length;
    const warns = issues.filter((i) => i.severity === "warn").length;
    totalBlocks += blocks;
    totalWarns += warns;
    for (const issue of issues) {
      ruleCounts[issue.rule] = (ruleCounts[issue.rule] ?? 0) + 1;
    }
    if (issues.length === 0) continue;
    fileIssues.push({ file: relPath, issues });

    logger.log(relPath);
    for (const issue of issues.filter((i) => i.severity === "block")) {
      logger.log(`  ✗ [${issue.rule}] line ${issue.line}: ${issue.text}\n    fix: ${issue.fix}`);
    }
    for (const issue of issues.filter((i) => i.severity === "warn")) {
      logger.log(`  ! [${issue.rule}] line ${issue.line}: ${issue.text}\n    fix: ${issue.fix}`);
    }
    logger.log("");
  }

  logger.log("---");
  logger.log(`Files scanned: ${files.length}`);
  logger.log(
    `Files with blocks: ${fileIssues.filter((f) => f.issues.some((i) => i.severity === "block")).length}`,
  );
  logger.log(
    `Files with warns:  ${fileIssues.filter((f) => f.issues.some((i) => i.severity === "warn")).length}`,
  );
  logger.log(`Total blocking issues: ${totalBlocks}`);
  logger.log(`Total warnings:        ${totalWarns}`);

  if (options.breakdown && Object.keys(ruleCounts).length > 0) {
    logger.log("\nPer-rule breakdown:");
    const sorted = Object.entries(ruleCounts).sort((a, b) => b[1] - a[1]);
    for (const [rule, count] of sorted) {
      logger.log(`  ${rule.padEnd(28)} ${count}`);
    }
  }

  let exitCode: 0 | 1 | 2 = 0;
  if (options.budget !== undefined && options.budget !== null) {
    if (totalBlocks > options.budget) {
      logger.error(
        `\nbrand-lint --budget ${options.budget}: ${totalBlocks} blocking issues exceeds budget by ${
          totalBlocks - options.budget
        }. Either fix issues or raise the budget intentionally.`,
      );
      exitCode = 1;
    } else if (totalBlocks < options.budget) {
      logger.log(
        `\nbrand-lint --budget ${options.budget}: ${totalBlocks} blocking issues (${
          options.budget - totalBlocks
        } under budget). Consider lowering the budget to lock in the win.`,
      );
    } else {
      logger.log(
        `\nbrand-lint --budget ${options.budget}: at budget (${totalBlocks}/${options.budget}).`,
      );
    }
  } else {
    exitCode = totalBlocks > 0 ? 1 : 0;
  }

  return {
    filesScanned: files.length,
    totalBlocks,
    totalWarns,
    ruleCounts,
    exitCode,
    fileIssues,
  };
}

function getStagedContentFiles(cwd: string): string[] | null {
  try {
    const out = execSync("git diff --cached --name-only --diff-filter=ACM", {
      encoding: "utf-8",
      cwd,
    });
    return out
      .split("\n")
      .filter(Boolean)
      .filter((f) => f.includes("/data/") && f.endsWith(".ts"))
      .map((f) => resolve(cwd, f));
  } catch {
    return null;
  }
}

function emptyResult(exitCode: 0 | 1 | 2): CliResult {
  return {
    filesScanned: 0,
    totalBlocks: 0,
    totalWarns: 0,
    ruleCounts: {},
    exitCode,
    fileIssues: [],
  };
}
