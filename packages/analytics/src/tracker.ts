import type { TenantConfig } from "@your-os/tenant-config";

export type AttributionParams = Partial<Record<string, string>>;

export interface AnalyticsTransport {
  /** Identifier for tests + diagnostics. */
  name: string;
  track(event: string, props: Record<string, unknown>): void | Promise<void>;
}

export interface Analytics {
  trackConversion(props?: Record<string, unknown>): Promise<void>;
  trackEvent(event: string, props?: Record<string, unknown>): Promise<void>;
}

export function createAnalytics(opts: {
  tenant: Pick<TenantConfig, "conversion" | "identity">;
  transports: AnalyticsTransport[];
  /** Optional attribution to mix into every event. */
  attribution?: AttributionParams;
}): Analytics {
  const { tenant, transports, attribution = {} } = opts;
  const baseProps: Record<string, unknown> = {
    tenant_slug: tenant.identity.slug,
    ...attribution,
  };

  async function dispatch(event: string, props: Record<string, unknown>): Promise<void> {
    const merged = { ...baseProps, ...props };
    await Promise.all(transports.map((t) => Promise.resolve(t.track(event, merged))));
  }

  return {
    async trackConversion(props = {}) {
      await dispatch(tenant.conversion.eventName, {
        conversion_type: tenant.conversion.primary,
        ...props,
      });
    },
    async trackEvent(event, props = {}) {
      await dispatch(event, props);
    },
  };
}
