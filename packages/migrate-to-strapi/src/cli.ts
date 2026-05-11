#!/usr/bin/env node
/**
 * `your-os-migrate-to-strapi` — opt-in CLI. Refuses to run unless the operator
 * passes `--i-confirm-this-is-not-career-hub` to defeat accidental invocation.
 */
function flag(name: string): string | undefined {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  if (a) return a.slice(`--${name}=`.length);
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return undefined;
}

function present(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

const required = ["source", "endpoint", "token"];
for (const r of required) {
  if (!flag(r)) {
    console.error(`[migrate-to-strapi] missing --${r}`);
    process.exit(2);
  }
}

if (!present("i-confirm-this-is-not-career-hub")) {
  console.error(
    "[migrate-to-strapi] refusing to run without --i-confirm-this-is-not-career-hub. " +
      "This codemod is opt-in only; Career Hub stays code-mode.",
  );
  process.exit(2);
}

console.log("[migrate-to-strapi] CLI is a thin wrapper. Programmatic usage:");
console.log("  import { migrateEntries } from '@your-os/migrate-to-strapi';");
console.log("  await migrateEntries({ source, endpoint, apiToken, mapEntry });");
