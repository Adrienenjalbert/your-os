import { z } from "zod";

const BusinessModelSchema = z.enum(["b2c", "b2b", "marketplace"]);
export type BusinessModel = z.infer<typeof BusinessModelSchema>;

const ConversionEventSchema = z.enum([
  "app_install",
  "demo_booking",
  "sql",
  "newsletter",
  "purchase",
  "lead_form",
]);
export type ConversionEvent = z.infer<typeof ConversionEventSchema>;

const ContentSourceModeSchema = z.enum(["code", "strapi", "hybrid"]);
export type ContentSourceMode = z.infer<typeof ContentSourceModeSchema>;

/**
 * Recursive (`hybrid` references itself), so TS needs an explicit type to
 * avoid `any` propagation in tsup's d.ts emit.
 */
export type ContentSourceSpec =
  | { mode: "code"; path?: string; generator?: string }
  | { mode: "strapi"; strapiCollection: string; locale?: string }
  | { mode: "hybrid"; primary: ContentSourceSpec; fallback: ContentSourceSpec };

const ContentSourceSpecSchema: z.ZodType<ContentSourceSpec> = z.lazy(() =>
  z.discriminatedUnion("mode", [
    z.object({
      mode: z.literal("code"),
      path: z
        .string()
        .optional()
        .describe("Optional import path for the TS module that holds this content type."),
      generator: z
        .string()
        .optional()
        .describe("Optional generator package, e.g. '@your-os/pseo-engine'."),
    }),
    z.object({
      mode: z.literal("strapi"),
      strapiCollection: z
        .string()
        .describe("Strapi collection API ID, e.g. 'articles' or 'case-studies'."),
      locale: z.string().optional().describe("Locale filter, e.g. 'en'."),
    }),
    z.object({
      mode: z.literal("hybrid"),
      primary: ContentSourceSpecSchema,
      fallback: ContentSourceSpecSchema,
    }),
  ]),
);

const PersonaSchema = z.object({
  id: z.string(),
  name: z.string(),
  pain: z.string(),
  value: z.string(),
});

