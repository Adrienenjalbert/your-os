/**
 * @your-os/strapi-deploy
 *
 * Deploy templates for self-hosted Strapi-per-tenant. Each provider returns
 * a set of files (Dockerfile, infra config, env template, runbook) the
 * configurator commits to the tenant's infra repo + applies via the
 * provider's CLI/API.
 *
 * Phase 2B ships the file-generation surface; CLI wiring (`your-os strapi:deploy`)
 * lands in Phase 4 once the configurator owns provider creds.
 */
export {
  generateDeployFiles,
  type DeployProvider,
  type DeployOptions,
  type DeployFile,
} from "./generator.js";
export { DEFAULT_DOCKERFILE } from "./templates/dockerfile.js";
export { renderEnvExample } from "./templates/env.js";
