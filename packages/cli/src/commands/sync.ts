import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { renderAgentsMd, renderCursorRules } from "@your-os/agent-context";
import type { TenantConfig } from "@your-os/tenant-config";

export interface SyncTenantOptions {
  tenant: TenantConfig;
  outDir: string;
  dryRun?: boolean;
}

export interface SyncTenantResult {
  files: Array<{ path: string; contents: string }>;
}

/**
 * Re-generates derived files (AGENTS.md, .cursor/rules/*) from the current
 * tenant config. Run on every tenant.config.ts change.
 */
export async function syncTenant(opts: SyncTenantOptions): Promise<SyncTenantResult> {
  const files: Array<{ path: string; contents: string }> = [];

  files.push({
    path: "AGENTS.md",
    contents: renderAgentsMd({ tenant: opts.tenant }),
  });
  for (const rule of renderCursorRules({ tenant: opts.tenant })) {
    files.push(rule);
  }

  if (!opts.dryRun) {
    for (const file of files) {
      const full = join(opts.outDir, file.path);
      await mkdir(join(full, ".."), { recursive: true });
      await writeFile(full, file.contents, "utf-8");
    }
  }

  return { files };
}
