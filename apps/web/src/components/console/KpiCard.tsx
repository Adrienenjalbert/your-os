import type { HomeKpi } from "@your-os/console";
import Link from "next/link";

/**
 * Per .agents/rules/050-growth-lead-priorities.md every KPI surface must show
 * a comparison string. The TS type already enforces this at the view-model
 * boundary; we accept HomeKpi directly so the contract isn't re-implemented.
 *
 * Visual: GA4-style stacked tile — small label up top, oversized value mid,
 * comparison string at the bottom in muted text. The test contract requires
 * the three paragraph order: label, value, comparison.
 */
export function KpiCard({ kpi }: { kpi: HomeKpi }) {
  const positive = isPositiveDelta(kpi.comparison);
  const negative = isNegativeDelta(kpi.comparison);
  const body = (
    <div className="group flex h-full flex-col gap-3 rounded-lg border border-(--color-border) bg-(--color-surface) px-5 py-5 shadow-sm transition hover:border-(--color-border-strong) hover:shadow-md">
      <p className="text-xs font-medium uppercase tracking-wider text-(--color-muted-fg)">
        {kpi.label}
      </p>
      <p className="text-4xl font-semibold tabular-nums tracking-tight text-(--color-fg-strong)">
        {kpi.value}
      </p>
      <p
        className={`text-xs ${
          positive
            ? "text-(--color-success)"
            : negative
              ? "text-(--color-danger)"
              : "text-(--color-muted-fg)"
        }`}
      >
        {positive ? "▲ " : negative ? "▼ " : ""}
        {kpi.comparison}
      </p>
    </div>
  );
  return kpi.drilldownUrl ? (
    <Link
      href={kpi.drilldownUrl}
      className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
    >
      {body}
    </Link>
  ) : (
    body
  );
}

function isPositiveDelta(s: string): boolean {
  // Heuristic: comparison strings often start with "+" / "▲" or "up …".
  return /^(\+|▲|up\b)/i.test(s.trim());
}
function isNegativeDelta(s: string): boolean {
  return /^(-|▼|down\b)/i.test(s.trim());
}
