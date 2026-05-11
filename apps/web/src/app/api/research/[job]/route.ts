import { DEFAULT_MACHINE_ID, getMachine } from "@/server/machines";
import { recordEvent } from "@/server/telemetry";
import type { ResearchJobId } from "@your-os/configurator";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KNOWN_JOBS: ResearchJobId[] = [
  "serp",
  "keywordCluster",
  "proposeIcps",
  "proposeDbas",
  "proposePillars",
  "selectPrimarySchema",
  "scoreToolFit",
];

function isJobId(s: string): s is ResearchJobId {
  return (KNOWN_JOBS as string[]).includes(s);
}

/**
 * GET /api/research/:job?machineId=xxx
 *
 * Returns the cached result for a research job, awaiting it if still
 * pending. v1.1 returns a single JSON snapshot (not streamed) — the
 * provider runs the LLM call server-side and the UI re-renders ChoiceCards
 * once the promise resolves. Streaming arrives when we wire the AI SDK
 * adapter in M3.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ job: string }> }) {
  const { job } = await ctx.params;
  if (!isJobId(job)) return NextResponse.json({ error: `Unknown job: ${job}` }, { status: 400 });
  const machineId = req.nextUrl.searchParams.get("machineId") ?? DEFAULT_MACHINE_ID;
  const machine = getMachine(machineId);
  const before = Date.now();
  try {
    const result = await machine.getResearch(job);
    await recordEvent("configurator.research.completed", {
      machineId,
      jobId: job,
      durationMs: Date.now() - before,
    });
    return NextResponse.json({ job, result });
  } catch (err) {
    return NextResponse.json(
      { job, error: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }
}
