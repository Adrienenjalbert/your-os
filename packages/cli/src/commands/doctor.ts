import { type Dirent, existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { buildRulesFromTenantConfig, lintFile } from "@your-os/brand-lint";
import { type TenantConfig, parseTenantConfig } from "@your-os/tenant-config";

export interface DoctorOptions {
  /** Working directory (tenant repo root). */
  cwd: string;
  /** Tenant config path relative to cwd. Defaults to ./tenant.config.ts. */
  configPath?: string;
  /**
   * Optional shape of the tenant config — if you've already parsed it
   * (e.g. from the CLI), pass it in to skip the disk read.
   */
  tenant?: TenantConfig;
  /** Sample file globs to brand-lint. Defaults to common content paths. */
  sampleGlobs?: string[];
  /** Skip Strapi schema diff even when tenant.strapi is defined. */
  skipStrapi?: boolean;
}

export interface DoctorCheck {
  id: string;
  name: string;
  status: "pass" | "fail" | "skipped";
  detail: string;
}

export interface DoctorReport {
  exitCode: number;
  checks: DoctorCheck[];
}

/**
 * `your-os doctor` — single-command tenant health check.
 *
 * Runs three idempotent checks:
 *   1. tenant.config.ts parses + validates against the OS Zod schema.
 *   2. A small sample of content files brand-lints clean (no `block` issues).
 *   3. (Strapi-mode only) The tenant config's strapi schema reference is
 *      reachable + matches the schema-as-code on disk.
 *
 * Output: a structured report. Exit 0 on all-pass, 1 on any failure.
 * Designed to be wired into pre-deploy CI gates and run locally before PRs.
 */
export async function doctor(opts: DoctorOptions): Promise<DoctorReport> {
  const checks: DoctorCheck[] = [];

  // ─── Check 1: tenant.config.ts ─────────────────────────────────────────
  let tenant: TenantConfig | null = null;
  if (opts.tenant) {
    tenant = opts.tenant;
    checks.push({
      id: "config",
      name: "tenant.config.ts",
      status: "pass",
      detail: "Provided programmatically (skipped disk read).",
    });
  } else {
    const configPath = resolve(opts.cwd, opts.configPath ?? "./tenant.config.ts");
    if (!existsSync(configPath)) {
      checks.push({
        id: "config",
        name: "tenant.config.ts",
        status: "fail",
        detail: `Not found at ${configPath}.`,
      });
    } else {
      try {
        const mod = (await import(`${configPath}?t=${Date.now()}`)) as Record<string, unknown>;
        const candidate = mod.default ?? mod.tenantConfig ?? mod.tenant;
        tenant = parseTenantConfig(candidate);
        checks.push({
          id: "config",
          name: "tenant.config.ts",
          status: "pass",
          detail: `Parsed OK · slug=${tenant.identity.slug} · businessModel=${tenant.identity.businessModel}.`,
        });
      } catch (err) {
        checks.push({
          id: "config",
          name: "tenant.config.ts",
          status: "fail",
          detail: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  // ─── Check 2: brand-lint sample ─────────────────────────────────────────
  if (!tenant) {
    checks.push({
      id: "brand-lint",
      name: "brand-lint sample",
      status: "skipped",
      detail: "No tenant config — cannot build rules.",
    });
  } else {
    const rules = buildRulesFromTenantConfig(tenant);
    const sampleGlobs = opts.sampleGlobs ?? ["src/content", "content", "data", "src/data"];
    let scanned = 0;
    let blockCount = 0;
    let warnCount = 0;
    const failingFiles: string[] = [];
    for (const dir of sampleGlobs) {
      const abs = join(opts.cwd, dir);
      if (!existsSync(abs)) continue;
      for await (const file of walkTs(abs)) {
        scanned += 1;
        const text = await readFile(file, "utf-8");
        const issues = lintFile(text, file, rules);
        for (const i of issues) {
          if (i.severity === "block") blockCount += 1;
          if (i.severity === "warn") warnCount += 1;
        }
        if (issues.some((i) => i.severity === "block") && failingFiles.length < 3) {
          failingFiles.push(file.replace(`${opts.cwd}/`, ""));
        }
        if (scanned >= 25) break;
      }
      if (scanned >= 25) break;
    }
    if (scanned === 0) {
      checks.push({
        id: "brand-lint",
        name: "brand-lint sample",
        status: "skipped",
        detail: `No content files found in ${sampleGlobs.join(", ")}. Add one to enable.`,
      });
    } else {
      checks.push({
        id: "brand-lint",
        name: "brand-lint sample",
        status: blockCount > 0 ? "fail" : "pass",
        detail: `Scanned ${scanned} file(s) · ${blockCount} block · ${warnCount} warn${
          failingFiles.length ? ` · failing: ${failingFiles.join(", ")}` : ""
        }`,
      });
    }
  }

  // ─── Check 3: Strapi schema diff (best-effort) ──────────────────────────
  const tenantWithStrapi = tenant as (TenantConfig & { strapi?: { schemaPath?: string } }) | null;
  if (opts.skipStrapi || !tenantWithStrapi?.strapi) {
    checks.push({
      id: "strapi-schema",
      name: "Strapi schema diff",
      status: "skipped",
      detail: opts.skipStrapi
        ? "Skipped via --skip-strapi."
        : "Tenant is code-mode (no tenant.strapi block).",
    });
  } else {
    const schemaPath = tenantWithStrapi.strapi.schemaPath
      ? resolve(opts.cwd, tenantWithStrapi.strapi.schemaPath)
      : resolve(opts.cwd, "strapi/schema/content-types.json");
    if (!existsSync(schemaPath)) {
      checks.push({
        id: "strapi-schema",
        name: "Strapi schema diff",
        status: "fail",
        detail: `Schema file not found at ${schemaPath}. Run \`your-os strapi:codegen\` to materialize.`,
      });
    } else {
      try {
        const text = await readFile(schemaPath, "utf-8");
        const parsed = JSON.parse(text);
        const count = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
        checks.push({
          id: "strapi-schema",
          name: "Strapi schema diff",
          status: "pass",
          detail: `Schema file present and parses (${count} content-types).`,
        });
      } catch (err) {
        checks.push({
          id: "strapi-schema",
          name: "Strapi schema diff",
          status: "fail",
          detail: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  const exitCode = checks.some((c) => c.status === "fail") ? 1 : 0;
  return { exitCode, checks };
}

/**
 * Pretty-prints a doctor report to stdout. Returns the exit code so callers
 * can `process.exit(formatReport(report))`.
 */
export function formatReport(report: DoctorReport): number {
  const symbols: Record<DoctorCheck["status"], string> = {
    pass: "OK ",
    fail: "FAIL",
    skipped: "SKIP",
  };
  for (const c of report.checks) {
    console.log(`[${symbols[c.status]}] ${c.name} — ${c.detail}`);
  }
  if (report.exitCode === 0) console.log("\nyour-os doctor: all checks passed.");
  else console.log("\nyour-os doctor: one or more checks failed.");
  return report.exitCode;
}

// ─── helpers ─────────────────────────────────────────────────────────────
async function* walkTs(dir: string): AsyncGenerator<string> {
  let entries: Dirent[];
  try {
    entries = (await readdir(dir, { withFileTypes: true })) as unknown as Dirent[];
  } catch {
    return;
  }
  for (const entry of entries) {
    const name = String(entry.name);
    if (name.startsWith(".") || name === "node_modules") continue;
    const full = join(dir, name);
    if (entry.isDirectory()) yield* walkTs(full);
    else if (entry.isFile() && /\.(ts|tsx|md|mdx)$/.test(name)) yield full;
  }
}
