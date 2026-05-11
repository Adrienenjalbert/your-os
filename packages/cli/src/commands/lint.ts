import { buildRulesFromTenantConfig, runCli } from "@your-os/brand-lint";
import type { TenantConfig } from "@your-os/tenant-config";

export interface LintTenantOptions {
  tenant: TenantConfig;
  cwd: string;
  staged?: boolean;
  all?: boolean;
  files?: string[];
  budget?: number | null;
  breakdown?: boolean;
}

/**
 * Wraps @your-os/brand-lint with tenant-aware rules (extends defaults with
 * tenant.brand.bannedPhrases).
 */
export async function lintTenant(opts: LintTenantOptions) {
  const rules = buildRulesFromTenantConfig(opts.tenant);
  return runCli({
    cwd: opts.cwd,
    staged: opts.staged,
    all: opts.all,
    files: opts.files,
    budget: opts.budget,
    breakdown: opts.breakdown,
    rules,
  });
}
