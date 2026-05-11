import { OnboardingStepClient } from "@/components/onboarding/OnboardingStepClient";
import { Stepper } from "@/components/shell/Stepper";
import { Tag } from "@/components/ui/Tag";
import { DEFAULT_MACHINE_ID, getMachine } from "@/server/machines";
import { ONBOARDING_STEPS, type OnboardingStepId, getStep } from "@your-os/configurator";
import { notFound } from "next/navigation";

const VALID_IDS: OnboardingStepId[] = ONBOARDING_STEPS.map((s) => s.id);

function isValidStepId(id: string): id is OnboardingStepId {
  return (VALID_IDS as string[]).includes(id);
}

export const dynamic = "force-dynamic";

export default async function OnboardingStepPage({
  params,
}: {
  params: Promise<{ stepId: string }>;
}) {
  const { stepId } = await params;
  if (!isValidStepId(stepId)) notFound();

  const machine = getMachine(DEFAULT_MACHINE_ID);
  // We deliberately do NOT call machine.enterStep here. Doing so would mutate
  // the active step on every page render, including any RSC prefetches the
  // Next.js router fires for sibling routes. Subsequent advance() calls would
  // then validate the wrong step. The client kicks the step over via the
  // /api/onboarding `enterStep` op once it mounts.
  const snapshot = machine.snapshot();

  const step = getStep(stepId);
  const completedIds = (
    Object.entries(snapshot.steps) as Array<
      [OnboardingStepId, (typeof snapshot.steps)[OnboardingStepId]]
    >
  )
    .filter(([, status]) => status === "complete")
    .map(([id]) => id);
  const blockedIds = (
    Object.entries(snapshot.steps) as Array<
      [OnboardingStepId, (typeof snapshot.steps)[OnboardingStepId]]
    >
  )
    .filter(([, status]) => status === "blocked")
    .map(([id]) => id);

  return (
    <>
      <Stepper activeId={stepId} completedIds={completedIds} blockedIds={blockedIds} />
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <section aria-labelledby="step-heading" className="min-w-0">
          <header className="mb-6">
            <h2
              id="step-heading"
              className="text-2xl font-semibold tracking-tight text-(--color-fg-strong)"
            >
              {step.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-(--color-muted-fg)">{step.oneLiner}</p>
            {step.hitlNote ? (
              <p className="mt-3 flex items-baseline gap-2 text-xs">
                <Tag tone="warn">HITL</Tag>
                <span className="text-(--color-muted-fg)">{step.hitlNote}</span>
              </p>
            ) : null}
          </header>
          <OnboardingStepClient
            machineId={DEFAULT_MACHINE_ID}
            stepId={stepId}
            initialSnapshot={snapshot}
            initialBrief={machine.getBrief()}
          />
        </section>
        {/* The research rail is the *value* — keep it visible. We drop the
            engineering "Inputs this step writes" card to a collapsible inside
            the form area so the sidebar reads as a single, useful column. */}
        <aside aria-label="AI research" className="lg:sticky lg:top-20 lg:self-start">
          <ActivityRail machineId={DEFAULT_MACHINE_ID} initialSnapshot={snapshot} />
        </aside>
      </div>
    </>
  );
}

// Local re-export so the (server) page file doesn't import the client wrapper
// directly — keeps the bundle boundary explicit.
import { ResearchActivityRail } from "@/components/ai/ResearchActivityRail";
import type { OnboardingSnapshot } from "@your-os/configurator";

function ActivityRail({
  machineId,
  initialSnapshot,
}: {
  machineId: string;
  initialSnapshot: OnboardingSnapshot;
}) {
  return <ResearchActivityRail machineId={machineId} initialSnapshot={initialSnapshot} />;
}
