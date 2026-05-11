#!/usr/bin/env node
import { existsSync } from "node:fs";
/**
 * The README's robustness contract.
 *
 *   1. Auto-generates the package tables from `packages/* /package.json`
 *      `description` + `yourOs.{layer,stability}` between
 *      `<!-- BEGIN:packages-{layer} -->` ... `<!-- END:packages-{layer} -->`
 *      markers (layers: core, strapi, tooling).
 *   2. Verifies every `@your-os/*` reference in README still exists on disk
 *      and every public package on disk is listed.
 *   3. Cross-checks "Phase X done" rows against `.changeset/*.md` entries
 *      (only for package-bearing phases: 1, 2, 2B, 7).
 *
 * Run modes:
 *   - `node check-readme.mjs`           → check + fail on drift (CI mode)
 *   - `node check-readme.mjs --write`   → regenerate tables in-place (local)
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WRITE = process.argv.includes("--write");
const README_PATH = join(ROOT, "README.md");

// ─── 1. Discover packages ────────────────────────────────────────────────────
const packagesDir = join(ROOT, "packages");
/** @type {Map<string, {dir:string, private:boolean, description:string, layer?:string, stability?:string}>} */
const onDisk = new Map();
for (const dir of await readdir(packagesDir, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const pkgPath = join(packagesDir, dir.name, "package.json");
  if (!existsSync(pkgPath)) continue;
  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  onDisk.set(pkg.name, {
    dir: dir.name,
    private: !!pkg.private,
    description: pkg.description ?? "",
    layer: pkg.yourOs?.layer,
    stability: pkg.yourOs?.stability,
  });
}

// ─── 2. Build tables per layer ───────────────────────────────────────────────
const LAYERS = ["core", "strapi", "tooling"];
/** @type {Record<string, string>} */
const tables = {};
const orphans = [];
for (const layer of LAYERS) {
  // We render ALL packages (even private) — `private: true` is a publish
  // gate for the npm scope, not a contract gate. The README is the user-
  // facing API surface.
  const rows = [...onDisk.entries()]
    .filter(([, m]) => m.layer === layer)
    .sort(([a], [b]) => a.localeCompare(b));
  const lines = [
    "| Package | Stability | Purpose |",
    "| --- | --- | --- |",
    ...rows.map(([name, m]) => {
      if (!m.description) orphans.push(`${name}: missing description`);
      if (!m.stability) orphans.push(`${name}: missing yourOs.stability`);
      return `| \`${name}\` | ${m.stability ?? "?"} | ${m.description || "—"} |`;
    }),
  ];
  tables[layer] = lines.join("\n");
}
for (const [name, m] of onDisk) {
  if (m.private) continue;
  if (!m.layer) orphans.push(`${name}: missing yourOs.layer (set to one of: ${LAYERS.join(", ")})`);
}

// ─── 3. Inject between markers ───────────────────────────────────────────────
let readme = await readFile(README_PATH, "utf8");
const original = readme;
for (const layer of LAYERS) {
  const re = new RegExp(
    `(<!-- BEGIN:packages-${layer} -->)[\\s\\S]*?(<!-- END:packages-${layer} -->)`,
  );
  if (!re.test(readme)) {
    orphans.push(
      `README missing markers for layer "${layer}" (expected <!-- BEGIN:packages-${layer} --> ... <!-- END:packages-${layer} -->)`,
    );
    continue;
  }
  readme = readme.replace(re, `$1\n${tables[layer]}\n$2`);
}

if (readme !== original) {
  if (WRITE) {
    await writeFile(README_PATH, readme, "utf8");
    console.log("README package tables regenerated.");
  } else {
    console.error("README package tables are stale. Run: pnpm run check:readme --write");
    process.exit(1);
  }
}

// ─── 4. Drift detection (mirror coverage) ────────────────────────────────────
// Also collect known app + example workspace names so README references to
// `@your-os/web`, `@your-os/console`, etc. don't false-positive.
const onDiskAppNames = new Set();
for (const subdir of ["apps", "examples"]) {
  const root = join(ROOT, subdir);
  if (!existsSync(root)) continue;
  for (const dir of await readdir(root, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const pkgPath = join(root, dir.name, "package.json");
    if (!existsSync(pkgPath)) continue;
    const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
    if (pkg.name) onDiskAppNames.add(pkg.name);
  }
}
const referenced = new Set(
  [...readme.matchAll(/`@your-os\/[a-z0-9-]+`/g)].map((m) => m[0].slice(1, -1)),
);
const missingFromDisk = [];
const missingFromReadme = [];
for (const ref of referenced) {
  if (!onDisk.has(ref) && !onDiskAppNames.has(ref)) missingFromDisk.push(ref);
}
for (const [name] of onDisk) {
  if (!referenced.has(name)) missingFromReadme.push(name);
}

// ─── 5. Phase ↔ changeset cross-check ────────────────────────────────────────
const changesetDir = join(ROOT, ".changeset");
const changesetFiles = (await readdir(changesetDir)).filter(
  (f) => f.endsWith(".md") && f !== "README.md",
);
const PACKAGE_PHASES = new Set(["1", "2", "2B", "7"]);
const phaseRows = [...readme.matchAll(/^\|\s*(\d+|2B)\s*\|.*\|\s*done\s*\|/gm)].map((m) => m[1]);
const missingPhases = [];
for (const phase of phaseRows) {
  if (!PACKAGE_PHASES.has(phase)) continue;
  const want = phase === "2B" ? "phase-2b" : `phase-${phase.toLowerCase()}`;
  if (!changesetFiles.some((f) => f.toLowerCase().includes(want))) missingPhases.push(phase);
}

// ─── 6. Report ───────────────────────────────────────────────────────────────
const problems = [];
if (orphans.length) problems.push(`Package metadata problems:\n  - ${orphans.join("\n  - ")}`);
if (missingFromDisk.length)
  problems.push(
    `README references packages that do not exist:\n  - ${missingFromDisk.join("\n  - ")}`,
  );
if (missingFromReadme.length)
  problems.push(
    `packages/ contains public packages missing from README:\n  - ${missingFromReadme.join("\n  - ")}`,
  );
if (missingPhases.length)
  problems.push(
    `README shows phase(s) "done" but no matching .changeset/ entry:\n  - phase ${missingPhases.join(", ")}`,
  );

if (problems.length) {
  console.error("README drift detected:\n");
  for (const p of problems) console.error(p, "\n");
  process.exit(1);
}

console.log(
  `README OK · ${onDisk.size} packages on disk · ${referenced.size} referenced · ${changesetFiles.length} changesets.`,
);
