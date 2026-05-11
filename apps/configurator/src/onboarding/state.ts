import {
  type ConfirmedReport,
  type GateDecision,
  acceptAll,
  applyGateDecisions,
} from "../research/confirm-gates.js";
import type { ResearchProvider } from "../research/types.js";
/**
 * Onboarding state machine.
 *
 * UIs (web, CLI, console) drive this. The state machine:
 *   - Tracks which step is active and which steps are complete.
 *   - Holds parallel research-job promises so they continue running while
 *     the operator works on the next step.
 *   - Validates a partial Brief at each step boundary (so a user cannot
 *     advance past Identity without a valid slug).
 *   - Returns the final Brief + ConfirmedReport when the operator hits
 *     "Approve" on Step 7.
 */
import { type Brief, BriefSchema } from "../schema.js";
import {
  ONBOARDING_STEPS,
  type OnboardingStepId,
  type ResearchJobId,
  type StepDefinition,
  getStep,
} from "./steps.js";

export type StepStatus = "pending" | "active" | "complete" | "blocked";

export interface OnboardingSnapshot {
  activeStepId: OnboardingStepId;
  steps: Record<OnboardingStepId, StepStatus>;
  /** Validation errors from BriefSchema.partial() at the active step boundary. */
  errors: Record<string, string>;
  /** Research jobs in flight (unresolved promises). */
  pendingResearch: ResearchJobId[];
  /** Research jobs whose results are in the cache. */
  completedResearch: ResearchJobId[];
}

export interface OnboardingMachineOptions {
  provider: ResearchProvider;
  /** Initial brief draft (partial). */
  initial?: Partial<Brief>;
}

interface ResearchCacheEntry<T = unknown> {
  promise: Promise<T>;
  result?: T;
  error?: Error;
}

export class OnboardingMachine {
  private brief: Partial<Brief>;
  private gateDecisions: GateDecision[] = [];
  private status: Record<OnboardingStepId, StepStatus>;
  private active: OnboardingStepId = "identity";
  private cache = new Map<ResearchJobId, ResearchCacheEntry>();

  constructor(private opts: OnboardingMachineOptions) {
    this.brief = opts.initial ?? {};
    this.status = Object.fromEntries(
      ONBOARDING_STEPS.map((s, i) => [s.id, i === 0 ? "active" : "pending"] as const),
    ) as Record<OnboardingStepId, StepStatus>;
  }

  // --- inspection ---

  snapshot(): OnboardingSnapshot {
    return {
      activeStepId: this.active,
      steps: { ...this.status },
      errors: this.validateActive(),
      pendingResearch: [...this.cache.entries()]
        .filter(([, e]) => e.result === undefined && e.error === undefined)
        .map(([id]) => id),
      completedResearch: [...this.cache.entries()]
        .filter(([, e]) => e.result !== undefined)
        .map(([id]) => id),
    };
  }

  getBrief(): Partial<Brief> {
    return this.brief;
  }

  getActive(): StepDefinition {
    return getStep(this.active);
  }

  // --- mutation ---

  /** Patch the brief. Idempotent. */
  setFields(patch: Partial<Brief>): OnboardingSnapshot {
    this.brief = deepMerge(this.brief, patch);
    return this.snapshot();
  }

  /** Record a Confirmation-gate decision at the active step. */
  recordGateDecision(decision: GateDecision): void {
    // Replace any prior decision on the same gate so re-edits are idempotent.
    this.gateDecisions = this.gateDecisions.filter((d) => d.gate !== decision.gate);
    this.gateDecisions.push(decision);
  }

  // --- step transitions ---

  /**
   * Enter a step. Kicks off the step's parallelResearch jobs (idempotent).
   * Does NOT validate the destination step's inputs — those are about to be
   * collected. Validation runs at advance() time on the current step's
   * inputs.
   */
  enterStep(id: OnboardingStepId): OnboardingSnapshot {
    this.active = id;
    this.status[id] = "active";
    this.spawnResearchFor(id);
    return this.snapshot();
  }

