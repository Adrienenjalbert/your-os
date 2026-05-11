"use client";

import { BriefOutline } from "@/components/console/BriefOutline";
import { useConsoleAction } from "@/components/shell/KeyboardProvider";
import { Surface, SurfaceHeader } from "@/components/ui/Surface";
import { Tag, type TagTone } from "@/components/ui/Tag";
import { cn } from "@/lib/cn";
import {
  type BriefDraft,
  type BriefEditorState,
  briefEditorReducer,
  briefEditorViewModel,
} from "@your-os/console";
import type { TenantConfig } from "@your-os/tenant-config";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

/**
 * Brief editor surface.
 *
 * Wires:
 *   - briefEditorReducer (Approve / Reject) into local React state.
 *   - cmd-enter → "approve-brief" via useConsoleAction.
 *   - intentCtaCheck (rule 070) is rendered inline as block / warn.
 *   - Approve and Reject fire telemetry with durationFromOpenMs (see
 *     `apps/web/src/server/telemetry.ts` for the event taxonomy).
 *
 * Visual: Search-Console-detail layout — eyebrow + hero title, supporting
 * meta tags below, content sections in calm cards, a sticky bottom action
 * bar so Approve / Reject are reachable at any scroll position.
 */
export function BriefEditor({
  initialDraft,
  tenant,
}: {
  initialDraft: BriefDraft;
  tenant: Pick<TenantConfig, "funnel">;
}) {
  const router = useRouter();
  const openedAt = useRef<number>(Date.now());
  const reducer = useCallback(
    (state: BriefEditorState, action: Parameters<typeof briefEditorReducer>[1]) =>
      briefEditorReducer(state, action, tenant),
    [tenant],
  );
  const [state, dispatch] = useReducer(reducer, {
    brief: initialDraft,
    blockedReason: null,
  });
  const [pendingApprove, setPendingApprove] = useState(false);

  const vm = useMemo(() => briefEditorViewModel(state.brief, tenant), [state.brief, tenant]);

  const recordOutcome = useCallback(
    async (kind: "approved" | "rejected") => {
      const eventName = kind === "approved" ? "console.brief.approved" : "console.brief.rejected";
      const durationFromOpenMs = Date.now() - openedAt.current;
      await fetch("/api/telemetry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: eventName,
          payload: { briefId: state.brief.id, durationFromOpenMs },
        }),
      }).catch(() => undefined);
    },
    [state.brief.id],
  );

  const onApprove = useCallback(() => {
    if (state.brief.status !== "draft") return;
    setPendingApprove(true);
    dispatch("approve-brief");
  }, [state.brief.status]);

  const onReject = useCallback(() => {
    if (state.brief.status !== "draft") return;
    dispatch("reject-brief");
    void recordOutcome("rejected");
  }, [state.brief.status, recordOutcome]);

  // Fire approve telemetry once the reducer has committed the new status.
  useEffect(() => {
    if (pendingApprove && state.brief.status === "approved") {
      void recordOutcome("approved");
      setPendingApprove(false);
    }
  }, [pendingApprove, state.brief.status, recordOutcome]);

  // Bind keyboard actions ↔ reducer.
  useConsoleAction("approve-brief", onApprove);
  useConsoleAction("reject-brief", onReject);
  useConsoleAction("edit-brief", () => {
    // M2 surface is read-only; M3 wires real edit. Bounce to /customise so the
    // shortcut still does something useful and is observable in telemetry.
    router.push("/customise/funnel");
  });
  useConsoleAction("go-back", () => router.push("/console/queue"));

  const statusTone: TagTone =
    vm.status === "approved"
      ? "success"
      : vm.status === "rejected"
        ? "danger"
        : vm.status === "shipped"
          ? "accent"
          : "neutral";

  return (
    <article aria-labelledby="brief-title" className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs text-(--color-faint-fg)">Brief #{vm.briefId}</p>
        <h2
          id="brief-title"
          className="text-2xl font-semibold tracking-tight text-(--color-fg-strong) sm:text-3xl"
        >
          {vm.title}
        </h2>
        {/* Quiet meta row. Intent + CTA + status fit on one line and get out
            of the way of the IntentCtaPanel verdict below. The "status: …"
            literal is intentional — the M2 ratchet asserts on it. */}
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--color-muted-fg)">
          <span>
            intent <span className="font-mono text-(--color-fg)">{vm.intent}</span>
          </span>
          <span aria-hidden="true" className="text-(--color-border-strong)">
            ·
          </span>
          <span>
            CTA <span className="font-mono text-(--color-fg)">{vm.primaryCta}</span>
          </span>
          <span aria-hidden="true" className="text-(--color-border-strong)">
            ·
          </span>
          <span className="inline-flex items-center gap-1.5">
            status: <Tag tone={statusTone}>{vm.status}</Tag>
          </span>
        </p>
      </header>

      <BriefOutline brief={state.brief} />

      <IntentCtaPanel check={vm.intentCtaCheck} />

      {vm.forecast ? (
        <Surface aria-labelledby="forecast-heading">
          <SurfaceHeader
            title={<span id="forecast-heading">ROOS forecast</span>}
            description="Modeled clicks per pillar at d30 / d60 / d90"
          />
          <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
            {(["d30", "d60", "d90"] as const).map((w) => {
              const band = vm.forecast?.[w];
              if (!band) return null;
              return (
                <div
                  key={w}
                  className="rounded-md border border-(--color-border) bg-(--color-surface-2) p-3"
                >
                  <dt className="text-xs font-medium uppercase tracking-wider text-(--color-muted-fg)">
                    {w}
                  </dt>
                  <dd className="mt-1 font-mono text-sm tabular-nums text-(--color-fg-strong)">
                    {band.low.toFixed(0)} – {band.mid.toFixed(0)} – {band.high.toFixed(0)}
                  </dd>
                </div>
              );
            })}
          </dl>
        </Surface>
      ) : null}

      {state.blockedReason ? (
        <p
          role="alert"
          className="rounded-md border border-(--color-danger)/30 bg-(--color-danger-soft) px-3 py-2 text-sm text-(--color-danger)"
        >
          Cannot approve: {state.blockedReason}
        </p>
      ) : null}

      <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-(--color-border) bg-(--color-bg)/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <p className="text-xs text-(--color-muted-fg)">{vm.hint}</p>
        <div className="flex items-center gap-3">
          {/* Reject is a quiet text button — destructive actions are usually
              the wrong default, and the keyboard shortcut is the main path. */}
          <button
            type="button"
            disabled={state.brief.status !== "draft"}
            onClick={onReject}
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-md px-2 text-sm text-(--color-muted-fg) transition hover:bg-(--color-surface-2) hover:text-(--color-fg)",
              state.brief.status !== "draft" && "cursor-not-allowed opacity-40",
            )}
            data-testid="reject-brief"
          >
            Reject
          </button>
          <button
            type="button"
            disabled={state.brief.status !== "draft"}
            onClick={onApprove}
            className={cn(
              "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-(--color-accent) px-4 text-sm font-semibold text-(--color-accent-fg) shadow-sm transition hover:bg-(--color-accent-hover)",
              state.brief.status !== "draft" &&
                "cursor-not-allowed bg-(--color-border-strong) text-(--color-muted-fg) shadow-none",
            )}
            data-testid="approve-brief"
          >
            <span>Approve</span>
            <kbd className="hidden rounded border border-(--color-accent-fg)/30 px-1 font-mono text-[10px] sm:inline">
              ⌘↩
            </kbd>
          </button>
        </div>
      </div>
    </article>
  );
}

function IntentCtaPanel({
  check,
}: {
  check: ReturnType<typeof briefEditorViewModel>["intentCtaCheck"];
}) {
  if (check.ok) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-(--color-success)/30 bg-(--color-success-soft) px-3 py-2 text-sm text-(--color-success)">
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="mt-0.5 h-4 w-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p>Intent ↔ CTA aligned (rule 070).</p>
      </div>
    );
  }
  const tone =
    check.severity === "block"
      ? "border-(--color-danger)/30 bg-(--color-danger-soft) text-(--color-danger)"
      : "border-(--color-warn)/30 bg-(--color-warn-soft) text-(--color-warn)";
  return (
    <div
      role="alert"
      className={cn("rounded-md border px-3 py-2 text-sm", tone)}
      data-severity={check.severity}
    >
      <p className="font-semibold">
        {check.severity === "block" ? "Blocked by intent-CTA check" : "Intent-CTA warning"}
      </p>
      <p className="mt-0.5">{check.reason}</p>
      <p className="mt-1 text-xs">
        Allowed CTAs: <span className="font-mono">{check.allowedCtas.join(", ") || "—"}</span>
      </p>
    </div>
  );
}
