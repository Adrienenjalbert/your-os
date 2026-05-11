"use client";

import { cn } from "@/lib/cn";
import {
  ONBOARDING_STEPS_META as ONBOARDING_STEPS,
  type OnboardingStepIdLocal as OnboardingStepId,
  TOTAL_BUDGET_MINUTES_LOCAL as TOTAL_BUDGET_MINUTES,
} from "@/lib/onboarding-meta";
import Link from "next/link";
import { useMemo } from "react";

export interface StepperProps {
  activeId: OnboardingStepId;
  completedIds: OnboardingStepId[];
  blockedIds?: OnboardingStepId[];
}

/**
 * Numbered horizontal "rail" stepper inspired by Stripe / Google Cloud setup
 * wizards. UX intent for v1.1 simplification: only the active step shows its
 * label below the dot. Other labels live in the dot's `title` (and on hover)
 * so the rail reads as a single sentence: "Step 3 of 7 · Brand & Voice".
 *
 * The dots stay clickable so a user can jump forward/back; we just don't
 * shout every label all the time.
 */
export function Stepper({ activeId, completedIds, blockedIds = [] }: StepperProps) {
  const completedSet = useMemo(() => new Set(completedIds), [completedIds]);
  const blockedSet = useMemo(() => new Set(blockedIds), [blockedIds]);
  const activeIndex = ONBOARDING_STEPS.findIndex((s) => s.id === activeId);
  const activeStep = ONBOARDING_STEPS[activeIndex];
  const total = ONBOARDING_STEPS.length;
  const progressPct = activeIndex >= 0 ? Math.round((activeIndex / (total - 1)) * 100) : 0;

  return (
    <nav
      aria-label="Onboarding steps"
      className="border-b border-(--color-border) bg-(--color-surface) px-4 pt-5 pb-3 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <ol className="relative flex items-center justify-between">
          {/* Rail background line */}
          <div
            aria-hidden="true"
            className="absolute top-3 right-3 left-3 h-px bg-(--color-border)"
          />
          {/* Rail progress line */}
          <div
            aria-hidden="true"
            className="absolute top-3 left-3 h-px bg-(--color-accent) transition-all duration-300"
            style={{ width: `calc((100% - 1.5rem) * ${progressPct} / 100)` }}
          />
          {ONBOARDING_STEPS.map((step, i) => {
            const done = completedSet.has(step.id);
            const blocked = blockedSet.has(step.id);
            const active = step.id === activeId;
            return (
              <li key={step.id} className="relative">
                <Link
                  href={`/onboarding/${step.id}`}
                  // Prefetch is OFF on purpose: every step page calls
                  // OnboardingMachine.enterStep server-side, which mutates the
                  // active step. Prefetching all 7 links would race-set active
                  // to whichever prefetch resolved last and break advance().
                  prefetch={false}
                  aria-current={active ? "step" : undefined}
                  title={step.title}
                  className="group flex items-center gap-2 outline-none"
                >
                  <span
                    className={cn(
                      "relative z-10 grid h-6 w-6 place-items-center rounded-full border text-[11px] font-semibold transition",
                      active &&
                        "border-(--color-accent) bg-(--color-accent) text-(--color-accent-fg) shadow-sm ring-4 ring-(--color-accent-soft)",
                      !active &&
                        done &&
                        "border-(--color-accent) bg-(--color-accent) text-(--color-accent-fg)",
                      !active &&
                        !done &&
                        "border-(--color-border-strong) bg-(--color-surface) text-(--color-muted-fg) group-hover:border-(--color-accent) group-hover:text-(--color-fg)",
                      blocked && "ring-2 ring-(--color-warn)",
                    )}
                  >
                    {done && !active ? (
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        viewBox="0 0 12 12"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <title>Step complete</title>
                        <path
                          d="M2.5 6.5l2.5 2.5L9.5 3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
        {/* One quiet meta line. We surface the *next* step name so the
            user can see what they're heading toward, not just where they
            are — same affordance Stripe Atlas uses on its setup wizard. */}
        <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-(--color-muted-fg)">
          <span>
            Step <span className="font-mono text-(--color-fg)">{activeIndex + 1}</span> of{" "}
            <span className="font-mono">{total}</span>
            {activeStep ? (
              <>
                {" · "}
                <span className="text-(--color-fg-strong)">{activeStep.title}</span>
              </>
            ) : null}
          </span>
          {(() => {
            const nextStep = ONBOARDING_STEPS[activeIndex + 1];
            return nextStep ? (
              <span className="text-(--color-faint-fg)">Next: {nextStep.title}</span>
            ) : (
              <span className="text-(--color-faint-fg)">Final step</span>
            );
          })()}
          <span className="ml-auto font-mono">~{TOTAL_BUDGET_MINUTES}m total</span>
        </p>
      </div>
    </nav>
  );
}