  /** Mark the active step complete and advance to the next. */
  advance(): OnboardingSnapshot {
    const errors = this.validateActive();
    if (Object.keys(errors).length > 0) {
      this.status[this.active] = "blocked";
      return this.snapshot();
    }
    this.status[this.active] = "complete";
    const idx = ONBOARDING_STEPS.findIndex((s) => s.id === this.active);
    const next = ONBOARDING_STEPS[idx + 1];
    if (next) return this.enterStep(next.id);
    return this.snapshot();
  }

  // --- research orchestration ---

  /**
   * Kick off the parallel research jobs for a step. Cached: a job that has
   * already started (e.g. from a previous step pre-fetch) won't be re-run.
   */
  spawnResearchFor(stepId: OnboardingStepId): void {
    const step = getStep(stepId);
    for (const job of step.parallelResearch) {
      if (this.cache.has(job)) continue;
      const entry: ResearchCacheEntry = { promise: this.runJob(job) };
      entry.promise.then(
        (result) => {
          entry.result = result;
        },
        (error: Error) => {
          entry.error = error;
        },
      );
      this.cache.set(job, entry);
    }
  }

  /** Await all currently-spawned research; resolves once all are settled. */
  async awaitResearch(): Promise<void> {
    await Promise.allSettled([...this.cache.values()].map((e) => e.promise));
  }

  /** Get a job's result (waits if pending). */
  async getResearch<T = unknown>(job: ResearchJobId): Promise<T> {
    const entry = this.cache.get(job);
    if (!entry) {
      // Lazily spawn if the operator inspected before the step formally entered.
      this.cache.set(job, { promise: this.runJob(job) });
      return (await this.cache.get(job)!.promise) as T;
    }
    return (await entry.promise) as T;
  }

  // --- finalization ---

  /**
   * Final commit at Step 7. Returns the parsed Brief + ConfirmedReport using
   * any operator gate decisions, defaulting unspecified gates to 'accept'.
   */
  async finalize(): Promise<{ brief: Brief; confirmed: ConfirmedReport }> {
    const brief = BriefSchema.parse(this.brief);
    const decisions: GateDecision[] = [
      ...acceptAll().map((d) => this.gateDecisions.find((od) => od.gate === d.gate) ?? d),
    ];

    // Pull all research results (or run on-demand if a step was skipped).
    const [icpProposals, dbaProposals, pillarProposals, schema, toolFit] = await Promise.all([
      this.getResearch<Awaited<ReturnType<ResearchProvider["proposeIcps"]>>>("proposeIcps").catch(
        () => this.opts.provider.proposeIcps(brief),
      ),
      this.getResearch<Awaited<ReturnType<ResearchProvider["proposeDbas"]>>>("proposeDbas").catch(
        () => this.opts.provider.proposeDbas(brief),
      ),
      this.getResearch<Awaited<ReturnType<ResearchProvider["proposePillars"]>>>(
        "proposePillars",
      ).catch(() => this.opts.provider.proposePillars(brief)),
      this.getResearch<Awaited<ReturnType<ResearchProvider["selectPrimarySchema"]>>>(
        "selectPrimarySchema",
      ).catch(() => this.opts.provider.selectPrimarySchema(brief)),
      this.getResearch<Awaited<ReturnType<ResearchProvider["scoreToolFit"]>>>("scoreToolFit").catch(
        () => this.opts.provider.scoreToolFit(brief),
      ),
    ]);

    const confirmed = applyGateDecisions(
      {
        serp: [],
        keywordCluster: { primary: "", secondary: [], longtail: [], questions: [] },
        icpProposals,
        dbaProposals,
        pillarProposals,
        schema,
        toolFit,
      },
      decisions,
    );
    return { brief, confirmed };
  }

  // --- helpers ---

