/**
 * Strapi content-type definitions encoded as plain JSON. The migration runner
 * applies these to a tenant's Strapi instance via Strapi's content-type
 * schema files at `<strapi-root>/src/api/<name>/content-types/<name>/schema.json`.
 *
 * Mirror of `@your-os/content-types` Zod schemas — these MUST stay in sync.
 * Codegen (`@your-os/strapi-codegen`) verifies that.
 */

export type StrapiAttribute =
  | { type: "string"; required?: boolean; unique?: boolean; maxLength?: number }
  | { type: "text"; required?: boolean }
  | { type: "richtext"; required?: boolean }
  | { type: "integer"; required?: boolean; min?: number; max?: number }
  | { type: "float"; required?: boolean }
  | { type: "boolean"; default?: boolean }
  | { type: "json" }
  | {
      type: "enumeration";
      enum: readonly string[];
      default?: string;
    }
  | { type: "datetime"; required?: boolean }
  | { type: "uid"; targetField?: string }
  | {
      type: "relation";
      relation: "oneToOne" | "oneToMany" | "manyToOne" | "manyToMany";
      target: string;
      inversedBy?: string;
      mappedBy?: string;
    }
  | { type: "component"; repeatable?: boolean; component: string };

export interface ContentTypeDefinition {
  /** API id (singular). */
  apiId: string;
  /** Strapi info block. */
  info: {
    singularName: string;
    pluralName: string;
    displayName: string;
    description?: string;
  };
  options?: {
    draftAndPublish?: boolean;
  };
  attributes: Record<string, StrapiAttribute>;
}

/** Universal SEO field bundle attached to every content-type. */
const SEO_FIELDS: Record<string, StrapiAttribute> = {
  metaTitle: { type: "string", maxLength: 70 },
  metaDescription: { type: "string", maxLength: 160 },
  canonicalURL: { type: "string" },
  ogImage: { type: "string" },
  noIndex: { type: "boolean", default: false },
  keywords: { type: "json" },
  intent: {
    type: "enumeration",
    enum: ["informational", "transactional", "commercial", "navigational"],
  },
  funnelStage: {
    type: "enumeration",
    enum: ["tofu", "mofu", "bofu", "sales-enablement"],
  },
};

const BASE_FIELDS: Record<string, StrapiAttribute> = {
  slug: { type: "uid", targetField: "title" },
  title: { type: "string", required: true },
  description: { type: "text" },
  pillar: { type: "relation", relation: "manyToOne", target: "api::pillar.pillar" },
  cluster: { type: "relation", relation: "manyToOne", target: "api::cluster.cluster" },
  personas: { type: "relation", relation: "manyToMany", target: "api::persona.persona" },
  icps: { type: "relation", relation: "manyToMany", target: "api::icp.icp" },
  ...SEO_FIELDS,
};

export const CONTENT_TYPES: ContentTypeDefinition[] = [
  {
    apiId: "article",
    info: { singularName: "article", pluralName: "articles", displayName: "Article" },
    options: { draftAndPublish: true },
    attributes: {
      ...BASE_FIELDS,
      body: { type: "richtext", required: true },
      readingTimeMinutes: { type: "integer", min: 0 },
      authorName: { type: "string" },
      citations: { type: "json" },
      publishedDate: { type: "datetime" },
      dateModified: { type: "datetime" },
    },
  },
  {
    apiId: "pillar",
    info: { singularName: "pillar", pluralName: "pillars", displayName: "Pillar" },
    options: { draftAndPublish: false },
    attributes: {
      slug: { type: "uid", targetField: "name" },
      name: { type: "string", required: true },
      description: { type: "text" },
      intent: {
        type: "enumeration",
        enum: ["informational", "transactional", "commercial", "navigational"],
      },
    },
  },
  {
    apiId: "cluster",
    info: { singularName: "cluster", pluralName: "clusters", displayName: "Cluster" },
    options: { draftAndPublish: false },
    attributes: {
      slug: { type: "uid", targetField: "name" },
      name: { type: "string", required: true },
      pillar: { type: "relation", relation: "manyToOne", target: "api::pillar.pillar" },
      primaryKeyword: { type: "string" },
      secondaryKeywords: { type: "json" },
    },
  },
  {
    apiId: "persona",
    info: { singularName: "persona", pluralName: "personas", displayName: "Persona" },
    options: { draftAndPublish: false },
    attributes: {
      personaId: { type: "string", required: true, unique: true },
      name: { type: "string", required: true },
      pain: { type: "text", required: true },
      value: { type: "text", required: true },
      voiceOfCustomerQuotes: { type: "json" },
    },
  },
  {
    apiId: "icp",
    info: { singularName: "icp", pluralName: "icps", displayName: "ICP" },
    options: { draftAndPublish: false },
    attributes: {
      icpId: { type: "string", required: true, unique: true },
      role: { type: "string", required: true },
      industry: { type: "string" },
      companySize: { type: "string" },
      buyingCommittee: { type: "json" },
      cep: { type: "text" },
      pain: { type: "text" },
      value: { type: "text" },
    },
  },
  {
    apiId: "case-study",
    info: {
      singularName: "case-study",
      pluralName: "case-studies",
      displayName: "Case Study",
    },
    options: { draftAndPublish: true },
    attributes: {
      ...BASE_FIELDS,
      customer: { type: "string", required: true },
      industry: { type: "string", required: true },
      companySize: { type: "string", required: true },
      outcome: { type: "text", required: true },
      metrics: { type: "json" },
      publishedDate: { type: "datetime" },
      dateModified: { type: "datetime" },
    },
  },
  {
    apiId: "opportunity-brief",
    info: {
      singularName: "opportunity-brief",
      pluralName: "opportunity-briefs",
      displayName: "Opportunity Brief",
    },
    options: { draftAndPublish: true },
    attributes: {
      slug: { type: "uid", targetField: "suggestedTitle" },
      status: {
        type: "enumeration",
        enum: ["draft", "accepted", "rejected", "shipped"],
        default: "draft",
      },
      targetKeyword: { type: "string", required: true },
      suggestedTitle: { type: "string", required: true },
      pillar: { type: "relation", relation: "manyToOne", target: "api::pillar.pillar" },
      cluster: { type: "relation", relation: "manyToOne", target: "api::cluster.cluster" },
      personas: { type: "relation", relation: "manyToMany", target: "api::persona.persona" },
      citationSeeds: { type: "json" },
      internalLinkSuggestions: { type: "json" },
      estimatedLift: { type: "json" },
      targetWordCount: { type: "integer", min: 0 },
      createdBy: {
        type: "enumeration",
        enum: ["weekly-digest-agent", "editor", "manual"],
        default: "weekly-digest-agent",
      },
      createdAt: { type: "datetime", required: true },
      performanceSnapshot: { type: "json" },
    },
  },
  {
    apiId: "role-guide",
    info: { singularName: "role-guide", pluralName: "role-guides", displayName: "Role Guide" },
    options: { draftAndPublish: true },
    attributes: {
      ...BASE_FIELDS,
      roleSlug: { type: "string", required: true },
      payRangeLow: { type: "float", required: true },
      payRangeHigh: { type: "float", required: true },
      payUnit: { type: "enumeration", enum: ["hour", "year"], default: "hour" },
      citySlug: { type: "string" },
      duties: { type: "json" },
      publishedDate: { type: "datetime" },
      dateModified: { type: "datetime" },
    },
  },
];
