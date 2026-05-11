import type { PillarProposal } from "@your-os/configurator";

export function PillarCardContent({ proposal }: { proposal: PillarProposal }) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-base font-medium">{proposal.name}</span>
        <span className="rounded-sm bg-(--color-muted) px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-(--color-muted-fg)">
          {proposal.intent}
        </span>
      </div>
      <p className="mt-1 font-mono text-xs text-(--color-muted-fg)">/{proposal.slug}</p>
      {proposal.topClusters.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-1 text-xs">
          {proposal.topClusters.slice(0, 4).map((c) => (
            <li
              key={c}
              className="rounded border border-(--color-border) bg-(--color-bg) px-1.5 py-0.5"
            >
              {c}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
