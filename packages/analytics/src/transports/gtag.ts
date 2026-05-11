import type { AnalyticsTransport } from "../tracker.js";

declare global {
  interface Window {
    gtag?: (command: "event", eventName: string, params: Record<string, unknown>) => void;
  }
}

export function gtagTransport(): AnalyticsTransport {
  return {
    name: "gtag",
    track(event, props) {
      if (typeof window === "undefined" || typeof window.gtag !== "function") return;
      window.gtag("event", event, props);
    },
  };
}
