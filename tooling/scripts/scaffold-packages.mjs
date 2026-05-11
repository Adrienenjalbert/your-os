#!/usr/bin/env node
/**
 * One-time scaffold for empty packages so the workspace builds.
 *
 * Each generated package gets:
 *  - package.json (private until first changeset)
 *  - tsconfig.json extending @your-os/typescript-config
 *  - src/index.ts with a placeholder export so tsup has something to build
 *  - README.md with the package's role
 *  - vitest.config.ts so `turbo run test` doesn't fail on missing config
 *
 * Idempotent: re-running won't overwrite existing files.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");

const PACKAGES = [
  {
    name: "tenant-config",
    description:
      "The universal `tenant.config.ts` schema. Zod-validated. Every other @your-os/* package reads from here.",
    runtime: "node",
  },
  {
    name: "content-source",
    description:
      "The ContentSource abstraction + Code/Strapi/Hybrid adapters. The seam that lets tenants pick code, Strapi, or hybrid per content-type.",
    runtime: "node",
  },
  {
    name: "content-types",
    description:
      "Generic Article/Guide/Tool/Location/CaseStudy/Pillar/Persona/Brief TS types. CMS-agnostic.",
    runtime: "node",
  },
  {
    name: "seo",
    description: "Metadata helpers, JSON-LD generators, sitemap, robots.txt builders.",
    runtime: "node",
  },
  {
    name: "brand-lint",
    description:
      "DBA prevalence (Romaniuk ≥80%) + banned-phrase + AI-slop + GEO citation density linter. Reads tenantConfig.brand.",
    runtime: "node",
  },
  {
    name: "core",
    description:
      "CMS-agnostic page shells: StandardPageLayout, ContentPageShell, ToolPageShell, RolePageShell, FAQSection, CTASection.",
    runtime: "react",
  },
  {
    name: "pseo-engine",
    description: "Programmatic SEO scaffolding. N-dimensional cell generation. Always code-source.",
    runtime: "node",
  },
  {
    name: "tools-engine",
    description: "Calculator/decision-tool framework. Tool registry pattern.",
    runtime: "react",
  },
  {
    name: "analytics",
    description:
      "GA4/PostHog/Segment helpers + attribution. Conversion event parameterized from tenantConfig.conversion.",
    runtime: "node",
  },
  {
    name: "cli",
    description:
      "`your-os init|add|lint|audit|sync|strapi:*` CLI. Scaffolds new tenant repos and runs ops commands.",
    runtime: "node",
    bin: true,
  },
  {
    name: "skills",
    description:
      "The trimmed ~15-20 skill library that ships TO tenants. Mirrored into per-tenant AGENTS.md by @your-os/agent-context.",
    runtime: "node",
  },
  {
    name: "agent-context",
    description:
      "Generates per-tenant AGENTS.md / CLAUDE.md / .cursor/rules from tenantConfig + @your-os/skills.",
    runtime: "node",
  },
  {
    name: "strapi-template",
    description:
      "Strapi 5 schema-as-code template. Default content-types: Article, Pillar, Cluster, Persona, ICP, CaseStudy, OpportunityBrief, RoleGuide. Includes migration runner.",
    runtime: "node",
  },
  {
    name: "strapi-deploy",
    description:
      "Render/Railway/Fly deploy templates with managed Postgres + S3 + nightly backups + restore.",
    runtime: "node",
  },
  {
    name: "strapi-sync",
    description:
      "Next.js side of Strapi: /api/revalidate (HMAC-verified webhook → revalidateTag), /api/preview, /api/exit-preview. Tag convention: {tenant}:{contentType}:{slug}.",
    runtime: "node",
  },
  {
    name: "strapi-seo",
    description:
      "Strapi plugin bundle: universal SEO fields auto-attached to every content-type, Yoast-style scoring in admin.",
    runtime: "node",
  },
  {
    name: "strapi-codegen",
    description:
      "Introspects a Strapi instance's schema → generates TypeScript types + Zod runtime schemas for StrapiContentSource.",
    runtime: "node",
    bin: true,
  },
  {
    name: "strapi-brand-lint-hook",
    description:
      "Strapi beforePublish lifecycle hook → calls @your-os/brand-lint → blocks publish on banned phrases / DBA prevalence < target / missing citations.",
    runtime: "node",
  },
  {
    name: "migrate-to-strapi",
    description:
      "Phase 7 codemod: parses TS data files → creates Strapi entries via REST. Opt-in only, never auto-triggered against Career Hub.",
    runtime: "node",
    bin: true,
  },
];

function pkgJson({ name, description, runtime, bin }) {
  const isReact = runtime === "react";
  const base = {
    name: `@your-os/${name}`,
    version: "0.0.0",
    private: true,
    description,
    license: "BUSL-1.1",
    type: "module",
    main: "./dist/index.js",
    module: "./dist/index.js",
    types: "./dist/index.d.ts",
    exports: {
      ".": {
        types: "./dist/index.d.ts",
        import: "./dist/index.js",
      },
      "./package.json": "./package.json",
    },
    files: ["dist", "README.md"],
    scripts: {
      build: "tsup",
      "build:watch": "tsup --watch",
      typecheck: "tsc --noEmit",
      test: "vitest run --passWithNoTests",
      "test:watch": "vitest",
      lint: "biome check src",
      clean: "rimraf dist .turbo",
    },
    devDependencies: {
      "@your-os/typescript-config": "workspace:*",
      tsup: "^8.3.5",
      typescript: "^5.7.3",
      vitest: "^3.0.0",
      rimraf: "^6.0.1",
      "@biomejs/biome": "^1.9.4",
    },
    publishConfig: {
      access: "restricted",
    },
  };
  if (bin) {
    base.bin = { [`your-os-${name}`]: "./dist/cli.js" };
  }
  if (isReact) {
    base.peerDependencies = {
      react: ">=19.0.0",
      "react-dom": ">=19.0.0",
    };
    base.devDependencies["@types/react"] = "^19.0.0";
    base.devDependencies["@types/react-dom"] = "^19.0.0";
    base.devDependencies.react = "^19.2.5";
    base.devDependencies["react-dom"] = "^19.2.5";
  }
  return `${JSON.stringify(base, null, 2)}\n`;
}

function tsconfigJson() {
  const json = JSON.stringify(
    {
      extends: "@your-os/typescript-config/library.json",
      include: ["src/**/*"],
      exclude: ["dist", "node_modules", "**/*.test.ts", "**/*.spec.ts"],
      compilerOptions: { outDir: "dist", rootDir: "src" },
    },
    null,
    2,
  );
  return `${json}\n`;
}

