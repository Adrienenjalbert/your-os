import { rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Wipes any tenant-config or telemetry residue from a previous test run so
 * each suite invocation starts from the seeded baseline. Without this the
 * Customise commit test would see "no diff" when re-run locally.
 */
export default async function globalSetup() {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = resolve(here, "..", "..");
  const paths = [
    resolve(root, ".your-os/test-tenant-config.json"),
    resolve(root, ".your-os/telemetry.jsonl"),
  ];
  for (const p of paths) {
    await rm(p, { force: true });
  }
}
