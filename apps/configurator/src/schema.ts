import { z } from "zod";

/**
 * Brief = the structured output of the Discovery questionnaire. Intentionally
 * smaller than `TenantConfig` — captures only what a non-technical operator
 * can answer; the translator (`briefToTenantConfig`) fills in defaults that
 * Phase 4's AI Research will later override.
 */
export const BriefSchema = z.object({
  identity: z.object({
    name: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes."),
    domain: z.string().min(1),
    industry: z.string().min(1),
    businessModel: z.enum(["b2c", "b2b", "marketplace"]),
  }),
  audience: z.object({
    primaryPersona: z.object({
      name: z.string().min(1),
      pain: z.string().min(1),
      value: z.string().min(1),
    }),
    primaryICP: z
      .object({
        role: z.string().min(1),
        industry: z.string().optional(),
      })
      .optional(),
  }),
  conversion: z.object({
    primary: z.enum(["app_install", "demo_booking", "sql", "newsletter", "purchase", "lead_form"]),
    ctaPattern: z.string().min(1),
  }),
  brand: z.object({
    primaryDistinctiveAsset: z.string().min(1),
    voiceTone: z.string().min(1),
    readingLevel: z
      .enum(["6th_grade", "7th_grade", "8th_grade", "9th_grade", "10th_grade", "college"])
      .default("8th_grade"),
    pov: z.enum(["first_person", "second_person", "third_person"]).default("second_person"),
  }),
  seo: z.object({
    primarySchemaType: z.string().default("Article"),
    pillars: z
      .array(
        z.object({
          slug: z.string().regex(/^[a-z0-9-]+$/),
          name: z.string(),
          intent: z
            .enum(["informational", "transactional", "commercial", "navigational"])
            .default("informational"),
        }),
      )
      .min(1),
  }),
  /** Strapi-mode opt-in. Phase 3 ships either pure code-mode or pure Strapi-mode tenants. */
  contentStorage: z
    .object({
      mode: z.enum(["code", "strapi"]),
      strapi: z
        .object({
          baseUrl: z.string().url(),
          deployProvider: z.enum(["render", "railway", "fly"]),
          region: z.string().optional(),
        })
        .optional(),
    })
    .superRefine((cs, ctx) => {
      if (cs.mode === "strapi" && !cs.strapi) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["strapi"],
          message: "contentStorage.strapi is required when mode is 'strapi'.",
        });
      }
    }),
});

export type Brief = z.infer<typeof BriefSchema>;

export function parseBrief(input: unknown): Brief {
  return BriefSchema.parse(input);
}

/** Discovery questionnaire item (consumed by the UI in Phase 3 + 4). */
export interface DiscoveryQuestion {
  id: string;
  prompt: string;
  /** JSON-Pointer-ish path inside Brief, e.g. "identity.name". */
  path: string;
  kind: "text" | "select" | "multi-select" | "url" | "longtext";
  options?: string[];
  /** Help text shown under the input. */
  hint?: string;
  required?: boolean;
}

export interface DiscoveryAnswer {
  questionId: string;
  value: string | string[];
}
