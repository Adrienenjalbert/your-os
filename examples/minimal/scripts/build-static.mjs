#!/usr/bin/env node
/**
 * Tiny static "build" placeholder so `pnpm build` walks the workspace
 * without requiring Next.js in CI. Real Next.js setup lands in Phase 5
 * for Employer Hub; minimal stays as a unit-test target.
 */
import { mkdirSync, writeFileSync } from "node:fs";

mkdirSync("out", { recursive: true });
writeFileSync(
  "out/index.html",
  "<!doctype html><title>example-minimal: Phase 2 placeholder build</title>",
);
console.log("example-minimal: static placeholder written to out/index.html");
