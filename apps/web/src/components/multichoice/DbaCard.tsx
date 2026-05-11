import type { DbaProposal } from "@your-os/configurator";

export function DbaCardContent({ proposal }: { proposal: DbaProposal }) {
  const target = proposal.prevalenceTarget ?? 0.8;
  return (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-base font-medium">{proposal.value}</span>
        <span className="rounded-sm bg-(--color-muted) px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-(--color-muted-fg)">
          {proposal.type}
        </span>
      </div>
      <p className="mt-1 text-sm text-(--color-muted-fg)">{proposal.rationale}</p>
      <p className="mt-2 text-xs text-(--color-muted-fg)">
        Brand-lint will enforce ≥<span className="font-mono">{Math.round(target * 100)}%</span>{" "}
        prevalence (Romaniuk).
      </p>
    </>
  );
}
