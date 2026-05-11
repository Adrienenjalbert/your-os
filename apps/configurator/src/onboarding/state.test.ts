import { describe, expect, it } from "vitest";
import { MockResearchProvider } from "../research/mock-provider.js";
import { OnboardingMachine } from "./state.js";
import { ONBOARDING_STEPS, TOTAL_BUDGET_MINUTES } from "./steps.js";

const provider = new MockResearchProvider();

const fillIdentity = (m: OnboardingMachine) =>
  m.setFields({
    identity: {
      name: "Career Hub",
      slug: "career-hub",
      domain: "indeedflex.com",
      industry: "flexible-work-marketplace",
      businessModel: "b2c",
    },
  });

const fillAudienceConversion = (m: OnboardingMachine) =>
  m.setFields({
    audience: {
      primaryPersona: {
        name: "Students",
        pain: "Need work around class",
        value: "Flex shifts",
      },
    },
    conversion: { primary: "app_install", ctaPattern: "Find $15-$25/hr Shifts" },
  });

const fillBrand = (m: OnboardingMachine) =>
  m.setFields({
    brand: {
      primaryDistinctiveAsset: "Same Day Pay",
      voiceTone: "warm",
      readingLevel: "8th_grade",
      pov: "second_person",
    },
  });

const fillSeo = (m: OnboardingMachine) =>
  m.setFields({
    seo: {
      primarySchemaType: "Article",
      pillars: [{ slug: "guides", name: "Guides", intent: "informational" }],
    },
  });

const fillContentStorage = (m: OnboardingMachine) =>
  m.setFields({ contentStorage: { mode: "code" } });

describe("ONBOARDING_STEPS manifest", () => {
  it("defines exactly 7 steps", () => {
    expect(ONBOARDING_STEPS.length).toBe(7);
    expect(ONBOARDING_STEPS.map((s) => s.id)).toEqual([
      "identity",
      "audience-conversion",
      "brand",
      "seo-architecture",
      "content-ops-cms",
      "integrations",
      "launch-preview",
    ]);
  });

  it("total time budget is under 30 minutes", () => {
    expect(TOTAL_BUDGET_MINUTES).toBeLessThanOrEqual(30);
  });
});

describe("OnboardingMachine", () => {
  it("starts on identity, with identity active and others pending", () => {
    const m = new OnboardingMachine({ provider });
    const s = m.snapshot();
    expect(s.activeStepId).toBe("identity");
    expect(s.steps.identity).toBe("active");
    expect(s.steps["audience-conversion"]).toBe("pending");
  });

  it("blocks advance when required identity inputs are missing", () => {
    const m = new OnboardingMachine({ provider });
    const s = m.advance();
    expect(s.activeStepId).toBe("identity");
    expect(s.steps.identity).toBe("blocked");
    expect(Object.keys(s.errors).length).toBeGreaterThan(0);
  });

  it("advances through all 7 steps when inputs are filled", async () => {
    const m = new OnboardingMachine({ provider });
    fillIdentity(m);
    expect(m.advance().activeStepId).toBe("audience-conversion");
    fillAudienceConversion(m);
    expect(m.advance().activeStepId).toBe("brand");
    fillBrand(m);
    expect(m.advance().activeStepId).toBe("seo-architecture");
    fillSeo(m);
    expect(m.advance().activeStepId).toBe("content-ops-cms");
    fillContentStorage(m);
    expect(m.advance().activeStepId).toBe("integrations");
    expect(m.advance().activeStepId).toBe("launch-preview");
    const final = await m.finalize();
    expect(final.brief.identity.slug).toBe("career-hub");
    expect(final.confirmed.dbaProposals.length).toBeGreaterThan(0);
  });

  it("kicks off parallel research when a step starts", async () => {
    const m = new OnboardingMachine({ provider });
    fillIdentity(m);
    m.advance(); // enters audience-conversion → spawns proposeIcps + scoreToolFit
    const s = m.snapshot();
    const haveResearch = s.pendingResearch.concat(s.completedResearch);
    expect(haveResearch).toContain("proposeIcps");
    expect(haveResearch).toContain("scoreToolFit");
    await m.awaitResearch();
    const after = m.snapshot();
    expect(after.completedResearch).toContain("proposeIcps");
  });

  it("respects gate decisions in finalize", async () => {
    const m = new OnboardingMachine({ provider });
    fillIdentity(m);
    fillAudienceConversion(m);
    fillBrand(m);
    fillSeo(m);
    fillContentStorage(m);
    m.recordGateDecision({ gate: "toolFit", decision: "reject" });
    const final = await m.finalize();
    expect(final.confirmed.toolFit.score).toBe(0);
  });

  it("re-recording a gate decision replaces the prior one (idempotent edits)", async () => {
    const m = new OnboardingMachine({ provider });
    fillIdentity(m);
    fillAudienceConversion(m);
    fillBrand(m);
    fillSeo(m);
    fillContentStorage(m);
    m.recordGateDecision({ gate: "toolFit", decision: "reject" });
    m.recordGateDecision({ gate: "toolFit", decision: "accept" });
    const final = await m.finalize();
    // Accept means the original score is preserved (mock returns ~0.35 for non-calculator persona)
    expect(final.confirmed.toolFit.score).toBeGreaterThan(0);
  });
});
