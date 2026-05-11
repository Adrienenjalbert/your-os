#!/usr/bin/env node
import { existsSync } from "node:fs";
/**
 * Generates a Mermaid architecture diagram from real workspace data:
 *   - Packages are grouped by `yourOs.layer` (core / strapi / tooling).
 *   - Apps/examples are grouped from their location.
 *   - Edges are real internal `@your-os/*` dependency edges from package.json.
 *
 * Output: replaces the content between
 *   <!-- BEGIN:architecture-diagram -->
 *   ```mermaid
 *   ...
 *   ```
 *   <!-- END:architecture-diagram -->
 * in README.md.
 *
 * Run modes:
 *   - node generate-architecture.mjs          → check + fail on drift
 *   - node generate-architecture.mjs --write  → regenerate in-place
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WRITE = process.argv.includes("--write");
const README_PATH = join(ROOT, "README.md");

// ─── 1. Collect every workspace package ──────────────────────────────────
async function collect(dir, kind) {
  const out = [];
  const subdir = join(ROOT, dir);
  if (!existsSync(subdir)) return out;
  for (const entry of await readdir(subdir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const pkgPath = join(subdir, entry.name, "package.json");
    if (!existsSync(pkgPath)) continue;
    const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
    out.push({
      name: pkg.name,
      kind,
      layer: pkg.yourOs?.layer,
      stability: pkg.yourOs?.stability,
      deps: Object.keys({ ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }).filter(
        (d) => d.startsWith("@your-os/"),
      ),
    });
  }
  return out;
}

const packages = [
  ...(await collect("packages", "package")),
  ...(await collect("apps", "app")),
  ...(await collect("examples", "example")),
];
const byName = new Map(packages.map((p) => [p.name, p]));

// ─── 2. Group nodes by layer/kind ────────────────────────────────────────
const groups = {
  core: { label: "Layer 1 — Core engine", nodes: [] },
  strapi: { label: "Layer 1 — Strapi track", nodes: [] },
  tooling: { label: "Tooling configs", nodes: [] },
  app: { label: "Apps (configurator / control-plane / docs / web)", nodes: [] },
  example: { label: "Tenant examples", nodes: [] },
};
for (const p of packages) {
  if (p.kind === "package") {
    const layer = p.layer ?? "core";
    if (groups[layer]) groups[layer].nodes.push(p);
    else groups.core.nodes.push(p);
  } else {
    groups[p.kind].nodes.push(p);
  }
}

// ─── 3. Render Mermaid ───────────────────────────────────────────────────
function nodeId(name) {
  return name.replace(/^@your-os\//, "").replace(/-/g, "_");
}
function nodeLabel(p) {
  const short = p.name.replace(/^@your-os\//, "");
  if (p.kind === "package" && p.stability) return `${short}<br/><i>${p.stability}</i>`;
  return short;
}

const lines = [];
lines.push("```mermaid");
lines.push(
  "%% AUTO-GENERATED — edit packages/*/package.json then run: pnpm run check:architecture --write",
);
lines.push("graph TD");
for (const [key, group] of Object.entries(groups)) {
  if (group.nodes.length === 0) continue;
  lines.push(`  subgraph ${key}["${group.label}"]`);
  for (const p of group.nodes) {
    lines.push(`    ${nodeId(p.name)}["${nodeLabel(p)}"]`);
  }
  lines.push("  end");
}

// Aggregate edges by (source layer/kind → target). To keep the diagram
// readable, we deduplicate edges between the same node pair.
const seen = new Set();
for (const p of packages) {
  for (const dep of p.deps) {
    if (!byName.has(dep)) continue;
    const key = `${p.name}->${dep}`;
    if (seen.has(key)) continue;
    seen.add(key);
    lines.push(`  ${nodeId(p.name)} --> ${nodeId(dep)}`);
  }
}

// Stability colouring (based on yourOs.stability).
lines.push("  classDef stable fill:#e3fcec,stroke:#2f855a,color:#1a202c;");
lines.push("  classDef beta fill:#fffbe6,stroke:#b7791f,color:#1a202c;");
lines.push("  classDef alpha fill:#fee2e2,stroke:#c53030,color:#1a202c;");
for (const p of packages) {
  if (p.kind !== "package" || !p.stability) continue;
  lines.push(`  class ${nodeId(p.name)} ${p.stability};`);
}
lines.push("```");
const newBlock = lines.join("\n");

// ─── 4. Inject into README ───────────────────────────────────────────────
let readme = await readFile(README_PATH, "utf8");
const original = readme;
const re = /(<!-- BEGIN:architecture-diagram -->)[\s\S]*?(<!-- END:architecture-diagram -->)/;
if (!re.test(readme)) {
  console.error(
    "README is missing the architecture-diagram markers (<!-- BEGIN:architecture-diagram --> ... <!-- END:architecture-diagram -->).",
  );
  process.exit(1);
}
readme = readme.replace(re, `$1\n${newBlock}\n$2`);

if (readme !== original) {
  if (WRITE) {
    await writeFile(README_PATH, readme, "utf8");
    console.log(
      `Architecture diagram regenerated · ${packages.length} workspace projects · ${seen.size} internal deps.`,
    );
  } else {
    console.error("Architecture diagram is stale. Run: pnpm run check:architecture --write");
    process.exit(1);
  }
} else {
  console.log(
    `Architecture OK · ${packages.length} workspace projects · ${seen.size} internal deps.`,
  );
}