const ICPSchema = z.object({
  id: z.string(),
  role: z.string(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  buyingCommittee: z.array(z.string()).optional(),
  cep: z.string().optional().describe("Category Entry Point (Romaniuk W-framework)"),
});

const DistinctiveBrandAssetSchema = z.object({
  type: z.enum(["phrase", "visual", "sonic", "character"]),
  value: z.string(),
  prevalenceTarget: z
    .number()
    .min(0)
    .max(1)
    .default(0.8)
    .describe("Romaniuk DBA prevalence target. Default 0.8."),
});
export type DistinctiveBrandAsset = z.infer<typeof DistinctiveBrandAssetSchema>;

const PillarSchema = z.object({
  slug: z.string(),
  name: z.string(),
  intent: z.enum(["informational", "transactional", "commercial", "navigational"]).optional(),
});

const PSeoDimensionSchema = z.object({
  name: z.string(),
  values: z.array(z.string()).optional().describe("Optional fixed value list."),
});

/**
 * Search intent classes — drive `funnel.intentMap` policy lookups.
 *
 * Source: Ahrefs / Semrush / Backlinko canonical taxonomy. See
 * .agents/rules/070-funnel-discipline.md for why these matter.
 */
const SearchIntentSchema = z.enum([
  "informational_early",
  "informational_problem_aware",
  "commercial_investigation",
  "transactional",
  "navigational",
  "tool_utility",
]);
export type SearchIntent = z.infer<typeof SearchIntentSchema>;

/**
 * CTA archetypes the OS knows about. Tenants pick which are allowed/forbidden
 * per intent class via `funnel.intentMap`.
 */
const CtaArchetypeSchema = z.enum([
  "newsletter",
  "lead_magnet",
  "tool_try",
  "self_assessment",
  "email_mini_course",
  "free_trial",
  "demo",
  "pricing",
  "comparison_tool",
  "roi_calculator",
  "case_study",
  "purchase",
  "app_install",
  "hard_gate_before_value",
]);
export type CtaArchetype = z.infer<typeof CtaArchetypeSchema>;

const IntentMapEntrySchema = z.object({
  allowedPrimaryCta: z.array(CtaArchetypeSchema),
  forbiddenPrimaryCta: z.array(CtaArchetypeSchema).default([]),
  defaultMicroConversionGoals: z
    .array(z.string())
    .default([])
    .describe(
      "IDs of micro-conversions (defined in funnel.microConversions.definitions) expected on pages of this intent.",
    ),
});
export type IntentMapEntry = z.infer<typeof IntentMapEntrySchema>;

const MicroConversionDefinitionSchema = z.object({
  id: z.string().describe("Stable ID, e.g. 'tool_completed' or 'newsletter_confirm'."),
  weight: z
    .number()
    .min(0)
    .max(1)
    .describe("Lead-score weight 0..1. Tool completion ~0.6; pricing view ~0.4; ROI calc ~0.95."),
  pillars: z
    .array(z.string())
    .optional()
    .describe("Optional pillar slugs this event is scoped to."),
  roosContribution: z
    .number()
    .min(0)
    .max(1)
    .default(0)
    .describe("How much this event contributes to ROOS attribution. Used by @your-os/measurement."),
});
export type MicroConversionDefinition = z.infer<typeof MicroConversionDefinitionSchema>;

const MicroConversionScoringModelSchema = z.enum(["weighted_sum", "max", "first_high"]);

const FunnelConfigSchema = z
  .object({
    intentMap: z
      .record(SearchIntentSchema, IntentMapEntrySchema)
      .default({})
      .describe(
        "Per-intent CTA + micro-conversion policy. Read by @your-os/brand-lint funnel rules library (packages/brand-lint/src/funnel-rules.ts) — caller-integrated.",
      ),
    microConversions: z
      .object({
        definitions: z.array(MicroConversionDefinitionSchema).default([]),
        scoringModel: MicroConversionScoringModelSchema.default("weighted_sum"),
      })
      .default({ definitions: [], scoringModel: "weighted_sum" }),
    domainAuthorityThreshold: z
      .number()
      .min(0)
      .max(100)
      .default(30)
      .describe(
        "Below this DA, brand-lint BOFU_HEAVY_NEW_HUB warns when >40% of cluster targets BOFU.",
      ),
  })
  .default({});

/**
 * Email warm-up sequence config. Provider-agnostic — the OS describes the
 * sequence; the runner integration translates to Kit / Loops / HubSpot / etc.
 */
const EmailProviderSchema = z.enum(["kit", "loops", "customerio", "hubspot", "none"]);

const EmailSequenceStepSchema = z.object({
  index: z.number().int().min(1),
  contentRefs: z
    .array(z.string())
    .describe(
      "Content slugs/IDs the email links to. NURTURE_ORPHAN_SIGNUP fails publish if Email 1 omits the source content.",
    ),
  ctaSoft: z.boolean().default(false),
  ctaHard: z.boolean().default(false),
  mapsToConversion: z
    .string()
    .optional()
    .describe("Conversion event ID this email escalates toward."),
});
export type EmailSequenceStep = z.infer<typeof EmailSequenceStepSchema>;

const EmailSequenceTriggerSchema = z.enum([
  "article_tag",
  "tool_completion",
  "lead_magnet_download",
  "newsletter_signup",
  "segment_survey_result",
]);

const EmailSequenceSchema = z.object({
  id: z.string(),
  length: z.number().int().min(1).max(20),
  sourceTrigger: EmailSequenceTriggerSchema,
  pillarSpine: z
    .string()
    .optional()
    .describe(
      "Pillar slug whose articles back this sequence. Required for non-cross-pillar sequences.",
    ),
  steps: z.array(EmailSequenceStepSchema).default([]),
});
export type EmailSequence = z.infer<typeof EmailSequenceSchema>;

const EmailConfigSchema = z
  .object({
    provider: EmailProviderSchema.default("none"),
    sequences: z.array(EmailSequenceSchema).default([]),
    defaults: z
      .object({
        newsletterFirstB2c: z.number().int().min(0).max(20).default(4),
        considerationB2b: z.number().int().min(0).max(20).default(7),
        demoMotion: z.number().int().min(0).max(20).default(3),
      })
      .default({}),
  })
  .default({});

const StrapiConfigSchema = z.object({
  baseUrl: z.string().url().describe("Strapi REST/GraphQL base URL."),
  transport: z.enum(["rest", "graphql"]).default("rest"),
  apiTokenEnv: z
    .string()
    .default("STRAPI_API_TOKEN")
    .describe("Env var name holding the Strapi API token."),
  webhookSecretEnv: z
    .string()
    .default("STRAPI_WEBHOOK_SECRET")
    .describe("Env var name holding the HMAC secret for /api/revalidate."),
  draftSecretEnv: z
    .string()
    .default("STRAPI_DRAFT_SECRET")
    .describe("Env var name holding the secret for /api/preview."),
  schemaTemplate: z
    .string()
    .describe("Pinned @your-os/strapi-template version, e.g. '@your-os/strapi-template@1.x'."),
});

export const TenantConfigSchema = z
  .object({
    identity: z.object({
      name: z.string(),
      slug: z
        .string()
        .regex(
          /^[a-z0-9-]+$/,
          "Slug must be lowercase alphanumeric with dashes (used as namespace).",
        ),
      domain: z.string(),
      industry: z.string(),
      businessModel: BusinessModelSchema,
    }),
    audience: z.object({
      personas: z.array(PersonaSchema).default([]),
      icps: z.array(ICPSchema).default([]),
    }),
    conversion: z.object({
      primary: ConversionEventSchema,
      ctaPattern: z
        .string()
        .describe("Template like 'Find $15-$25/hr {role} Shifts' or 'Book a demo'."),
      eventName: z.string().describe("Analytics event name to fire on conversion."),
      attributionParams: z.array(z.string()).default(["utm_source", "utm_medium", "utm_campaign"]),
    }),
    brand: z.object({
      distinctiveAssets: z.array(DistinctiveBrandAssetSchema).default([]),
      bannedPhrases: z
        .array(z.string())
        .default([])
        .describe("Tenant-specific banned phrases beyond OS defaults."),
      voice: z.object({
        tone: z.string(),
        readingLevel: z.string(),
        pov: z.enum(["first_person", "second_person", "third_person"]),
      }),
    }),
    seo: z.object({
      primarySchemaType: z
        .string()
        .describe("Default schema.org type, e.g. 'Article', 'JobPosting'."),
      pillars: z.array(PillarSchema),
      contentClassTargets: z
        .record(z.string(), z.number().min(0).max(1))
        .default({})
        .describe("e.g. { informational: 0.6, transactional: 0.25, brand: 0.15 }"),
      eeAtSignals: z
        .object({
          authorByline: z.boolean().default(true),
          citationDensity: z.enum(["low", "medium", "high"]).default("high"),
          dateModifiedRequired: z.boolean().default(true),
        })
        .default({}),
    }),
    pSEO: z
      .object({
        enabled: z.boolean().default(false),
        dimensions: z.array(PSeoDimensionSchema).default([]),
      })
      .default({ enabled: false, dimensions: [] }),
    tools: z
      .object({
        enabled: z.array(z.string()).default([]).describe("e.g. ['calculator', 'roi']"),
      })
      .default({ enabled: [] }),
    trust: z
      .object({
        caseStudies: z.boolean().default(false),
        customerLogos: z.boolean().default(false),
        complianceBadges: z.array(z.string()).default([]),
        workerReviews: z.boolean().default(false),
      })
      .default({}),
    analytics: z.object({
      ga4MeasurementId: z.string().optional(),
      posthogProjectId: z.string().optional(),
      segmentWriteKey: z.string().optional(),
    }),
    performance: z
      .object({
        budgets: z
          .object({
            lcpMs: z.number().default(2500),
            inpMs: z.number().default(200),
            cls: z.number().default(0.1),
          })
          .default({}),
      })
      .default({}),
    integrations: z
      .object({
        crm: z.enum(["hubspot", "salesforce", "none"]).default("none"),
        crmConfig: z.record(z.string(), z.string()).default({}),
        email: z.string().optional(),
      })
      .default({}),
    agentContext: z
      .object({
        emphasize: z.array(z.string()).default([]),
        forbid: z.array(z.string()).default([]),
      })
      .default({}),
    funnel: FunnelConfigSchema.describe(
      "Intent → CTA → micro-conversion policy. See .agents/rules/070-funnel-discipline.md.",
    ),
    email: EmailConfigSchema.describe(
      "Email warm-up sequence config (provider-agnostic). Closes the loop from micro-conversion to primary conversion.",
    ),
    contentSources: z
      .record(z.string(), ContentSourceSpecSchema)
      .describe(
        "Map content-type key (e.g. 'articles') -> source spec. Determines which adapter loads each type.",
      ),
    strapi: StrapiConfigSchema.optional().describe(
      "Required when any contentSource has mode 'strapi' or 'hybrid' that resolves to strapi.",
    ),
  })
  .superRefine((cfg, ctx) => {
    const usesStrapi = Object.values(cfg.contentSources).some((s) => specReferencesStrapi(s));
    if (usesStrapi && !cfg.strapi) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["strapi"],
        message:
          "tenantConfig.strapi is required because at least one contentSource uses mode 'strapi'.",
      });
    }
  });

