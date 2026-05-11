import type { IcpProposal } from "@your-os/configurator";

export function IcpCardContent({ proposal }: { proposal: IcpProposal }) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-base font-medium">{proposal.role}</span>
        {proposal.industry ? (
          <span className="text-xs text-(--color-muted-fg)">{proposal.industry}</span>
        ) : null}
      </div>
      <dl className="mt-2 space-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="w-12 text-xs uppercase tracking-wider text-(--color-muted-fg)">Pain</dt>
          <dd className="flex-1">{proposal.pain}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-12 text-xs uppercase tracking-wider text-(--color-muted-fg)">CEP</dt>
          <dd className="flex-1">{proposal.cep}</dd>
        </div>
      </dl>
    </>
  );
}
