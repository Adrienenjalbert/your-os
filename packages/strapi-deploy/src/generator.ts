import { DEFAULT_DOCKERFILE } from "./templates/dockerfile.js";
import { renderEnvExample } from "./templates/env.js";
import { renderFlyToml } from "./templates/fly.js";
import { renderRailwayConfig } from "./templates/railway.js";
import { renderRenderBlueprint } from "./templates/render.js";
import { renderRunbook } from "./templates/runbook.js";

export type DeployProvider = "render" | "railway" | "fly";

export interface DeployOptions {
  tenantSlug: string;
  /** e.g. "cms.employer.indeedflex.com". */
  hostname: string;
  /** Provider-specific region; pass through. */
  region?: string;
  /** Strapi container image; defaults to a pinned tag. */
  image?: string;
}

export interface DeployFile {
  path: string;
  contents: string;
}

/**
 * Returns the file set the tenant commits to a fresh infra repo (or to a
 * subdir of the tenant's main repo). The configurator + tenant CI applies
 * these via the provider's deployment flow.
 */
export function generateDeployFiles(
  provider: DeployProvider,
  options: DeployOptions,
): DeployFile[] {
  const common: DeployFile[] = [
    { path: "Dockerfile", contents: DEFAULT_DOCKERFILE },
    { path: ".env.example", contents: renderEnvExample(options) },
    { path: "RUNBOOK.md", contents: renderRunbook(provider, options) },
  ];
  switch (provider) {
    case "render":
      return [...common, { path: "render.yaml", contents: renderRenderBlueprint(options) }];
    case "railway":
      return [...common, { path: "railway.json", contents: renderRailwayConfig(options) }];
    case "fly":
      return [...common, { path: "fly.toml", contents: renderFlyToml(options) }];
  }
}
