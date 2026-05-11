import "server-only";
import { type TenantConfig, parseTenantConfig } from "@your-os/tenant-config";
import { readTenantConfig, seedTenantConfig } from "./tenant-store";

/**
 * Loads the working tenant config for the Customise panel. Falls back to the
 * minimal seed when no file exists yet so the panel always has values to
 * render (the user is editing a hypothetical config until they commit).
 */
export async function loadCustomiseConfig(): Promise<TenantConfig> {
  const existing = await readTenantConfig();
  if (existing) return existing;
  return parseTenantConfig(seedTenantConfig());
}
