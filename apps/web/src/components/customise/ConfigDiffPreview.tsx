"use client";

import { useMemo } from "react";

export interface ConfigDiffEntry {
  path: string;
  before: unknown;
  after: unknown;
}

/**
 * Side-by-side current vs pending tenant.config.ts.
 *
 * M3 ratchet: the diff render must complete in <100ms. We achieve that by
 * staying in pure JSON.stringify pretty-printed strings (no syntax
 * highlighting, no virtualisation needed at v1.1 scale — top-level keys
 * only). Visual mimics a code review diff with subdued surface tints.
 */
export function ConfigDiffPreview({ diff }: { diff: ConfigDiffEntry[] }) {
  const entries = useMemo(() => diff, [diff]);
  if (entries.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-(--color-border) bg-(--color-surface) px-3 py-4 text-center text-sm text-(--color-muted-fg)">
        No pending changes.
      </p>
    );
  }
  return (
    <ul className="space-y-3" data-testid="config-diff">
      {entries.map((d) => (
        <li
          key={d.path}
          className="overflow-hidden rounded-lg border border-(--color-border) bg-(--color-surface) shadow-sm"
        >
          <p className="border-b border-(--color-border) bg-(--color-surface-2) px-3 py-1.5 font-mono text-xs text-(--color-fg)">
            {d.path}
          </p>
          <div className="grid grid-cols-2 divide-x divide-(--color-border) text-xs">
            <div>
              <p className="border-b border-(--color-border) bg-(--color-danger-soft)/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-(--color-danger)">
                Before
              </p>
              <pre className="max-h-64 overflow-auto p-3 font-mono leading-relaxed text-(--color-muted-fg)">
                {format(d.before)}
              </pre>
            </div>
            <div>
              <p className="border-b border-(--color-border) bg-(--color-success-soft)/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-(--color-success)">
                After
              </p>
              <pre className="max-h-64 overflow-auto p-3 font-mono leading-relaxed text-(--color-fg-strong)">
                {format(d.after)}
              </pre>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function format(v: unknown): string {
  if (v === undefined) return "(unset)";
  return JSON.stringify(v, null, 2);
}
