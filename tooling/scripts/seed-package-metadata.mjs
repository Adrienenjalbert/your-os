#!/usr/bin/env node
import { existsSync } from "node:fs";
/**
 * One-time seeder for `yourOs.{layer,stability}` metadata on every public
 * package.json. Idempotent: only writes when the field is missing or
 * different. Used to bootstrap the data-driven README tables.
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Layer + stability assignment, hand-curated once. After this seeder runs,
// each package.json owns its own metadata; this file is the historical record.
const ASSIGNMENTS = {
  // Core (Layer 1)
  "@your-os/tenant-config": { layer: "core", stability: "beta" },
  "@your-os/content-source": { layer: "core", stability: "beta" },
  "@your-os/content-types": { layer: "core", stability: "beta" },
  "@your-os/seo": { layer: "core", stability: "beta" },
  "@your-os/brand-lint": { layer: "core", stability: "stable" },
  "@your-os/core": { layer: "core", stability: "alpha" },
  "@your-os/pseo-engine": { layer: "core", stability: "alpha" },
  "@your-os/tools-engine": { layer: "core", stability: "alpha" },
  "@your-os/analytics": { layer: "core", stability: "alpha" },
  "@your-os/skills": { layer: "core", stability: "beta" },
  "@your-os/agent-context": { layer: "core", stability: "beta" },
  "@your-os/cli": { layer: "core", stability: "beta" },
  // Strapi track
  "@your-os/strapi-template": { layer: "strapi", stability: "beta" },
  "@your-os/strapi-deploy": { layer: "strapi", stability: "beta" },
  "@your-os/strapi-sync": { layer: "strapi", stability: "beta" },
  "@your-os/strapi-seo": { layer: "strapi", stability: "beta" },
  "@your-os/strapi-codegen": { layer: "strapi", stability: "beta" },
  "@your-os/strapi-brand-lint-hook": { layer: "strapi", stability: "alpha" },
  "@your-os/migrate-to-strapi": { layer: "strapi", stability: "alpha" },
  // Tooling configs
  "@your-os/typescript-config": { layer: "tooling", stability: "stable" },
  "@your-os/eslint-config": { layer: "tooling", stability: "stable" },
  "@your-os/tailwind-config": { layer: "tooling", stability: "stable" },
};

let written = 0;
const packagesDir = join(ROOT, "packages");
for (const dir of await readdir(packagesDir, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const pkgPath = join(packagesDir, dir.name, "package.json");
  if (!existsSync(pkgPath)) continue;
  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  const assignment = ASSIGNMENTS[pkg.name];
  if (!assignment) {
    console.warn(`[seed] no assignment for ${pkg.name} (skipping)`);
    continue;
  }
  const existing = pkg.yourOs ?? {};
  if (existing.layer === assignment.layer && existing.stability === assignment.stability) continue;
  pkg.yourOs = { ...existing, ...assignment };
  await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
  console.log(`[seed] ${pkg.name} → layer=${assignment.layer} stability=${assignment.stability}`);
  written += 1;
}
console.log(`[seed] wrote ${written} package.json files`);
