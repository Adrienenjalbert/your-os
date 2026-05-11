"use client";

import { cn } from "@/lib/cn";
import { useCallback, useEffect, useState } from "react";

/**
 * Design-partner mode: a small floating panel that the v1.1 design-partner
 * test instructions ask the user to enable. When on, it adds a Likert prompt
 * after each major surface (onboarding step, console approve, customise
 * commit). Recording the score posts to /api/telemetry under
 * `design_partner.likert`, joining the existing 11-event sink.
 *
 * The toggle is persisted to localStorage so the partner doesn't have to
 * re-enable it after every page load.
 *
 * Visual: a discreet pill in the bottom-right when collapsed, expanding to
 * a tiny card. Subdued by default — never competes with product chrome.
 */
const STORAGE_KEY = "your-os.design-partner-mode";

export function DesignPartnerMode() {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [recordedAt, setRecordedAt] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setEnabled(window.localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // localStorage unavailable; ignore.
      }
      return next;
    });
  }, []);

  const recordLikert = useCallback(
    async (score: number) => {
      if (!enabled) return;
      setRecordedAt(Date.now());
      const path = typeof window !== "undefined" ? window.location.pathname : "/";
      await fetch("/api/telemetry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "design_partner.likert",
          payload: { score, surface: path },
        }),
      }).catch(() => undefined);
    },
    [enabled],
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-xs font-medium text-(--color-muted-fg) shadow-md transition hover:border-(--color-border-strong) hover:text-(--color-fg)"
        aria-label="Open design-partner mode"
      >
        <span
          aria-hidden="true"
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            enabled ? "bg-(--color-success)" : "bg-(--color-faint-fg)",
          )}
        />
        DP
      </button>
    );
  }

  return (
    <aside
      aria-label="Design-partner mode"
      className="fixed right-4 bottom-4 z-40 w-72 overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface) text-xs shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-(--color-border) bg-(--color-surface-2) px-3 py-2">
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              enabled ? "bg-(--color-success)" : "bg-(--color-faint-fg)",
            )}
          />
          <strong className="text-sm font-semibold text-(--color-fg-strong)">
            Design-partner mode
          </strong>
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded p-1 text-(--color-muted-fg) hover:bg-(--color-surface) hover:text-(--color-fg)"
          aria-label="Hide design-partner mode"
        >
          ×
        </button>
      </div>
      <div className="space-y-3 p-3">
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={enabled}
            onChange={toggle}
            className="mt-0.5 accent-(--color-accent)"
          />
          <span className="text-(--color-fg)">Enable verbose telemetry + Likert prompts</span>
        </label>
        {enabled ? (
          <fieldset>
            <legend className="text-(--color-muted-fg)">How smooth was this surface?</legend>
            <div className="mt-2 grid grid-cols-5 gap-1.5" role="radiogroup">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  // biome-ignore lint/a11y/useSemanticElements: <button role="radio"> is intentional — using <input type="radio"> would force a form wrapper we don't want here, and we manage the radio-group selection state at the parent level.
                  role="radio"
                  aria-checked={false}
                  onClick={() => recordLikert(n)}
                  className="h-8 rounded-md border border-(--color-border) bg-(--color-surface) text-sm font-medium text-(--color-fg) transition hover:border-(--color-accent) hover:bg-(--color-accent-soft) hover:text-(--color-accent)"
                >
                  {n}
                </button>
              ))}
            </div>
            {recordedAt ? (
              <output className="mt-2 block text-(--color-success)">Recorded.</output>
            ) : null}
          </fieldset>
        ) : null}
      </div>
    </aside>
  );
}
