import type { AnalyticsTransport } from "../tracker.js";

interface PostHogLike {
  capture(event: string, props: Record<string, unknown>): void;
}

declare global {
  interface Window {
    posthog?: PostHogLike;
  }
}

export function posthogTransport(client?: PostHogLike): AnalyticsTransport {
  return {
    name: "posthog",
    track(event, props) {
      const c = client ?? (typeof window !== "undefined" ? window.posthog : undefined);
      if (!c) return;
      c.capture(event, props);
    },
  };
}
