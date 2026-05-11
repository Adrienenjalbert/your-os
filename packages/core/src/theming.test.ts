import { describe, expect, it } from "vitest";
import { tenantBrandingFromConfig } from "./theming.js";

describe("tenantBrandingFromConfig", () => {
  it("derives organization + CTA from tenant identity + conversion", () => {
    const branding = tenantBrandingFromConfig(
      {
        identity: { name: "Career Hub", domain: "indeedflex.com" } as never,
        conversion: { ctaPattern: "Find Shifts" } as never,
      },
      "/download",
    );
    expect(branding).toEqual({
      organizationName: "Career Hub",
      domain: "indeedflex.com",
      primaryCta: { label: "Find Shifts", href: "/download" },
    });
  });
});
