import { z } from "zod";

const SeoFieldsSchema = z.object({
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  canonicalURL: z.string().url().optional(),
  ogImage: z.string().url().optional(),
  noIndex: z.boolean().default(false),
  keywords: z.array(z.string()).default([]),
  intent: z.enum(["informational", "transactional", "commercial", "navigational"]).optional(),
  funnelStage: z.enum(["tofu", "mofu", "bofu", "sales-enablement"]).optional(),
});

const BaseEntitySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "slug must be lowercase alphanumeric with dashes"),
  title: z.string(),
  description: z.string().optional(),
  publishedDate: z.string().datetime().optional(),
  dateModified: z.string().datetime().optional(),
  authorName: z.string().optional(),
  pillarSlug: z.string().optional(),
  clusterSlug: z.string().optional(),
  personaIds: z.array(z.string()).default([]),
  icpIds: z.array(z.string()).default([]),
  seo: SeoFieldsSchema.default({}),
});

export const ArticleSchema = BaseEntitySchema.extend({
  body: z.string(),
  readingTimeMinutes: z.number().optional(),
  citations: z
    .array(
      z.object({ source: z.string(), url: z.string().url().optional(), year: z.number().int() }),
    )
    .default([]),
});
export type Article = z.infer<typeof ArticleSchema>;

export const GuideSchema = BaseEntitySchema.extend({
  body: z.string(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
});
export type Guide = z.infer<typeof GuideSchema>;

export const ToolSchema = BaseEntitySchema.extend({
  toolType: z.enum(["calculator", "decision-tool", "generator", "comparator", "roi-calculator"]),
  inputs: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      type: z.enum(["number", "text", "select", "boolean"]),
      options: z.array(z.string()).optional(),
      defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
    }),
  ),
  outputs: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      formula: z.string().describe("Reference to a calculator function name."),
    }),
  ),
});
export type Tool = z.infer<typeof ToolSchema>;

export const PillarSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string().optional(),
  intent: z.enum(["informational", "transactional", "commercial", "navigational"]).optional(),
});
export type Pillar = z.infer<typeof PillarSchema>;

export const ClusterSchema = z.object({
  slug: z.string(),
  name: z.string(),
  pillarSlug: z.string(),
  primaryKeyword: z.string().optional(),
  secondaryKeywords: z.array(z.string()).default([]),
});
export type Cluster = z.infer<typeof ClusterSchema>;

export const PersonaSchema = z.object({
  id: z.string(),
  name: z.string(),
  pain: z.string(),
  value: z.string(),
  voiceOfCustomerQuotes: z.array(z.string()).default([]),
});
export type Persona = z.infer<typeof PersonaSchema>;

export const ICPSchema = z.object({
  id: z.string(),
  role: z.string(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  buyingCommittee: z.array(z.string()).default([]),
  cep: z.string().optional(),
  pain: z.string().optional(),
  value: z.string().optional(),
});
export type ICP = z.infer<typeof ICPSchema>;

export const CaseStudySchema = BaseEntitySchema.extend({
  customer: z.string(),
  industry: z.string(),
  companySize: z.string(),
  outcome: z.string(),
  metrics: z
    .array(z.object({ label: z.string(), value: z.string(), delta: z.string().optional() }))
    .default([]),
});
export type CaseStudy = z.infer<typeof CaseStudySchema>;

export const RoleGuideSchema = BaseEntitySchema.extend({
  roleSlug: z.string(),
  payRangeLow: z.number(),
  payRangeHigh: z.number(),
  payUnit: z.enum(["hour", "year"]).default("hour"),
  citySlug: z.string().optional(),
  duties: z.array(z.string()).default([]),
});
export type RoleGuide = z.infer<typeof RoleGuideSchema>;

export const LocationSchema = z.object({
  slug: z.string(),
  name: z.string(),
  state: z.string().optional(),
  country: z.string().default("US"),
  population: z.number().optional(),
  costOfLivingIndex: z.number().optional(),
});
export type Location = z.infer<typeof LocationSchema>;

export const OpportunityBriefSchema = z.object({
  slug: z.string(),
  status: z.enum(["draft", "accepted", "rejected", "shipped"]).default("draft"),
  targetKeyword: z.string(),
  suggestedTitle: z.string(),
  pillarSlug: z.string(),
  clusterSlug: z.string().optional(),
  personaIds: z.array(z.string()).default([]),
  citationSeeds: z
    .array(z.object({ source: z.string(), url: z.string().url(), year: z.number().int() }))
    .default([]),
  internalLinkSuggestions: z.array(z.string()).default([]),
  estimatedLift: z
    .object({
      monthlyClicks: z.number(),
      confidence: z.enum(["low", "medium", "high"]),
    })
    .optional(),
  targetWordCount: z.number().optional(),
  createdBy: z.enum(["weekly-digest-agent", "editor", "manual"]).default("weekly-digest-agent"),
  createdAt: z.string().datetime(),
  performanceSnapshot: z
    .object({
      ctr: z.number().optional(),
      position: z.number().optional(),
      clicks30d: z.number().optional(),
      impressions30d: z.number().optional(),
      lastUpdated: z.string().datetime().optional(),
    })
    .optional(),
});
export type OpportunityBrief = z.infer<typeof OpportunityBriefSchema>;
