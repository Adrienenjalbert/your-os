import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Surface } from "@/components/ui/Surface";
import { Tag, type TagTone } from "@/components/ui/Tag";
import { loadBriefsIndex } from "@/server/console-data";
import Link from "next/link";

/**
 * Briefs index — the inbox view.
 *
 * Per AUDIENCE.md the Growth lead's daily job is "approve briefs from the
 * queue". Before this page existed, the subnav tab "Briefs" hard-jumped to
 * `brief-001`, which dropped users straight into editing one brief instead
 * of letting them scan and pick. This page is the missing list.
 *
 * Layout: section per status (Draft → Approved → Shipped). Each row is a
 * full-bleed link with title + opportunity kind + age. No metric chrome —
 * the editor itself shows that detail. This page is just "pick which one
 * to work on".
 */
const STATUS_TONE: Record<"draft" | "approved" | "shipped", TagTone> = {
  draft: "neutral",
  approved: "success",
  shipped: "accent",
};

const STATUS_ORDER: Array<"draft" | "approved" | "shipped"> = ["draft", "approved", "shipped"];

export default async function BriefsIndexPage() {
  const { briefs, counts } = await loadBriefsIndex();
  const byStatus = STATUS_ORDER.map((s) => ({
    status: s,
    items: briefs.filter((b) => b.status === s),
  }));

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="Briefs"
        description={
          counts.total === 0
            ? "No briefs yet — approve opportunities in the queue to draft briefs."
            : `${counts.draft} draft · ${counts.approved} approved · ${counts.shipped} shipped`
        }
      />

      {counts.total === 0 ? (
        <EmptyState
          title="No briefs in this tenant yet"
          description="Approve an opportunity from the queue to draft your first brief."
          action={
            <Link
              href="/console/queue"
              className="inline-flex h-9 items-center justify-center rounded-md bg-(--color-accent) px-4 text-sm font-medium text-(--color-accent-fg) shadow-sm hover:bg-(--color-accent-hover)"
            >
              Open the queue
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {byStatus.map(({ status, items }) => {
            if (items.length === 0) return null;
            return (
              <section key={status} aria-labelledby={`status-${status}`}>
                <h2
                  id={`status-${status}`}
                  className="mb-2 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-(--color-muted-fg)"
                >
                  <Tag tone={STATUS_TONE[status]}>{status}</Tag>
                  <span>{items.length}</span>
                </h2>
                <Surface padding="none" className="overflow-hidden">
                  <ul>
                    {items.map((b) => (
                      <li key={b.id} className="border-b border-(--color-border) last:border-b-0">
                        <Link
                          href={b.href}
                          prefetch={false}
                          className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-(--color-surface-2) focus:outline-none focus-visible:bg-(--color-surface-2)"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-(--color-fg-strong)">
                              {b.title}
                            </span>
                            <span className="mt-0.5 block text-xs text-(--color-muted-fg)">
                              {b.opportunityKind.replace(/-/g, " ")} · ~
                              {b.estimatedClicks.toLocaleString()} clicks/mo · updated{" "}
                              {timeSince(b.updatedAt)}
                            </span>
                          </span>
                          <span aria-hidden="true" className="shrink-0 text-(--color-faint-fg)">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Surface>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Render an ISO timestamp as "3h ago" / "2d ago" / "just now". */
function timeSince(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return "just now";
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
