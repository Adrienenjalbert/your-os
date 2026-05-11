import type { DeployOptions } from "../generator.js";

export function renderRailwayConfig(opts: DeployOptions): string {
  return `${JSON.stringify(
    {
      $schema: "https://railway.app/railway.schema.json",
      build: { builder: "DOCKERFILE", dockerfilePath: "./Dockerfile" },
      deploy: {
        startCommand: "node server.js",
        healthcheckPath: "/_health",
        healthcheckTimeout: 30,
        restartPolicyType: "ON_FAILURE",
        restartPolicyMaxRetries: 5,
      },
      service: {
        name: `${opts.tenantSlug}-strapi`,
        domain: opts.hostname,
        region: opts.region ?? "us-west2",
      },
      env: {
        STRAPI_ADMIN_DISABLE_CONTENT_TYPE_BUILDER: "true",
      },
    },
    null,
    2,
  )}\n`;
}
