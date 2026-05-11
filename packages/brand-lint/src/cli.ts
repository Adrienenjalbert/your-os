#!/usr/bin/env node
/**
 * your-os-brand-lint
 *
 * Drop-in replacement for Career Hub's `pnpm brand:lint`.
 *
 *   your-os-brand-lint [--all | --staged | <file>...] [--budget N] [--breakdown]
 *
 * See @your-os/brand-lint package README.
 */
import { runCli } from "./run.js";

function parseBudget(args: string[]): number | null {
  const inline = args.find((a) => a.startsWith("--budget="));
  if (inline) {
    const n = Number(inline.slice("--budget=".length));
    return Number.isFinite(n) && n >= 0 ? n : null;
  }
  const idx = args.indexOf("--budget");
  if (idx >= 0 && args[idx + 1]) {
    const n = Number(args[idx + 1]);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }
  return null;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const staged = args.includes("--staged");
  const all = args.includes("--all");
  const breakdown = args.includes("--breakdown") || args.includes("--summary");
  const budget = parseBudget(args);
  const files = args.filter(
    (a) => !a.startsWith("--") && !(a.match(/^\d+$/) && args[args.indexOf(a) - 1] === "--budget"),
  );

  const result = await runCli({
    files,
    staged,
    all,
    breakdown,
    budget,
  });
  process.exit(result.exitCode);
}

main().catch((err) => {
  console.error("brand-lint error:", err);
  process.exit(2);
});
