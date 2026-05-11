import { type ContentEntity, resolveContentSource } from "@your-os/content-source";
import { StrapiContentSource } from "@your-os/strapi-sync";
import tenantConfig from "../tenant.config.js";

interface CaseStudyEntity extends ContentEntity {
  customer: string;
  industry: string;
  outcome: string;
}

interface RoiScenarioEntity extends ContentEntity {
  industry: string;
  monthlyHires: number;
  projectedSavings: number;
}

const apiToken = process.env[tenantConfig.strapi!.apiTokenEnv ?? "STRAPI_API_TOKEN"];

const factory = <T extends ContentEntity>(collection: string) =>
  new StrapiContentSource<T>({
    baseUrl: tenantConfig.strapi!.baseUrl,
    collection,
    singularApiId: collection.replace(/s$/, ""),
    tenantSlug: tenantConfig.identity.slug,
    apiToken,
  });

export const getCaseStudySource = () =>
  resolveContentSource<CaseStudyEntity>({
    spec: tenantConfig.contentSources["case-studies"]!,
    strapiSourceFactory: (c) => factory<CaseStudyEntity>(c),
  });

export const getRoiScenarioSource = () =>
  resolveContentSource<RoiScenarioEntity>({
    spec: tenantConfig.contentSources["roi-scenarios"]!,
    strapiSourceFactory: (c) => factory<RoiScenarioEntity>(c),
  });
