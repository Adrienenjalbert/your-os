/**
 * @your-os/analytics
 *
 * Tenant-agnostic analytics + attribution helpers. Conversion event name
 * comes from `tenantConfig.conversion.eventName`. Provider transports
 * (GA4 / PostHog / Segment) live behind a small dispatcher so the same
 * `trackConversion()` call works for any tenant.
 */
export {
  createAnalytics,
  type Analytics,
  type AnalyticsTransport,
  type AttributionParams,
} from "./tracker.js";
export { gtagTransport } from "./transports/gtag.js";
export { posthogTransport } from "./transports/posthog.js";
export { noopTransport } from "./transports/noop.js";
export { extractAttribution } from "./attribution.js";
