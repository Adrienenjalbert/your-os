import { recordEvent } from "@/server/telemetry";
import {
  diffTenantConfig,
  readTenantConfig,
  seedTenantConfig,
  writePath,
  writeTenantConfig,
} from "@/server/tenant-store";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const current = await readTenantConfig();
  return NextResponse.json({ current });
}

interface PatchBody {
  patches: Array<{ path: string; value: unknown }>;
  /** When true, persist to disk; otherwise return a dry-run diff only. */
  commit?: boolean;
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json()) as PatchBody;
  const current = (await readTenantConfig()) ?? null;
  const baseInput = current ?? seedTenantConfig();
  let next = JSON.parse(JSON.stringify(baseInput)) as Record<string, unknown>;
  for (const p of body.patches ?? []) {
    next = writePath(next, p.path, p.value);
  }
  if (body.commit) {
    const validated = await writeTenantConfig(next as Parameters<typeof writeTenantConfig>[0]);
    const diff = diffTenantConfig(current, validated);
    await recordEvent("customise.commit", { changedPaths: diff.map((d) => d.path) });
    return NextResponse.json({ committed: true, validated, diff });
  }
  // Dry-run: validate the proposed shape but don't persist.
  try {
    const validated = (await import("@your-os/tenant-config")).parseTenantConfig(next);
    const diff = diffTenantConfig(current, validated);
    return NextResponse.json({ committed: false, validated, diff });
  } catch (err) {
    return NextResponse.json(
      { committed: false, error: err instanceof Error ? err.message : String(err) },
      { status: 400 },
    );
  }
}
