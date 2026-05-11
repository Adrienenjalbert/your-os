import { type TenantConfig, parseTenantConfig } from "@your-os/tenant-config";
import type { Brief } from "./schema.js";

/**
 * Brief → TenantConfig translator. Defaults filled in from the
 * `marketing-foundations` and `seo-foundations` skill posture.
 *
 * Phase 4 will replace these defaults with AI Research outputs (DBAs,
 * pillars, ICPs, schema selection); Brief stays the canonical user-facing
 * shape so the configurator UI does not change.
 */
export function briefToTenantConfig(brief: Brief): TenantConfig {
  const eventName = `${brief.identity.slug.replace(/-/g, "_")}_${brief.conversion.primary}`;

  const draft = {
    identity: {
      name: brief.identity.name,
      slug: brief.identity.slug,
      domain: brief.identity.domain,
      industry: brief.identity.industry,
      businessModel: brief.identity.businessModel,
    },
    audience: {
      personas: [
        {
          id: slugify(brief.audience.primaryPersona.name),
          name: brief.audience.primaryPersona.name,
          pain: brief.audience.primaryPersona.pain,
          value: brief.audience.primaryPersona.value,
        },
      ],
      icps: brief.audience.primaryICP
        ? [
            {
              id: slugify(brief.audience.primaryICP.role),
              role: brief.audience.primaryICP.role,
              industry: brief.audience.primaryICP.industry,
            },
          ]
        : [],
    },
    conversion: {
      primary: brief.conversion.primary,
      ctaPattern: brief.conversion.ctaPattern,
      eventName,
      attributionParams: ["utm_source", "utm_medium", "utm_campaign"],
    },
    brand: {
      distinctiveAssets: [
        {
          type: "phrase" as const,
          value: brief.brand.primaryDistinctiveAsset,
          prevalenceTarget: 0.8,
        },
      ],
      bannedPhrases: [],
      voice: {
        tone: brief.brand.voiceTone,
        readingLevel: brief.brand.readingLevel,
        pov: brief.brand.pov,
      },
    },
    seo: {
      primarySchemaType: brief.seo.primarySchemaType,
      pillars: brief.seo.pillars,
      contentClassTargets: defaultContentClassTargets(brief.identity.businessModel),
      eeAtSignals: { authorByline: true, citationDensity: "high", dateModifiedRequired: true },
    },
    pSEO: { enabled: false, dimensions: [] },
    tools: { enabled: [] },
    trust: defaultTrust(brief.identity.businessModel),
    analytics: {},
    performance: { budgets: { lcpMs: 2500, inpMs: 200, cls: 0.1 } },
    integrations: {
      crm: brief.identity.businessModel === "b2b" ? "hubspot" : "none",
      crmConfig: {},
    },
    agentContext: { emphasize: [], forbid: [] },
    contentSources:
      brief.contentStorage.mode === "code"
        ? {
            articles: { mode: "code" as const },
            pillars: { mode: "code" as const },
          }
        : {
            articles: { mode: "strapi" as const, strapiCollection: "articles" },
            pillars: { mode: "strapi" as const, strapiCollection: "pillars" },
          },
    ...(brief.contentStorage.mode === "strapi"
      ? {
          strapi: {
            baseUrl: brief.contentStorage.strapi!.baseUrl,
            transport: "rest" as const,
            apiTokenEnv: "STRAPI_API_TOKEN",
            webhookSecretEnv: "STRAPI_WEBHOOK_SECRET",
            draftSecretEnv: "STRAPI_DRAFT_SECRET",
            schemaTemplate: "@your-os/strapi-template@1.x",
          },
        }
      : {}),
  };

  return parseTenantConfig(draft);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function defaultContentClassTargets(model: Brief["identity"]["businessModel"]) {
  if (model === "b2c") return { informational: 0.7, commercial: 0.2, brand: 0.1 };
  if (model === "b2b") return { informational: 0.5, commercial: 0.3, brand: 0.2 };
  return { informational: 0.6, commercial: 0.25, brand: 0.15 };
}

function defaultTrust(model: Brief["identity"]["businessModel"]) {
  return {
    caseStudies: model === "b2b",
    customerLogos: model === "b2b",
    complianceBadges: [],
    workerReviews: model === "b2c",
  };
}
