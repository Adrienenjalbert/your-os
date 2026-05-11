import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const dist = resolve(process.cwd(), "dist");
mkdirSync(dist, { recursive: true });
writeFileSync(
  resolve(dist, "index.html"),
  "<!doctype html><meta charset=utf-8><title>employer-hub</title>placeholder",
  "utf8",
);
console.log("[employer-hub] wrote", resolve(dist, "index.html"));
