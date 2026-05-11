import { KpiCard } from "@/components/console/KpiCard";
import { HitlBanner } from "@/components/shell/HitlBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Surface, SurfaceHeader } from "@/components/ui/Surface";
import { Tag } from "@/components/ui/Tag";
import { loadHomeViewModel, loadOpportunityToBriefMap } from "@/server/console-data";
import Link from "next/link";

/**
 * Console Home — KPIs, recent activity, top opportunities, next-HITL banner.
 *
 * Renders the headless `homeViewModel` from `@your-os/console`. No business
 * logic lives here; UI is just labels + layout. Mock data is seeded by
 * `console-seed.ts` so M2 ratchets pass without external dependencies.
 */
export default async function ConsoleHomePage() {
  const [vm, briefByRank] = await Promise.all([loadHomeViewModel(), loadOpportunityToBriefMap()]);
  // What the user opened the page to act on. We compute this so the home
  // page's first sentence answers "what should I do next?" rather than
  // "here are 4 numbers + 2 lists".
  const draftBriefCount = vm.recentActivity.filter((a) => a.kind === "brief_drafted").length;
  const todoLine =
    draftBriefCount > 0
      ? `${draftBriefCount} brief${draftBriefCount === 1 ? "" : "s"} ready to review.`
      : null;
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <PageHeader
        title={
          <>
            Welcome, <span className="font-mono text-(--color-fg) text-2xl">{vm.tenantSlug}</span>
          </>
        }
        description="What changed this week, and what to ship next."
      />

      {todoLine ? (
        <Link
          href="/console/briefs"
          prefetch={false}
          className="group flex items-center justify-between gap-3 rounded-lg border border-(--color-accent)/30 bg-(--color-accent-soft)/60 px-4 py-3 transition hover:border-(--color-accent) hover:bg-(--color-accent-soft)"
        >
          <span className="flex items-baseline gap-2">
            <Tag tone="accent">Today</Tag>
            <span className="text-sm font-medium text-(--color-fg-strong)">{todoLine}</span>
          </span>
          <span
            aria-hidden="true"
            className="text-sm font-medium text-(--color-accent) transition group-hover:translate-x-0.5"
          >
            Review →
          </span>
        </Link>
      ) : null}

      <HitlBanner message={vm.nextHitlGate} />

      {/* 2-col on desktop so each metric reads as a hero number, not a tile.
          GA4 / Linear use this rhythm — generous whitespace, a single
          comparison line per metric. */}
      <section aria-labelledby="kpis-heading">
        <h2 id="kpis-heading" className="sr-only">
          KPIs
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2" data-testid="home-kpis">
          {vm.kpis.map((kpi) => (
            <li key={kpi.id}>
              <KpiCard kpi={kpi} />
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Surface aria-labelledby="top-opps">
          <SurfaceHeader
            title={<span id="top-opps">Top opportunities</span>}
            description="Ranked by lift-per-effort"
            actions={
              <Link
                href="/console/queue"
                className="text-sm font-medium text-(--color-accent) hover:underline"
              >
                View full queue →
              </Link>
            }
          />
          {vm.topOpportunities.length === 0 ? (
            <EmptyState
              className="mt-4"
              title="No opportunities ranked yet"
              description="Once GSC + GA4 pull data, ranked opportunities will appear here."
            />
          ) : (
            <ol className="mt-4 divide-y divide-(--color-border)">
              {vm.topOpportunities.map((opp, i) => {
                const briefHref = briefByRank.get(i);
                const body = (
                  <div className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Tag tone="accent">{opp.kind.replace(/_/g, " ")}</Tag>
                      </div>
                      <p className="mt-1.5 truncate text-sm text-(--color-fg-strong)">
                        {opp.query}
                      </p>
                    </div>
                    <p className="shrink-0 text-right text-xs">
                      <span className="block font-mono text-sm tabular-nums text-(--color-fg-strong)">
                        +{opp.liftClicks.toLocaleString()}
                      </span>
                      <span className="text-(--color-muted-fg)">clicks/mo</span>
                    </p>
                  </div>
                );
                return (
                  <li key={`${opp.kind}-${opp.query}-${i}`}>
                    {briefHref ? (
                      <Link
                        href={briefHref}
                        prefetch={false}
                        className="-mx-2 block rounded px-2 transition hover:bg-(--color-surface-2)"
                      >
                        {body}
                      </Link>
                    ) : (
                      body
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </Surface>

        <Surface aria-labelledby="activity-heading">
          <SurfaceHeader
            title={<span id="activity-heading">Recent activity</span>}
            description="Latest signals from across pillars"
          />
          {vm.recentActivity.length === 0 ? (
            <EmptyState
              className="mt-4"
              title="No activity yet"
              description="Activity from briefs, deploys, and integrations will surface here."
            />
          ) : (
            <ul className="mt-4 space-y-3">
              {vm.recentActivity.map((entry, i) => (
                <li key={`${entry.kind}-${entry.timestamp}-${i}`} className="flex gap-3 text-sm">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-border-strong)"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-(--color-muted-fg)">
                      {entry.kind.replace(/_/g, " ")}
                    </p>
                    <p className="mt-0.5 text-(--color-fg)">{entry.summary}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Surface>
      </div>
    </div>
  );
}
