import { renderAgentsMd } from "@your-os/agent-context";
import { createAnalytics, noopTransport } from "@your-os/analytics";
import { defaultRules, lintFile } from "@your-os/brand-lint";
import { initTenant } from "@your-os/cli";
import { generateCells } from "@your-os/pseo-engine";
import { buildArticleJsonLd, generateGuideMetadata } from "@your-os/seo";
import { listSkills } from "@your-os/skills";
import { createToolRegistry, defineTool, runTool } from "@your-os/tools-engine";
/**
 * Integration test: every @your-os/* package composes for examples/minimal.
 * If this test breaks, a Phase 2 package's public API regressed.
 */
import { describe, expect, it } from "vitest";
import { tenantConfig } from "../tenant.config.js";
import { articlesSource } from "./data-source.js";
import { seoContext } from "./seo-context.js";

describe("examples/minimal integration", () => {
  it("ContentSource: list + get the seed article", async () => {
    const all = await articlesSource.list();
    expect(all).toHaveLength(1);
    expect(all[0]?.slug).toBe("getting-started");
    const got = await articlesSource.get("getting-started");
    expect(got?.title).toBe("Getting started with Minimal Hub");
  });

  it("@your-os/seo: build metadata + JSON-LD for the seed article", async () => {
    const article = (await articlesSource.get("getting-started"))!;
    const metadata = generateGuideMetadata(seoContext, {
      title: article.title,
      slug: article.slug,
      description: article.description ?? "",
    });
    expect(metadata.title).toContain("Minimal Hub");
    const ld = buildArticleJsonLd({
      context: seoContext,
      baseUrl: "https://minimal.example.com",
      article: {
        title: article.title,
        description: article.description ?? "",
        slug: article.slug,
        publishedDate: article.dateModified,
        updatedDate: article.dateModified,
      },
    });
    expect(ld["@type"]).toBe("Article");
  });

  it("@your-os/brand-lint: passes on the seed article body", () => {
    // The seed article has a single (BLS 2025) citation; should produce zero blocks.
    const issues = lintFile(
      "Welcome. This article exists so the example builds (BLS 2025).",
      "src/content/articles/getting-started.ts",
      defaultRules,
    );
    expect(issues.filter((i) => i.severity === "block")).toEqual([]);
  });

  it("@your-os/skills + @your-os/agent-context: render AGENTS.md for tenant", () => {
    const md = renderAgentsMd({ tenant: tenantConfig });
    expect(md).toContain("Minimal Hub");
    expect(md).toContain("All Demo, All Day");
    // No Strapi skills since the tenant is code-mode.
    expect(md).not.toContain("strapi-content-modeling");
    // Skill catalog contains at least 15 entries (the trimmed target).
    expect(listSkills().length).toBeGreaterThanOrEqual(15);
  });

  it("@your-os/pseo-engine: cartesian product over dimensions works", () => {
    const cells = generateCells([
      { name: "guide", values: ["roles", "guides"] },
      { name: "city", values: ["nyc", "boston"] },
    ]);
    expect(cells).toHaveLength(4);
  });

  it("@your-os/tools-engine: defineTool + runTool + registry", () => {
    const tool = defineTool({
      slug: "subscribe-calc",
      name: "Subscribe Calculator",
      description: "Demo",
      inputs: [{ key: "n", label: "N", type: "number", min: 0 }],
      outputs: [{ key: "double", label: "2N", formula: ({ n }) => Number(n) * 2 }],
    });
    const result = runTool({ toolDefinition: tool, values: { n: 21 } });
    expect(result.double).toBe(42);
    const registry = createToolRegistry([{ definition: tool, visible: true }]);
    expect(registry.get("subscribe-calc")?.definition.slug).toBe("subscribe-calc");
  });

  it("@your-os/analytics: dispatches conversion event from tenant config", async () => {
    const sink = noopTransport();
    const analytics = createAnalytics({ tenant: tenantConfig, transports: [sink] });
    await analytics.trackConversion({ source: "hero" });
    expect(sink.events[0]?.event).toBe("newsletter_subscribe");
  });

  it("@your-os/cli: initTenant produces canonical scaffold (dry-run)", async () => {
    const result = await initTenant({
      tenant: tenantConfig,
      outDir: "/tmp/anywhere",
      dryRun: true,
    });
    const paths = result.files.map((f) => f.path).sort();
    expect(paths).toContain("AGENTS.md");
    expect(paths).toContain("tenant.config.ts");
    expect(paths).toContain(".cursor/rules/000-core.mdc");
  });
});