  private async runJob(job: ResearchJobId): Promise<unknown> {
    const p = this.opts.provider;
    switch (job) {
      case "serp": {
        const brief = this.brief;
        const q =
          `${brief.identity?.industry ?? ""} ${brief.audience?.primaryPersona?.name ?? ""}`.trim();
        return p.serp(q || "general", { limit: 10 });
      }
      case "keywordCluster": {
        const seed =
          this.brief.audience?.primaryPersona?.value ?? this.brief.identity?.industry ?? "general";
        return p.keywordCluster(seed);
      }
      case "proposeIcps":
        return p.proposeIcps(BriefSchema.parse(fillBriefDefaultsForResearch(this.brief)));
      case "proposeDbas":
        return p.proposeDbas(BriefSchema.parse(fillBriefDefaultsForResearch(this.brief)));
      case "proposePillars":
        return p.proposePillars(BriefSchema.parse(fillBriefDefaultsForResearch(this.brief)));
      case "selectPrimarySchema":
        return p.selectPrimarySchema(BriefSchema.parse(fillBriefDefaultsForResearch(this.brief)));
      case "scoreToolFit":
        return p.scoreToolFit(BriefSchema.parse(fillBriefDefaultsForResearch(this.brief)));
      default: {
        const _exhaustive: never = job;
        throw new Error(`Unknown research job: ${_exhaustive as string}`);
      }
    }
  }

  private validateActive(): Record<string, string> {
    return this.validateForStep(this.active);
  }

  private validateForStep(id: OnboardingStepId): Record<string, string> {
    const step = getStep(id);
    const errors: Record<string, string> = {};
    for (const path of step.inputs) {
      const v = readPath(this.brief, path);
      if (path.endsWith("strapi") && readPath(this.brief, "contentStorage.mode") !== "strapi") {
        continue;
      }
      if (v === undefined || v === null || v === "") {
        // The brief's own zod schema does the rich validation; this is just
        // a presence check at step boundaries.
        errors[path] = "required";
      }
    }
    return errors;
  }
}

// --- pure helpers ---

function deepMerge<A, B>(a: A, b: B): A & B {
  if (typeof a !== "object" || a === null) return b as A & B;
  if (typeof b !== "object" || b === null) return b as A & B;
  const out: Record<string, unknown> = { ...(a as Record<string, unknown>) };
  for (const [k, v] of Object.entries(b as Record<string, unknown>)) {
    out[k] = deepMerge((a as Record<string, unknown>)[k], v);
  }
  return out as A & B;
}

function readPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

/**
 * Fills minimal defaults so a research job can run before all inputs are
 * collected (e.g. ICP research kicks off after step 2 before step 3 inputs
 * are entered).
 */
function fillBriefDefaultsForResearch(b: Partial<Brief>): unknown {
  // Skip empty-string / nullish overrides so defaults survive a brief that
  // has been initialised with placeholder keys but no user input yet.
  // Without this, the UI's mount-time setFields({ identity: { name: "" } })
  // overrides the "draft" default and fails BriefSchema.parse.
  const keep = <T extends Record<string, unknown>>(o: T | undefined): Partial<T> => {
    if (!o) return {};
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o)) {
      if (v === undefined || v === null) continue;
      if (typeof v === "string" && v.trim() === "") continue;
      out[k] = v;
    }
    return out as Partial<T>;
  };
  return {
    identity: {
      name: "draft",
      slug: "draft",
      domain: "example.com",
      industry: "general",
      businessModel: "b2c",
      ...keep(b.identity),
    },
    audience: {
      primaryPersona: {
        name: "Operator",
        pain: "Needs a hub",
        value: "Wants a hub",
        ...keep(b.audience?.primaryPersona),
      },
      ...(b.audience?.primaryICP ? { primaryICP: b.audience.primaryICP } : {}),
    },
    conversion: {
      primary: "newsletter",
      ctaPattern: "Sign up",
      ...keep(b.conversion),
    },
    brand: {
      primaryDistinctiveAsset: "TBD",
      voiceTone: "warm",
      readingLevel: "8th_grade",
      pov: "second_person",
      ...keep(b.brand),
    },
    seo: {
      primarySchemaType: "Article",
      pillars: [{ slug: "guides", name: "Guides", intent: "informational" }],
      ...keep(b.seo),
    },
    contentStorage: b.contentStorage ?? { mode: "code" as const },
  };
}
