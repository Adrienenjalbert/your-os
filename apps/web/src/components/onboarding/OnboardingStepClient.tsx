"use client";

import { ONBOARDING_STEPS_META as ONBOARDING_STEPS } from "@/lib/onboarding-meta";
import type {
  Brief,
  GateDecision,
  GateName,
  OnboardingSnapshot,
  OnboardingStepId,
} from "@your-os/configurator";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { AudienceConversionStep } from "./steps/AudienceConversionStep";
import { BrandStep } from "./steps/BrandStep";
import { ContentOpsCmsStep } from "./steps/ContentOpsCmsStep";
import { IdentityStep } from "./steps/IdentityStep";
import { IntegrationsStep } from "./steps/IntegrationsStep";
import { LaunchPreviewStep } from "./steps/LaunchPreviewStep";
import { SeoArchitectureStep } from "./steps/SeoArchitectureStep";

export interface OnboardingStepClientProps {
  machineId: string;
  stepId: OnboardingStepId;
  initialSnapshot: OnboardingSnapshot;
  initialBrief: Partial<Brief>;
}

export interface StepFormProps {
  brief: Partial<Brief>;
  errors: Record<string, string>;
  setFields(patch: Partial<Brief>): Promise<void>;
  recordGate(decision: GateDecision): Promise<void>;
  fetchResearch<T = unknown>(job: string): Promise<T>;
  machineId: string;
}

const NEXT_STEP: Record<OnboardingStepId, OnboardingStepId | null> = ONBOARDING_STEPS.reduce(
  (acc, step, i, all) => {
    acc[step.id] = (all[i + 1]?.id ?? null) as OnboardingStepId | null;
    return acc;
  },
  {} as Record<OnboardingStepId, OnboardingStepId | null>,
);

