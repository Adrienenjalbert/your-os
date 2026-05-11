#!/usr/bin/env node
/**
 * `your-os` CLI dispatcher.
 *
 *   your-os init <out-dir> --config <path>
 *   your-os sync [--cwd <dir>]
 *   your-os lint [--all|--staged] [--budget N]
 *   your-os add <type> <slug> [--title "Title"] [--pillar <slug>]
 *   your-os strapi:deploy --provider render|railway|fly  (Phase 2B)
 *   your-os strapi:codegen                                (Phase 2B)
 *   your-os strapi:migrate                                (Phase 2B)
 */
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { type TenantConfig, parseTenantConfig } from "@your-os/tenant-config";
import { addPage } from "./commands/add.js";
import { doctor, formatReport } from "./commands/doctor.js";
import { initTenant } from "./commands/init.js";
import { lintTenant } from "./commands/lint.js";
import { syncTenant } from "./commands/sync.js";

async function loadTenantConfig(path: string): Promise<TenantConfig> {
  const url = pathToFileURL(resolve(process.cwd(), path)).href;
  const mod = await import(url);
  const cfg = mod.default ?? mod.tenantConfig ?? mod.tenant;
  if (!cfg) {
    throw new Error(
      `Could not find a tenant config in ${path}. Expected default export or named "tenantConfig".`,
    );
  }
  return parseTenantConfig(cfg);
}

function pickArg(args: string[], name: string): string | undefined {
  const idx = args.indexOf(name);
  if (idx >= 0 && args[idx + 1]) return args[idx + 1];
  const inline = args.find((a) => a.startsWith(`${name}=`));
  return inline?.slice(name.length + 1);
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);

  if (!command || command === "--help" || command === "-h") {
    console.log(
      [
        "your-os <command>",
        "",
        "Commands:",
        "  init <out-dir> --config <path>      Scaffold a tenant repo from a tenant.config.ts",
        "  sync [--cwd <dir>]                  Regenerate AGENTS.md + .cursor/rules from tenant.config.ts",
        "  lint [--all|--staged|<file>...]     Brand lint (alias for your-os-brand-lint)",
        "  add <type> <slug>                   Scaffold a content data file (article|guide|tool|case-study|role-guide)",
        "  doctor [--cwd <dir>]                Validate tenant.config + brand-lint sample + Strapi schema",
        "  strapi:codegen                      (Phase 2B) Generate TS types from Strapi schema",
        "  strapi:deploy --provider <p>        (Phase 2B) Provision a per-tenant Strapi instance",
        "  strapi:migrate                      (Phase 2B) Run Strapi schema migrations",
      ].join("\n"),
    );
    process.exit(0);
  }

  switch (command) {
    case "init": {
      const outDir = rest[0];
      const configPath = pickArg(rest, "--config") ?? "./tenant.config.ts";
      if (!outDir) {
        console.error("usage: your-os init <out-dir> --config <path>");
        process.exit(2);
      }
      const tenant = await loadTenantConfig(configPath);
      const result = await initTenant({ tenant, outDir: resolve(outDir) });
      console.log(`Scaffolded ${result.files.length} files into ${outDir}.`);
      break;
    }
    case "sync": {
      const cwd = pickArg(rest, "--cwd") ?? process.cwd();
      const configPath = pickArg(rest, "--config") ?? "./tenant.config.ts";
      const tenant = await loadTenantConfig(configPath);
      const result = await syncTenant({ tenant, outDir: cwd });
      console.log(`Synced ${result.files.length} files in ${cwd}.`);
      break;
    }
    case "lint": {
      const cwd = pickArg(rest, "--cwd") ?? process.cwd();
      const configPath = pickArg(rest, "--config") ?? "./tenant.config.ts";
      const tenant = await loadTenantConfig(configPath);
      const budgetStr = pickArg(rest, "--budget");
      const budget = budgetStr ? Number(budgetStr) : null;
      const result = await lintTenant({
        tenant,
        cwd,
        staged: rest.includes("--staged"),
        all: rest.includes("--all"),
        files: rest.filter((a) => !a.startsWith("--") && !["render", "railway", "fly"].includes(a)),
        budget,
        breakdown: rest.includes("--breakdown") || rest.includes("--summary"),
      });
      process.exit(result.exitCode);
      break;
    }
    case "add": {
      const type = rest[0] as "article" | "guide" | "tool" | "case-study" | "role-guide";
      const slug = rest[1];
      const title = pickArg(rest, "--title") ?? slug;
      const pillarSlug = pickArg(rest, "--pillar");
      const configPath = pickArg(rest, "--config") ?? "./tenant.config.ts";
      const cwd = pickArg(rest, "--cwd") ?? process.cwd();
      if (!type || !slug) {
        console.error("usage: your-os add <type> <slug> [--title T] [--pillar P]");
        process.exit(2);
      }
      const tenant = await loadTenantConfig(configPath);
      const out = await addPage({
        tenant,
        outDir: cwd,
        type,
        slug,
        title: title ?? slug,
        pillarSlug,
      });
      console.log(`Wrote ${out.path}.`);
      break;
    }
    case "doctor": {
      const cwd = pickArg(rest, "--cwd") ?? process.cwd();
      const configPath = pickArg(rest, "--config") ?? "./tenant.config.ts";
      const skipStrapi = rest.includes("--skip-strapi");
      const report = await doctor({ cwd, configPath, skipStrapi });
      process.exit(formatReport(report));
      break;
    }
    case "strapi:codegen":
    case "strapi:deploy":
    case "strapi:migrate": {
      console.error(
        `${command}: not yet implemented. Lands in Phase 2B (Strapi track). See @your-os/strapi-* packages.`,
      );
      process.exit(2);
      break;
    }
    default:
      console.error(`unknown command: ${command}`);
      process.exit(2);
  }
}

main().catch((err) => {
  console.error("your-os:", err instanceof Error ? err.message : err);
  process.exit(1);
});
