import { type ContentEntity, resolveContentSource } from "@your-os/content-source";
import { StrapiContentSource } from "@your-os/strapi-sync";
import tenantConfig from "../tenant.config.js";

interface ArticleEntity extends ContentEntity {
  title: string;
}

const baseUrl = tenantConfig.strapi!.baseUrl;
const apiToken = process.env[tenantConfig.strapi!.apiTokenEnv ?? "STRAPI_API_TOKEN"];

const strapiFactory = (collection: string) =>
  new StrapiContentSource<ArticleEntity>({
    baseUrl,
    collection,
    singularApiId: collection.replace(/s$/, ""),
    tenantSlug: tenantConfig.identity.slug,
    apiToken,
  });

export const getArticleSource = () =>
  resolveContentSource<ArticleEntity>({
    spec: tenantConfig.contentSources.articles!,
    strapiSourceFactory: (collection) =>
      strapiFactory(collection) as ReturnType<typeof strapiFactory>,
  });
