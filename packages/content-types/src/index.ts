/**
 * @your-os/content-types
 *
 * The canonical TS types + Zod schemas for the entities the OS understands.
 * Tenants extend these (per @your-os/content-source typing) but the field set
 * here is the contract every shared component / agent / Strapi schema reads.
 *
 * Mirror in `@your-os/strapi-codegen`: introspecting Strapi must produce
 * shapes assignable to these types.
 */
export {
  ArticleSchema,
  type Article,
  GuideSchema,
  type Guide,
  ToolSchema,
  type Tool,
  PillarSchema,
  type Pillar,
  ClusterSchema,
  type Cluster,
  PersonaSchema,
  type Persona,
  ICPSchema,
  type ICP,
  CaseStudySchema,
  type CaseStudy,
  RoleGuideSchema,
  type RoleGuide,
  LocationSchema,
  type Location,
  OpportunityBriefSchema,
  type OpportunityBrief,
} from "./schemas.js";
