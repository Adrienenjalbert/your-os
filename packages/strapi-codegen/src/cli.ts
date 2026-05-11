#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { codegenFromContentTypes } from "./from-template.js";

function arg(name: string, fallback?: string): string | undefined {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  if (a) return a.slice(`--${name}=`.length);
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return fallback;
}

const out = arg("out", "src/generated/strapi.ts")!;
const tenant = arg("tenant");

const code = codegenFromContentTypes({ tenantSlug: tenant });
const target = resolve(process.cwd(), out);
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, code, "utf8");
console.log(`[your-os/strapi-codegen] wrote ${target}`);
