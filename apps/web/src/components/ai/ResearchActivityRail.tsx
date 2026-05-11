"use client";

import { cn } from "@/lib/cn";
import type { OnboardingSnapshot, ResearchJobId } from "@your-os/configurator";
import { useEffect, useState } from "react";

/**
 * Job names → user-facing outcomes.
 *
 * The headless ResearchJobId values are engineering names (`proposeIcps`,
 * `selectPrimarySchema`). A Growth lead reading "selectPrimarySchema · ready"
 * learns nothing; the same person reading "Picked the right schema.org type
 * for your hub" knows what just happened. We name jobs by their *output* so
 * the rail feels like an assistant reporting in, not a CI build log.
 */
const JOB_OUTCOME: Record<ResearchJobId, string> = {
  serp: "Scanned the top SERPs",
  keywordCluster: "Clustered the keyword space",
  proposeIcps: "Suggested ICPs",
  proposeDbas: "Drafted distinctive brand assets",
  proposePillars: "Mapped the pillar tree",
  selectPrimarySchema: "Picked the right schema type",
  scoreToolFit: "Scored tool-vs-article fit",
};

export interface ResearchActivityRailProps {
  initialSnapshot: OnboardingSnapshot;
  machineId: string;
  /** Polling interval ms; 0 disables the poll (test hook). */
  pollMs?: number;
}

export function ResearchActivityRail({
  initialSnapshot,
  machineId,
  pollMs = 1500,
}: ResearchActivityRailProps) {
  const [snapshot, setSnapshot] = useState<OnboardingSnapshot>(initialSnapshot);

  useEffect(() => {
    if (pollMs <= 0) return;
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/onboarding/${machineId}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ op: "snapshot" }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { snapshot: OnboardingSnapshot };
        if (alive) setSnapshot(data.snapshot);
      } catch {
        // network blips are fine; we'll retry on the next tick.
      }
    };
    const t = setInterval(tick, pollMs);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [machineId, pollMs]);

  // Group by status so the eye reads "Done (3) → Running (1)" instead of
  // a randomly-ordered list of 7 jobs in 2 states.
  const done = snapshot.completedResearch;
  const running = snapshot.pendingResearch.filter((j) => !done.includes(j));

  if (done.length === 0 && running.length === 0) {
    return (
      <aside
        aria-label="AI research activity"
        className="rounded-lg border border-dashed border-(--color-border) p-3 text-xs text-(--color-muted-fg)"
      >
        AI research starts when you fill in the first fields.
      </aside>
    );
  }

  return (
    <aside
      aria-label="AI research activity"
      className="rounded-lg border border-(--color-border) bg-(--color-surface) p-3"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-(--color-muted-fg)">
          AI research
        </h2>
        <span className="text-[11px] text-(--color-faint-fg)">
          {done.length} done
          {running.length > 0 ? ` · ${running.length} running` : ""}
        </span>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {done.map((job) => (
          <RailItem key={job} job={job} state="done" />
        ))}
        {running.map((job) => (
          <RailItem key={job} job={job} state="running" />
        ))}
      </ul>
    </aside>
  );
}

function RailItem({ job, state }: { job: ResearchJobId; state: "done" | "running" }) {
  return (
    <li className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className={cn(
          "inline-block h-2 w-2 rounded-full",
          state === "done" ? "bg-(--color-success)" : "animate-pulse bg-(--color-warn)",
        )}
      />
      <span className={state === "done" ? "text-(--color-fg)" : "text-(--color-muted-fg)"}>
        {JOB_OUTCOME[job]}
      </span>
    </li>
  );
}
