import { Tag, type TagTone } from "@/components/ui/Tag";
import { cn } from "@/lib/cn";
import type { OpportunityQueueRow } from "@your-os/console";
import Link from "next/link";

const KIND_LABELS: Record<OpportunityQueueRow["kind"], string> = {
  "striking-distance": "Striking distance",
  "ctr-rescue": "CTR rescue",
  "schema-fix": "Schema fix",
  "link-injection": "Link injection",
  "cannibalization-consolidation": "Cannibalization",
  "template-extension": "Template extension",
  "linkable-asset": "Linkable asset",
};

const KIND_TONE: Record<OpportunityQueueRow["kind"], TagTone> = {
  "striking-distance": "accent",
  "ctr-rescue": "warn",
  "schema-fix": "warn",
  "link-injection": "neutral",
  "cannibalization-consolidation": "danger",
  "template-extension": "success",
  "linkable-asset": "success",
};

export function OpportunityRow({
  row,
  highlighted,
  briefHref,
}: {
  row: OpportunityQueueRow;
  highlighted?: boolean;
  /**
   * If a brief exists for this row, the entire row becomes a link to it.
   * If not, we render the same layout as a plain `<li>` so the daily-driver
   * "scan and click" loop still works for ranked items that already have
   * briefs, without breaking rows that don't.
   */
  briefHref?: string;
}) {
  const inner = (
    <div
      className={cn(
        "grid grid-cols-[2.5rem_1fr_auto_auto] items-center gap-4 px-4 py-3 text-sm transition",
        highlighted && "bg-(--color-accent-soft)/40",
      )}
    >
      <span className="font-mono text-xs text-(--color-faint-fg) tabular-nums">
        {String(row.rank + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Tag tone={KIND_TONE[row.kind]}>{KIND_LABELS[row.kind]}</Tag>
        </div>
        <p className="mt-1 truncate text-sm font-medium text-(--color-fg-strong)">{row.query}</p>
        <p className="mt-0.5 truncate text-xs text-(--color-muted-fg)">
          <span className="font-mono">{row.page}</span> · {row.reason}
        </p>
      </div>
      <span className="text-right">
        <span className="block font-mono text-sm font-semibold tabular-nums text-(--color-fg-strong)">
          +{row.liftClicks.toLocaleString()}
        </span>
        <span className="text-[11px] text-(--color-muted-fg)">clicks/mo</span>
      </span>
      <span className="text-right">
        <span className="block font-mono text-sm tabular-nums text-(--color-fg)">
          {row.liftPerEffort.toFixed(1)}
        </span>
        <span className="text-[11px] text-(--color-muted-fg)">lift/effort</span>
      </span>
    </div>
  );

  // Wrap in a link if we have a brief to drill into. Hover lifts the row
  // (subtle bg), and the open-in-new-tab affordance comes from the page
  // URL — no chevron chrome needed because the whole row is a hit target.
  return (
    <li
      data-rank={row.rank}
      data-highlighted={highlighted ? "true" : undefined}
      className="border-b border-(--color-border) last:border-b-0"
    >
      {briefHref ? (
        <Link
          href={briefHref}
          prefetch={false}
          className="block transition hover:bg-(--color-surface-2) focus:outline-none focus-visible:bg-(--color-surface-2) focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-inset"
        >
          {inner}
        </Link>
      ) : (
        <div className="hover:bg-(--color-surface-2)">{inner}</div>
      )}
    </li>
  );
}