function tsupConfig({ bin }) {
  const entry = bin ? `["src/index.ts", "src/cli.ts"]` : `["src/index.ts"]`;
  return `import { defineConfig } from "tsup";

export default defineConfig({
  entry: ${entry},
  format: ["esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  target: "node20",
  treeshake: true,
});
`;
}

function vitestConfig() {
  return `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    include: ["src/**/*.{test,spec}.ts"],
    coverage: {
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.{test,spec}.ts", "src/index.ts"],
    },
  },
});
`;
}

function indexTs(name) {
  return `/**
 * @your-os/${name}
 *
 * Placeholder export. Real implementation lands in subsequent phases.
 */
export const __version = "0.0.0";
`;
}

function cliTs(name) {
  return `#!/usr/bin/env node
/**
 * @your-os/${name} CLI
 *
 * Placeholder. Real commands implemented in later phases.
 */
console.log("[@your-os/${name}] CLI placeholder. See README.md.");
`;
}

function readme({ name, description }) {
  return `# @your-os/${name}

${description}

## Status

\`alpha\` — see the [stability legend](../../README.md#packages).

## Install

\`\`\`bash
pnpm add @your-os/${name}
\`\`\`

## Where it fits

- See the [architecture diagram](../../README.md#architecture-in-one-diagram).
- For OS contributor rules, start at [AGENTS.md](../../AGENTS.md).
`;
}

let created = 0;
let skipped = 0;
for (const pkg of PACKAGES) {
  const dir = join(ROOT, "packages", pkg.name);
  if (!existsSync(dir)) {
    mkdirSync(join(dir, "src"), { recursive: true });
  }
  const files = [
    ["package.json", pkgJson(pkg)],
    ["tsconfig.json", tsconfigJson()],
    ["tsup.config.ts", tsupConfig({ bin: pkg.bin })],
    ["vitest.config.ts", vitestConfig()],
    ["README.md", readme(pkg)],
    ["src/index.ts", indexTs(pkg.name)],
  ];
  if (pkg.bin) {
    files.push(["src/cli.ts", cliTs(pkg.name)]);
  }
  for (const [path, contents] of files) {
    const full = join(dir, path);
    if (existsSync(full)) {
      skipped++;
      continue;
    }
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, contents);
    created++;
  }
}

console.log(
  `Scaffolded ${PACKAGES.length} packages: ${created} files created, ${skipped} skipped.`,
);
