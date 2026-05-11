import { type TelemetryEventName, listEvents, recordEvent } from "@/server/telemetry";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  name: TelemetryEventName;
  payload?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body;
  const event = await recordEvent(body.name, body.payload ?? {});
  return NextResponse.json({ event });
}

export async function GET() {
  return NextResponse.json({ events: listEvents() });
}
