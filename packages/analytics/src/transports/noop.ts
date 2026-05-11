import type { AnalyticsTransport } from "../tracker.js";

/**
 * Sink for tests + SSR. Records events on `.events` array.
 */
export function noopTransport(): AnalyticsTransport & {
  events: Array<{ event: string; props: Record<string, unknown> }>;
} {
  const events: Array<{ event: string; props: Record<string, unknown> }> = [];
  return {
    name: "noop",
    events,
    track(event, props) {
      events.push({ event, props });
    },
  };
}
