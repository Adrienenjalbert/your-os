import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

/**
 * v1.1 telemetry sink. Emits the 11 events the v1.1 Web Shell instruments
 * (configurator + console + customise surfaces) so journeys can be replayed
 * and graded by `pnpm web:loop`.
 *
 * Sink is JSONL on disk (no PostHog dep). The file path is configurable via
 * YOUR_OS_TELEMETRY_PATH; default is local.
 */
export type TelemetryEventName =
  | "configurator.step.entered"
  | "configurator.step.advanced"
  | "configurator.step.blocked"
  | "configurator.research.completed"
  | "configurator.gate.decision"
  | "console.keyboard.action"
  | "console.brief.approved"
  | "console.brief.rejected"
  | "brand_lint.violation"
  | "brand_lint.override"
  | "forecast.computed"
  | "customise.commit"
  | "design_partner.likert";

export interface TelemetryEvent {
  name: TelemetryEventName;
  ts: string;
  payload: Record<string, unknown>;
}

const events: TelemetryEvent[] = [];

function getSinkPath(): string {
  return resolve(process.cwd(), process.env.YOUR_OS_TELEMETRY_PATH ?? ".your-os/telemetry.jsonl");
}

export async function recordEvent(
  name: TelemetryEventName,
  payload: Record<string, unknown>,
): Promise<TelemetryEvent> {
  const event: TelemetryEvent = { name, ts: new Date().toISOString(), payload };
  events.push(event);
  if (process.env.YOUR_OS_TELEMETRY_DISABLE !== "1") {
    const path = getSinkPath();
    await mkdir(dirname(path), { recursive: true });
    await appendFile(path, `${JSON.stringify(event)}\n`, "utf8");
  }
  return event;
}

/** Test-only: snapshot the in-memory event ring. */
export function listEvents(): readonly TelemetryEvent[] {
  return events;
}

export function clearEvents(): void {
  events.length = 0;
}
