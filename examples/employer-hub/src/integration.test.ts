import { briefToTenantConfig, parseBrief, scaffoldTenant } from "@your-os/configurator";
import { type ContentEntity, resolveContentSource } from "@your-os/content-source";
import { generateTypes } from "@your-os/strapi-codegen";
import { generateDeployFiles } from "@your-os/strapi-deploy";
import { StrapiContentSource } from "@your-os/strapi-sync";
import { parseTenantConfig } from "@your-os/tenant-config";
import { describe, expect, it } from "vitest";
import brief from "../employer-hub.brief.json" with { type: "json" };
import tenantConfig from "../tenant.config.js";
import { submitDemoBooking } from "./hubspot.js";
import { B2B_CONTENT_TYPES, EMPLOYER_HUB_CONTENT_TYPES } from "./strapi-schema.js";

interface CaseStudyEntity extends ContentEntity {
  customer: string;
  industry: string;
  outcome: string;
}

describe("employer-hub — Phase 5 gate", () => {
  it("tenant.config.ts validates as a B2B Strapi-mode tenant", () => {
    const parsed = parseTenantConfig(tenantConfig);
    expect(parsed.identity.businessModel).toBe("b2b");
    expect(parsed.conversion.primary).toBe("demo_booking");
    expect(parsed.integrations.crm).toBe("hubspot");
    expect(parsed.strapi).toBeDefined();
    expect(parsed.contentSources["case-studies"]?.mode).toBe("strapi");
  });

  it("B2B content-types extend the OS schema with the four required collections", () => {
    const apiIds = new Set(B2B_CONTENT_TYPES.map((c) => c.apiId));
    expect(apiIds.has("roi-scenario")).toBe(true);
    expect(apiIds.has("integration-page")).toBe(true);
    expect(apiIds.has("comparison-page")).toBe(true);
    // case-study comes from the OS defaults
    const allIds = new Set(EMPLOYER_HUB_CONTENT_TYPES.map((c) => c.apiId));
    expect(allIds.has("case-study")).toBe(true);
  });

  it("strapi-codegen produces typed interfaces for all employer-hub content-types", () => {
    const code = generateTypes(EMPLOYER_HUB_CONTENT_TYPES, {
      tenantSlug: tenantConfig.identity.slug,
    });
    expect(code).toContain("export interface CaseStudy");
    expect(code).toContain("export interface RoiScenario");
    expect(code).toContain("export interface IntegrationPage");
    expect(code).toContain("export interface ComparisonPage");
  });

  it("strapi-deploy emits provider files for the configured provider", () => {
    const files = generateDeployFiles("render", {
      tenantSlug: tenantConfig.identity.slug,
      hostname: `cms.${tenantConfig.identity.domain}`,
    });
    const paths = new Set(files.map((f) => f.path));
    expect(paths.has("Dockerfile")).toBe(true);
    expect(paths.has("render.yaml")).toBe(true);
    expect(paths.has("RUNBOOK.md")).toBe(true);
  });

  it("StrapiContentSource resolves through tenant.config.contentSources for case-studies", async () => {
    const fakeFetch: typeof globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          data: [
            {
              slug: "warehouse-x",
              customer: "Warehouse X",
              industry: "warehousing",
              outcome: "+18% fill rate",
            },
          ],
        }),
        { status: 200 },
      )) as unknown as typeof globalThis.fetch;

    const source = await resolveContentSource<CaseStudyEntity>({
      spec: tenantConfig.contentSources["case-studies"]!,
      strapiSourceFactory: (collection) =>
        new StrapiContentSource<CaseStudyEntity>({
          baseUrl: tenantConfig.strapi!.baseUrl,
          collection,
          singularApiId: collection.replace(/s$/, ""),
          tenantSlug: tenantConfig.identity.slug,
          fetch: fakeFetch,
        }),
    });
    const list = await source.list();
    expect(list[0]?.customer).toBe("Warehouse X");
  });

  it("hubspot demo-booking submitter posts to the Forms API with attribution", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const fakeFetch = (async (input: unknown, init?: RequestInit) => {
      const url = typeof input === "string" ? input : String(input);
      calls.push({ url, init: init ?? {} });
      return new Response(JSON.stringify({}), { status: 200 });
    }) as unknown as typeof globalThis.fetch;

    process.env.HUBSPOT_PORTAL_ID = "12345";
    process.env.HUBSPOT_DEMO_FORM_ID = "form-abc";

    const result = await submitDemoBooking(
      {
        email: "x@example.com",
        firstName: "X",
        lastName: "Y",
        company: "Acme",
        role: "VP Ops",
        attribution: { utm_source: "google", utm_medium: "cpc" },
      },
      fakeFetch,
    );
    expect(result.ok).toBe(true);
    expect(calls[0]?.url).toContain("/12345/form-abc");
    const body = JSON.parse((calls[0]?.init.body ?? "") as string);
    expect(body.fields.find((f: { name: string }) => f.name === "utm_source").value).toBe("google");
  });

  it("scaffoldTenant from employer-hub.brief.json reproduces the same tenant.config core fields", async () => {
    const parsedBrief = parseBrief(brief);
    const config = briefToTenantConfig(parsedBrief);
    expect(config.identity.slug).toBe(tenantConfig.identity.slug);
    expect(config.identity.businessModel).toBe(tenantConfig.identity.businessModel);
    expect(config.strapi?.baseUrl).toBe(tenantConfig.strapi?.baseUrl);

    const scaffold = await scaffoldTenant(parsedBrief, {
      outDir: "/tmp/employer-hub-scaffold-test",
      dryRun: true,
    });
    const paths = new Set(scaffold.files.map((f) => f.path));
    expect(paths.has("tenant.config.ts")).toBe(true);
    expect(paths.has("strapi/Dockerfile")).toBe(true);
    expect(paths.has("strapi/RUNBOOK.md")).toBe(true);
    expect(paths.has("strapi/schema/content-types.json")).toBe(true);
  });
});
