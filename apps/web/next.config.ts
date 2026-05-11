import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Workspace packages we want bundled into Next's compile (small, no fs).
  transpilePackages: ["@your-os/console", "@your-os/measurement", "@your-os/tenant-config"],
  typedRoutes: false,
  // Keep heavy / node-only packages out of the server bundle (they import
  // node:fs/promises and are only needed at runtime in API routes).
  serverExternalPackages: [
    "@your-os/cli",
    "@your-os/configurator",
    "@your-os/control-plane",
    "@your-os/brand-lint",
    "@your-os/strapi-deploy",
    "@your-os/strapi-template",
  ],
};

export default nextConfig;