export function OnboardingStepClient({
  machineId,
  stepId,
  initialSnapshot,
  initialBrief,
}: OnboardingStepClientProps) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<OnboardingSnapshot>(initialSnapshot);
  const [brief, setBrief] = useState<Partial<Brief>>(initialBrief);
  const [pending, startTransition] = useTransition();
  const [advanceError, setAdvanceError] = useState<string | null>(null);
  const [finalized, setFinalized] = useState<{ slug: string } | null>(null);
  // Tracks any in-flight setFields/recordGate posts so we can await them
  // before advancing — otherwise an onBlur=commit fired by the Advance click
  // races the advance POST and the server validates a stale brief.
  const inFlightRef = useRef<Set<Promise<unknown>>>(new Set());
  // Serialize setFields posts so out-of-order responses can't overwrite the
  // user's most-recent keystroke with a stale partial brief.
  const setFieldsTailRef = useRef<Promise<unknown>>(Promise.resolve());

  // Hydrate from server in case nothing was provided (defensive — page is
  // server-rendered, but Next.js 15's RSC may stream stale snapshots).
  useEffect(() => {
    setSnapshot(initialSnapshot);
    setBrief(initialBrief);
  }, [initialSnapshot, initialBrief]);

  // Tell the server we have entered this step. This used to live in the page
  // server-component, but RSC prefetches were re-running the render for other
  // routes and clobbering machine.active. Doing it here ensures only an
  // *actual* mounted page enters its step. We register the request in the
  // in-flight set so a fast user advance() click waits for active to be set.
  useEffect(() => {
    const p = (async () => {
      const res = await fetch(`/api/onboarding/${machineId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ op: "enterStep", payload: { stepId } }),
      });
      const data = (await res.json()) as { snapshot: OnboardingSnapshot; brief: Partial<Brief> };
      setSnapshot(data.snapshot);
      setBrief(data.brief);
    })();
    inFlightRef.current.add(p);
    p.finally(() => inFlightRef.current.delete(p));
  }, [machineId, stepId]);

  const trackInFlight = useCallback(<T,>(p: Promise<T>): Promise<T> => {
    inFlightRef.current.add(p);
    p.finally(() => inFlightRef.current.delete(p));
    return p;
  }, []);

  const setFields = useCallback(
    (patch: Partial<Brief>) => {
      const tail = setFieldsTailRef.current;
      const p = (async () => {
        // Wait for the previous setFields to complete so server responses
        // arrive in the same order the user fired them.
        await tail.catch(() => undefined);
        const res = await fetch(`/api/onboarding/${machineId}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ op: "setFields", payload: patch }),
        });
        const data = (await res.json()) as { snapshot: OnboardingSnapshot; brief: Partial<Brief> };
        setSnapshot(data.snapshot);
        setBrief(data.brief);
      })();
      setFieldsTailRef.current = p;
      return trackInFlight(p);
    },
    [machineId, trackInFlight],
  );

  const recordGate = useCallback(
    (decision: GateDecision) => {
      const p = (async () => {
        await fetch(`/api/onboarding/${machineId}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ op: "recordGate", payload: decision }),
        });
      })();
      return trackInFlight(p);
    },
    [machineId, trackInFlight],
  );

  const fetchResearch = useCallback(
    async <T,>(job: string) => {
      const res = await fetch(`/api/research/${job}?machineId=${machineId}`);
      if (!res.ok) throw new Error(`research ${job} failed: HTTP ${res.status}`);
      const data = (await res.json()) as { result: T };
      return data.result;
    },
    [machineId],
  );

  const advance = useCallback(() => {
    setAdvanceError(null);
    // Force any focused input to blur so its onBlur=commit handler fires
    // *before* we ask the server to advance. Otherwise the user's last
    // keystroke never reaches the brief and the server validates a stale
    // partial brief and rejects the advance.
    if (typeof document !== "undefined") {
      (document.activeElement as HTMLElement | null)?.blur?.();
    }
    startTransition(async () => {
      // Yield a microtask so the synchronous blur's onBlur handler has a
      // chance to register its setFields promise into inFlightRef.
      await new Promise<void>((r) => setTimeout(r, 0));
      // Drain every pending setFields/recordGate so the server has the
      // user's latest values before we ask it to advance.
      while (inFlightRef.current.size > 0) {
        await Promise.all(Array.from(inFlightRef.current));
      }
      const res = await fetch(`/api/onboarding/${machineId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ op: "advance" }),
      });
      const data = (await res.json()) as {
        snapshot: OnboardingSnapshot;
        brief: Partial<Brief>;
        blocked: boolean;
      };
      setSnapshot(data.snapshot);
      setBrief(data.brief);
      if (data.blocked) {
        const errs = Object.entries(data.snapshot.errors)
          .map(([k, v]) => `${k}: ${v}`)
          .join("; ");
        setAdvanceError(errs || "Required fields missing.");
        return;
      }
      const nextId = NEXT_STEP[stepId];
      if (nextId) router.push(`/onboarding/${nextId}`);
    });
  }, [machineId, router, stepId]);

  const finalize = useCallback(() => {
    setAdvanceError(null);
    if (typeof document !== "undefined") {
      (document.activeElement as HTMLElement | null)?.blur?.();
    }
    startTransition(async () => {
      await new Promise<void>((r) => setTimeout(r, 0));
      while (inFlightRef.current.size > 0) {
        await Promise.all(Array.from(inFlightRef.current));
      }
      const res = await fetch(`/api/onboarding/${machineId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ op: "finalize" }),
      });
      if (!res.ok) {
        const txt = await res.text();
        setAdvanceError(`Finalize failed: ${txt}`);
        return;
      }
      const data = (await res.json()) as { brief: Brief };
      setFinalized({ slug: data.brief.identity.slug });
    });
  }, [machineId]);

  const stepProps: StepFormProps = {
    brief,
    errors: snapshot.errors,
    setFields,
    recordGate,
    fetchResearch,
    machineId,
  };

  const errCount = Object.keys(snapshot.errors).length;
  const ok = errCount === 0;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm">
        {renderStep(stepId, stepProps)}
      </div>

      {advanceError ? (
        <p
          role="alert"
          className="rounded-md border border-(--color-danger)/30 bg-(--color-danger-soft) px-3 py-2 text-sm text-(--color-danger)"
        >
          {advanceError}
        </p>
      ) : null}

      {finalized ? (
        <output className="block rounded-md border border-(--color-success)/30 bg-(--color-success-soft) px-3 py-2 text-sm text-(--color-success)">
          Tenant <span className="font-mono">{finalized.slug}</span> finalized. The scaffolder is
          ready to write your repo.
        </output>
      ) : null}

      <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-(--color-border) bg-(--color-bg)/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        {/* Single-state status: when fields are good, the bar is just the
            button (no celebratory pill). When something is missing, we
            inline-hint the count next to the disabled button. */}
        {ok ? (
          <span className="text-xs text-(--color-muted-fg)">
            {stepId === "launch-preview"
              ? "Ready to finalize the tenant."
              : "Press ↩ or click to continue."}
          </span>
        ) : (
          <p className="text-xs text-(--color-warn)">
            {errCount} field{errCount === 1 ? "" : "s"} left to fill.
          </p>
        )}
        {stepId === "launch-preview" ? (
          <button
            type="button"
            onClick={finalize}
            disabled={pending}
            data-testid="finalize-button"
            className="inline-flex h-9 items-center justify-center rounded-md bg-(--color-accent) px-4 text-sm font-medium text-(--color-accent-fg) shadow-sm transition hover:bg-(--color-accent-hover) disabled:cursor-not-allowed disabled:bg-(--color-border-strong) disabled:text-(--color-muted-fg) disabled:shadow-none"
          >
            {pending ? "Finalizing…" : "Finalize tenant"}
          </button>
        ) : (
          <button
            type="button"
            onClick={advance}
            disabled={pending}
            data-testid="advance-button"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-(--color-accent) px-4 text-sm font-medium text-(--color-accent-fg) shadow-sm transition hover:bg-(--color-accent-hover) disabled:cursor-not-allowed disabled:bg-(--color-border-strong) disabled:text-(--color-muted-fg) disabled:shadow-none"
          >
            <span>{pending ? "Saving…" : "Continue"}</span>
            <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </div>
  );
}

function renderStep(stepId: OnboardingStepId, props: StepFormProps) {
  switch (stepId) {
    case "identity":
      return <IdentityStep {...props} />;
    case "audience-conversion":
      return <AudienceConversionStep {...props} />;
    case "brand":
      return <BrandStep {...props} />;
    case "seo-architecture":
      return <SeoArchitectureStep {...props} />;
    case "content-ops-cms":
      return <ContentOpsCmsStep {...props} />;
    case "integrations":
      return <IntegrationsStep {...props} />;
    case "launch-preview":
      return <LaunchPreviewStep {...props} />;
    default: {
      const _exhaustive: never = stepId;
      throw new Error(`Unknown step: ${String(_exhaustive)}`);
    }
  }
}

// Re-export for convenience to GateName (used by step files via the StepFormProps shape).
export type { GateName };
