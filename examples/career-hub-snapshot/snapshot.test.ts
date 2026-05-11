import { parseTenantConfig } from "@your-os/tenant-config";
import { describe, expect, it } from "vitest";
import { careerHubConfig } from "./tenant.config.js";

describe("career-hub-snapshot", () => {
  it("Career Hub config parses cleanly through TenantConfigSchema", () => {
    const parsed = parseTenantConfig(careerHubConfig);
    expect(parsed.identity.slug).toBe("career-hub");
    expect(parsed.contentSources.articles?.mode).toBe("code");
  });

  it("Career Hub uses code-mode for every content source (no Strapi leak)", () => {
    for (const [key, spec] of Object.entries(careerHubConfig.contentSources)) {
      expect(spec.mode, `contentSources.${key} must be code-mode`).toBe("code");
    }
    // Literal type narrowing means careerHubConfig.strapi isn't on the type;
    // assert via the parsed (TenantConfig) shape instead.
    const parsed = parseTenantConfig(careerHubConfig);
    expect(parsed.strapi).toBeUndefined();
  });
});
