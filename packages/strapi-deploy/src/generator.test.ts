import { describe, expect, it } from "vitest";
import { generateDeployFiles } from "./generator.js";

const opts = {
  tenantSlug: "employer-hub",
  hostname: "cms.employer.example.com",
};

describe("generateDeployFiles", () => {
  it("renders the common file set + render.yaml for render", () => {
    const files = generateDeployFiles("render", opts);
    const paths = files.map((f) => f.path).sort();
    expect(paths).toEqual([".env.example", "Dockerfile", "RUNBOOK.md", "render.yaml"]);
    const yaml = files.find((f) => f.path === "render.yaml")!;
    expect(yaml.contents).toContain("employer-hub-strapi");
    expect(yaml.contents).toContain("cms.employer.example.com");
  });

  it("renders railway.json with the strapi service", () => {
    const files = generateDeployFiles("railway", opts);
    const railway = files.find((f) => f.path === "railway.json")!;
    const parsed = JSON.parse(railway.contents);
    expect(parsed.service.name).toBe("employer-hub-strapi");
    expect(parsed.env.STRAPI_ADMIN_DISABLE_CONTENT_TYPE_BUILDER).toBe("true");
  });

  it("renders fly.toml with primary_region default", () => {
    const files = generateDeployFiles("fly", opts);
    const fly = files.find((f) => f.path === "fly.toml")!;
    expect(fly.contents).toContain('app = "employer-hub-strapi"');
    expect(fly.contents).toContain('primary_region = "iad"');
  });

  it("env example warns about per-tenant secrets", () => {
    const env = generateDeployFiles("render", opts).find((f) => f.path === ".env.example")!;
    expect(env.contents).toContain("APP_KEYS=");
    expect(env.contents).toContain("STRAPI_ADMIN_DISABLE_CONTENT_TYPE_BUILDER=true");
    expect(env.contents).toContain("employer-hub-strapi-media");
  });

  it("runbook references brand-lint hook + schema policy", () => {
    const runbook = generateDeployFiles("render", opts).find((f) => f.path === "RUNBOOK.md")!;
    expect(runbook.contents).toContain("brand-lint");
    expect(runbook.contents).toContain("STRAPI_ADMIN_DISABLE_CONTENT_TYPE_BUILDER=true");
    expect(runbook.contents).toContain("employer-hub");
  });
});
