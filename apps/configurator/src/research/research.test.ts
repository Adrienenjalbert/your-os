import { careerHubConfig } from "@your-os/example-career-hub-snapshot/tenant.config";
import { type TenantConfig, parseTenantConfig } from "@your-os/tenant-config";
import { describe, expect, it } from "vitest";
import careerHubBrief from "../fixtures/career-hub.brief.json" with { type: "json" };
import minimalBrief from "../fixtures/minimal.brief.json" with { type: "json" };
import { parseBrief } from "../schema.js";
import { acceptAll, applyGateDecisions } from "./confirm-gates.js";
import { enrichWithResearch } from "./enrich.js";
import { evaluateAgainstTarget } from "./eval.js";
import { MockResearchProvider } from "./mock-provider.js";
import { runResearch } from "./runner.js";

// Single source of truth: the Career Hub snapshot package. If this drifts,
// the snapshot drifted — fix it there, not here.
const careerHubTarget: TenantConfig = parseTenantConfig(careerHubConfig);

describe("AI research chain", () => {
  it("produces a non-empty report deterministically (mock provider)", async () => {
    const provider = new MockResearchProvider();
    const r1 = await runResearch({ brief: parseBrief(minimalBrief), provider });
    const r2 = await runResearch({ brief: parseBrief(minimalBrief), provider });
    expect(r1).toEqual(r2);
    expect(r1.serp.length).toBeGreaterThan(0);
    expect(r1.dbaProposals.length).toBeGreaterThan(0);
  });

  it("scoreToolFit detects calculator-like persona values", async () => {
    const calc = await new MockResearchProvider().scoreToolFit({
      ...parseBrief(minimalBrief),
      audience: {
        primaryPersona: { name: "n", pain: "p", value: "salary calculator help" },
      },
    } as unknown as ReturnType<typeof parseBrief>);
    expect(calc.score).toBeGreaterThan(0.5);
    expect(calc.suggestedTool?.kind).toBe("calculator");
  });
});

describe("Confirmation gates", () => {
  it("accept-all is a no-op", async () => {
    const provider = new MockResearchProvider();
    const report = await runResearch({ brief: parseBrief(minimalBrief), provider });
    const confirmed = applyGateDecisions(report, acceptAll());
    expect(confirmed.dbaProposals).toEqual(report.dbaProposals);
  });

  it("rejecting toolFit zeroes the score", async () => {
    const provider = new MockResearchProvider();
    const report = await runResearch({ brief: parseBrief(minimalBrief), provider });
    const confirmed = applyGateDecisions(report, [{ gate: "toolFit", decision: "reject" }]);
    expect(confirmed.toolFit.score).toBe(0);
  });

  it("editing pillars overrides the proposal", async () => {
    const provider = new MockResearchProvider();
    const report = await runResearch({ brief: parseBrief(minimalBrief), provider });
    const confirmed = applyGateDecisions(report, [
      {
        gate: "pillars",
        decision: "edit",
        payload: [{ slug: "x", name: "X", intent: "informational" as const, topClusters: [] }],
      },
    ]);
    expect(confirmed.pillarProposals).toEqual([
      { slug: "x", name: "X", intent: "informational", topClusters: [] },
    ]);
  });
});

describe("Phase 4 gate — Career Hub round-trip", () => {
  it("brief + accept-all research produces a config matching the snapshot's required fields", async () => {
    const brief = parseBrief(careerHubBrief);
    const provider = new MockResearchProvider();
    const report = await runResearch({ brief, provider });
    const confirmed = applyGateDecisions(report, acceptAll());
    const actual = enrichWithResearch(brief, confirmed);

    // Tolerance reflects what a *brief* can carry today. The snapshot has
    // editorial polish (multiple DBAs, rich personas) the configurator can
    // only approach via Confirmation gates + research enrichment. The eval
    // verifies that the seed brief at minimum produces a config whose
    // identity, schema, voice, pillars, and primary DBA match the target.
    const result = evaluateAgainstTarget(actual, careerHubTarget, {
      exactFields: [
        "identity.slug",
        "identity.name",
        "identity.businessModel",
        "brand.voice.pov",
        "seo.primarySchemaType",
      ],
      setFields: ["seo.pillars[].slug"],
      // Actual must contain the brief's primary DBA. The snapshot's other
      // DBAs ("W-2 employment", "Choose your own shifts") come from later
      // editorial work, not from the seed brief.
      subsetFields: [],
    });
    // Spot-check: the primary DBA round-trips end-to-end.
    const actualDbas = actual.brand.distinctiveAssets.map((d) => d.value);
    expect(actualDbas).toContain("Same Day Pay");

    if (!result.passed) {
      console.error("evaluator failures:", result.failures);
    }
    expect(result.passed).toBe(true);
  });
});
