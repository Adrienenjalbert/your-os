"use client";

import { cn } from "@/lib/cn";
import { useCallback, useState, useTransition } from "react";

/**
 * AI propose button for the Customise panel.
 *
 * Calls /api/customise/propose/[section] which routes through the hybrid
 * provider factory (mock dev / live preview). The response is forwarded to
 * the parent as a typed payload — the parent decides how to render the
 * picker (DBA, ICP, Pillar, Schema, …).
 *
 * The M3 ratchet is < 5s p95 (mock) / < 25s p95 (live). The button records
 * its own duration so the parent page can show a "took Xms" hint.
 */
export interface ProposePayload<T = unknown> {
  section: string;
  durationMs: number;
  payload: { kind: string; items: T[] };
}

export function AiProposeButton({
  section,
  label,
  onProposed,
}: {
  section: string;
  label?: string;
  onProposed: (data: ProposePayload) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lastDurationMs, setLastDurationMs] = useState<number | null>(null);

  const propose = useCallback(() => {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/customise/propose/${section}`, { method: "POST" });
      const data = (await res.json()) as ProposePayload | { error: string };
      if ("error" in data) {
        setError(data.error);
        return;
      }
      setLastDurationMs(data.durationMs);
      onProposed(data);
    });
  }, [section, onProposed]);

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={propose}
        disabled={isPending}
        className={cn(
          "inline-flex h-7 items-center justify-center gap-1.5 rounded-md border border-(--color-border) bg-(--color-surface) px-2.5 text-xs font-medium text-(--color-fg) transition hover:border-(--color-accent) hover:text-(--color-accent)",
          isPending && "cursor-progress opacity-70",
        )}
        data-testid={`propose-${section}`}
      >
        <span aria-hidden="true" className="text-(--color-accent)">
          ✨
        </span>
        {isPending ? "Proposing…" : (label ?? "AI propose")}
      </button>
      {lastDurationMs !== null && !isPending ? (
        <span className="text-[11px] text-(--color-faint-fg)">{lastDurationMs}ms</span>
      ) : null}
      {error ? (
        <span className="text-xs text-(--color-danger)" role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}