export type TenantConfig = z.infer<typeof TenantConfigSchema>;

/**
 * Pre-validation input shape. Useful for `defineTenant` and other helpers
 * where the caller passes a literal object that hasn't yet had defaults
 * applied (e.g., `funnel`, `email` may be omitted; the schema fills them in).
 */
export type TenantConfigInput = z.input<typeof TenantConfigSchema>;

function specReferencesStrapi(spec: ContentSourceSpec): boolean {
  if (spec.mode === "strapi") return true;
  if (spec.mode === "hybrid") {
    return specReferencesStrapi(spec.primary) || specReferencesStrapi(spec.fallback);
  }
  return false;
}

/**
 * Type-safe helper for tenants. Returns the input as-is so the caller keeps
 * its inferred literal types, while still benefiting from Zod-validated fields
 * at runtime via parseTenantConfig().
 *
 * Accepts the INPUT shape so newly-added optional/defaulted fields (e.g.
 * `funnel`, `email`) don't break existing tenant configs that omit them.
 */
export function defineTenant<T extends TenantConfigInput>(config: T): T {
  return config;
}

/**
 * Parse + validate at runtime. Throws ZodError on misconfiguration. Use at
 * tenant-app boot so misconfigured tenants fail loudly, not silently.
 */
export function parseTenantConfig(input: unknown): TenantConfig {
  return TenantConfigSchema.parse(input);
}
