import {
  CONTENT_TYPES,
  type ContentTypeDefinition,
  type StrapiAttribute,
} from "@your-os/strapi-template";

/**
 * B2B-specific content-types appended to the default `@your-os/strapi-template`
 * schema. Drives `pnpm exec your-os strapi:migrate --tenant employer-hub`.
 */
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
  ...SEO_FIELDS,
};

export const B2B_CONTENT_TYPES: ContentTypeDefinition[] = [
  {
    apiId: "roi-scenario",
    info: {
      singularName: "roi-scenario",
      pluralName: "roi-scenarios",
      displayName: "ROI Scenario",
    },
    options: { draftAndPublish: true },
    attributes: {
      ...BASE_FIELDS,
      industry: { type: "string", required: true },
      companySize: { type: "string", required: true },
      monthlyHires: { type: "integer", required: true, min: 1 },
      avgHourlyRate: { type: "float", required: true },
      assumedFillTimeDays: { type: "integer", required: true, min: 0 },
      projectedSavings: { type: "float", required: true },
      caseStudyReference: {
        type: "relation",
        relation: "manyToOne",
        target: "api::case-study.case-study",
      },
    },
  },
  {
    apiId: "integration-page",
    info: {
      singularName: "integration-page",
      pluralName: "integration-pages",
      displayName: "Integration Page",
    },
    options: { draftAndPublish: true },
    attributes: {
      ...BASE_FIELDS,
      vendor: { type: "string", required: true },
      vendorSlug: { type: "uid", targetField: "vendor" },
      category: {
        type: "enumeration",
        enum: ["ATS", "HRIS", "Payroll", "Time-and-Attendance", "Scheduling", "Other"],
        default: "ATS",
      },
      installType: {
        type: "enumeration",
        enum: ["self-serve", "guided", "managed"],
        default: "guided",
      },
      docsUrl: { type: "string" },
      partnerLogo: { type: "string" },
    },
  },
  {
    apiId: "comparison-page",
    info: {
      singularName: "comparison-page",
      pluralName: "comparison-pages",
      displayName: "Comparison Page",
    },
    options: { draftAndPublish: true },
    attributes: {
      ...BASE_FIELDS,
      ourBrand: { type: "string", required: true },
      competitor: { type: "string", required: true },
      competitorSlug: { type: "uid", targetField: "competitor" },
      bestFor: { type: "text" },
      featureMatrix: { type: "json" },
      verdict: { type: "richtext" },
    },
  },
];

/**
 * Full schema this tenant ships: OS defaults + B2B extensions. Use as the
 * input to `MigrationRunner` and to `@your-os/strapi-codegen`.
 */
export const EMPLOYER_HUB_CONTENT_TYPES: ContentTypeDefinition[] = [
  ...CONTENT_TYPES,
  ...B2B_CONTENT_TYPES,
];
