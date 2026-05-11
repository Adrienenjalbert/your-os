import { describe, expect, it } from "vitest";
import { extractAttribution } from "./attribution.js";
import { createAnalytics } from "./tracker.js";
import { noopTransport } from "./transports/noop.js";

const tenant = {
  identity: {
    name: "Test",
    slug: "test",
    domain: "test.com",
    industry: "x",
    businessModel: "b2c" as const,
  },
  conversion: {
    primary: "app_install" as const,
    ctaPattern: "Find work",
    eventName: "app_install_click",
    attributionParams: ["utm_source"],
  },
};

describe("createAnalytics", () => {
  it("dispatches conversion to all transports with tenant + attribution context", async () => {
    const sink = noopTransport();
    const analytics = createAnalytics({
      tenant,
      transports: [sink],
      attribution: { utm_source: "google" },
    });
    await analytics.trackConversion({ button_id: "hero" });
    expect(sink.events).toHaveLength(1);
    expect(sink.events[0]).toMatchObject({
      event: "app_install_click",
      props: {
        tenant_slug: "test",
        utm_source: "google",
        conversion_type: "app_install",
        button_id: "hero",
      },
    });
  });

  it("trackEvent fires arbitrary events", async () => {
    const sink = noopTransport();
    const a = createAnalytics({ tenant, transports: [sink] });
    await a.trackEvent("scroll_depth", { depth: 50 });
    expect(sink.events[0]?.event).toBe("scroll_depth");
  });
});

describe("extractAttribution", () => {
  it("pulls only the keys you ask for", () => {
    const out = extractAttribution("?utm_source=g&utm_medium=cpc&extra=x");
    expect(out).toEqual({ utm_source: "g", utm_medium: "cpc" });
  });
});
