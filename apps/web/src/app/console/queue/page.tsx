import { OpportunityRow } from "@/components/console/OpportunityRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Surface } from "@/components/ui/Surface";
import { loadOpportunityQueueViewModel, loadOpportunityToBriefMap } from "@/server/console-data";
import type { OpportunityKind } from "@your-os/control-plane";
import Link from "next/link";

const ALL_KINDS: OpportunityKind[] = [
  "striking-distance",
  "ctr-rescue",
  "schema-fix",
  "link-injection",
  "cannibalization-consolidation",
  "template-extension",
  "linkable-asset",
];

const KIND_LABELS: Record<OpportunityKind, string> = {
  "striking-distance": "Striking distance",
  "ctr-rescue": "CTR rescue",
  "schema-fix": "Schema fix",
  "link-injection": "Link injection",
  "cannibalization-consolidation": "Cannibalization",
  "template-extension": "Template extension",
  "linkable-asset": "Linkable asset",
};

function parseKindParam(raw: string | string[] | undefined): OpportunityKind[] {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : raw.split(",");
  return list.filter((k): k is OpportunityKind => (ALL_KINDS as string[]).includes(k));
}

export default async function ConsoleQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string | string[]; q?: string }>;
}) {
  const params = await searchParams;
  const kinds = parseKindParam(params.kind);
  const queryFilter = typeof params.q === "string" && params.q ? params.q : undefined;
  const [vm, briefByRank] = await Promise.all([
    loadOpportunityQueueViewModel({ kinds, queryFilter }),
    loadOpportunityToBriefMap(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Console"
        title="Opportunity queue"
        description={`Showing ${vm.shownCount} of ${vm.totalOpportunities}. Sorted by lift-per-effort.`}
      />

      {/* Search-led filter row. Kind chips collapse behind a disclosure so
          the page opens with one input + one button — Search Console's
          "Filter by query" pattern. */}
      <form method="get" className="space-y-3" aria-label="Queue filters">
        <div className="flex items-center gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Search by page or query</span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--color-faint-fg)"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 16 16"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <title>Search</title>
                <circle cx="7" cy="7" r="4.5" />
                <path d="M11 11l3 3" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="search"
              name="q"
              defaultValue={queryFilter ?? ""}
              placeholder="Search by page or query"
              className="block h-10 w-full rounded-md border border-(--color-border) bg-(--color-surface) pr-3 pl-9 text-sm shadow-sm focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent-soft)"
            />
          </label>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-md bg-(--color-accent) px-4 text-sm font-medium text-(--color-accent-fg) shadow-sm hover:bg-(--color-accent-hover)"
          >
            Search
          </button>
        </div>
        <details className="group" {...(kinds.length > 0 ? { open: true } : {})}>
          <summary className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-(--color-muted-fg) hover:text-(--color-fg)">
            <svg
              aria-hidden="true"
              viewBox="0 0 12 12"
              className="h-3 w-3 transition group-open:rotate-90"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Filter by kind
            {kinds.length > 0 ? (
              <span className="ml-1 rounded-full bg-(--color-accent-soft) px-2 py-0.5 font-mono text-[10px] text-(--color-accent)">
                {kinds.length}
              </span>
            ) : null}
            {kinds.length > 0 ? (
              <Link
                href="/console/queue"
                className="ml-2 text-(--color-faint-fg) underline hover:text-(--color-fg)"
              >
                clear
              </Link>
            ) : null}
          </summary>
          <fieldset className="mt-2 flex flex-wrap gap-2">
            <legend className="sr-only">Filter by kind</legend>
            {ALL_KINDS.map((k) => {
              const active = kinds.includes(k);
              const count = vm.groupCounts[k];
              return (
                <label
                  key={k}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition select-none ${
                    active
                      ? "border-(--color-accent) bg-(--color-accent-soft) text-(--color-accent)"
                      : "border-(--color-border) bg-(--color-surface) text-(--color-muted-fg) hover:border-(--color-border-strong) hover:text-(--color-fg)"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="kind"
                    value={k}
                    defaultChecked={active}
                    className="sr-only"
                  />
                  {KIND_LABELS[k]}
                  {count ? (
                    <span
                      className={`rounded px-1 font-mono text-[10px] ${
                        active
                          ? "bg-(--color-accent)/10 text-(--color-accent)"
                          : "bg-(--color-surface-2) text-(--color-faint-fg)"
                      }`}
                    >
                      {count}
                    </span>
                  ) : null}
                </label>
              );
            })}
          </fieldset>
        </details>
      </form>

      {vm.rows.length === 0 ? (
        <EmptyState
          title="No opportunities match the current filters"
          description="Try removing a kind or clearing the search."
        />
      ) : (
        <Surface padding="none" className="overflow-hidden">
          <ul aria-label="Ranked opportunities">
            {vm.rows.map((row, i) => (
              <OpportunityRow
                key={row.rank}
                row={row}
                highlighted={i === 0}
                briefHref={briefByRank.get(row.rank)}
              />
            ))}
          </ul>
        </Surface>
      )}

      <p className="text-xs text-(--color-muted-fg)">
        Use{" "}
        <kbd className="rounded border border-(--color-border) bg-(--color-surface) px-1.5 font-mono text-[11px]">
          j
        </kbd>{" "}
        /{" "}
        <kbd className="rounded border border-(--color-border) bg-(--color-surface) px-1.5 font-mono text-[11px]">
          k
        </kbd>{" "}
        to navigate,{" "}
        <kbd className="rounded border border-(--color-border) bg-(--color-surface) px-1.5 font-mono text-[11px]">
          ⌘K
        </kbd>{" "}
        to jump to a brief.
      </p>
    </div>
  );
}
