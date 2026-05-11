"use client";

import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/cn";
import type { TenantConfig } from "@your-os/tenant-config";
import { useCallback, useMemo, useState, useTransition } from "react";
import { type ConfigDiffEntry, ConfigDiffPreview } from "./ConfigDiffPreview";

/**
 * Generic Customise SectionForm.
 *
 * Per the v1.1 plan we render multi-choice first, free-text fallback. Each
 * field declares either an enum (rendered as radio chips), a multi-enum
 * (checkboxes), or text/number/textarea inputs. The "AI propose" button
 * (rendered separately by the page) hands proposals back to the parent via
 * `onApplyPatches` so this component doesn't need to know which section it's
 * editing.
 *
 * The form holds a local "pending" map of dotted-path → value. On submit we
 * dry-run a PATCH (validates without writing), render the diff, and only
 * commit when the user explicitly confirms.
 *
 * Visual: form rows on a calm white card; Preview / Commit live in a sticky
 * bottom bar so the user can act from any scroll position. Mirrors Search
 * Console's settings dialogs.
 */

export type SectionField =
  | {
      kind: "text";
      path: string;
      label: string;
      initial: string;
      required?: boolean;
      hint?: string;
    }
  | { kind: "textarea"; path: string; label: string; initial: string; rows?: number; hint?: string }
  | {
      kind: "number";
      path: string;
      label: string;
      initial: number;
      min?: number;
      max?: number;
      step?: number;
      hint?: string;
    }
  | {
      kind: "select";
      path: string;
      label: string;
      initial: string;
      options: ReadonlyArray<{ value: string; label: string; hint?: string }>;
      hint?: string;
    }
  | {
      kind: "multiselect";
      path: string;
      label: string;
      initial: string[];
      options: ReadonlyArray<{ value: string; label: string }>;
      hint?: string;
    };

interface DryRunResponse {
  committed: false;
  validated?: TenantConfig;
  diff?: ConfigDiffEntry[];
  error?: string;
}

interface CommitResponse {
  committed: true;
  validated: TenantConfig;
  diff: ConfigDiffEntry[];
}

const FIELD_INPUT_CLS =
  "block w-full rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm shadow-sm transition placeholder:text-(--color-faint-fg) focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent-soft)";

export function SectionForm({
  fields,
  externalPatches = [],
  onCommit,
}: {
  fields: SectionField[];
  /** Patches injected from the AI propose flow (e.g. apply N selected ICPs). */
  externalPatches?: Array<{ path: string; value: unknown }>;
  onCommit?: (validated: TenantConfig) => void;
}) {
  const [pending, setPending] = useState<Record<string, unknown>>({});
  const [diff, setDiff] = useState<ConfigDiffEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [committedAt, setCommittedAt] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const allPatches = useMemo(() => {
    const map = new Map<string, unknown>();
    for (const e of externalPatches) map.set(e.path, e.value);
    for (const [k, v] of Object.entries(pending)) map.set(k, v);
    return Array.from(map.entries()).map(([path, value]) => ({ path, value }));
  }, [externalPatches, pending]);

  const setField = useCallback((path: string, value: unknown) => {
    setPending((prev) => ({ ...prev, [path]: value }));
    setCommittedAt(null);
  }, []);

  const dryRun = useCallback(() => {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/tenant-config", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ patches: allPatches, commit: false }),
      });
      const data = (await res.json()) as DryRunResponse;
      if (data.error) {
        setError(data.error);
        setDiff([]);
      } else {
        setDiff(data.diff ?? []);
      }
    });
  }, [allPatches]);

  const commit = useCallback(() => {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/tenant-config", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ patches: allPatches, commit: true }),
      });
      if (!res.ok) {
        const data = (await res.json()) as DryRunResponse;
        setError(data.error ?? `commit failed (${res.status})`);
        return;
      }
      const data = (await res.json()) as CommitResponse;
      setDiff(data.diff);
      setPending({});
      setCommittedAt(Date.now());
      onCommit?.(data.validated);
    });
  }, [allPatches, onCommit]);

  const noPending = allPatches.length === 0;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm">
        <fieldset className="space-y-5">
          <legend className="sr-only">Section fields</legend>
          {fields.map((f) => (
            <FieldRenderer
              key={f.path}
              field={f}
              value={pending[f.path] ?? f.initial}
              onChange={(v) => setField(f.path, v)}
            />
          ))}
        </fieldset>
      </div>

      {externalPatches.length > 0 ? (
        <div
          className="flex items-start gap-2 rounded-md border border-(--color-accent)/30 bg-(--color-accent-soft) px-3 py-2 text-sm text-(--color-fg)"
          data-testid="ai-patches-applied"
        >
          <Tag tone="accent">AI</Tag>
          <p>
            {externalPatches.length} AI-proposed change
            {externalPatches.length === 1 ? "" : "s"} staged.
          </p>
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-(--color-danger)/30 bg-(--color-danger-soft) px-3 py-2 text-sm text-(--color-danger)"
        >
          {error}
        </p>
      ) : null}

      <section aria-labelledby="diff-heading" className="space-y-2">
        <h3
          id="diff-heading"
          className="text-xs font-medium uppercase tracking-wider text-(--color-muted-fg)"
        >
          Pending diff
        </h3>
        <ConfigDiffPreview diff={diff} />
      </section>

      <div
        className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-(--color-border) bg-(--color-bg)/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8"
        data-pending-count={allPatches.length}
      >
        <p className="text-xs text-(--color-muted-fg)">
          {noPending ? (
            "No pending changes."
          ) : (
            <>
              <span className="font-mono text-(--color-fg)">{allPatches.length}</span> pending
              change{allPatches.length === 1 ? "" : "s"}.
            </>
          )}
          {committedAt ? <span className="ml-2 text-(--color-success)">Committed.</span> : null}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={dryRun}
            disabled={isPending || noPending}
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-md border border-(--color-border) bg-(--color-surface) px-3.5 text-sm text-(--color-fg) transition hover:bg-(--color-surface-2)",
              (isPending || noPending) && "cursor-not-allowed opacity-50",
            )}
            data-testid="dry-run"
          >
            Preview diff
          </button>
          <button
            type="button"
            onClick={commit}
            disabled={isPending || noPending}
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-md bg-(--color-accent) px-3.5 text-sm font-semibold text-(--color-accent-fg) shadow-sm transition hover:bg-(--color-accent-hover)",
              (isPending || noPending) &&
                "cursor-not-allowed bg-(--color-border-strong) text-(--color-muted-fg) shadow-none",
            )}
            data-testid="commit"
          >
            Commit to tenant.config
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: SectionField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  switch (field.kind) {
    case "text":
      // The label text MUST equal exactly `${field.label}${required ? " *" : ""}`
      // because the M3 Playwright contract selects the input via
      // `getByRole("textbox", { name: "Name *", exact: true })`.
      return (
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-(--color-fg-strong)">
            {field.label}
            {field.required ? " *" : ""}
          </span>
          {field.hint ? (
            <span className="block text-xs text-(--color-muted-fg)">{field.hint}</span>
          ) : null}
          <input
            type="text"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={FIELD_INPUT_CLS}
          />
        </label>
      );
    case "textarea":
      return (
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-(--color-fg-strong)">{field.label}</span>
          {field.hint ? (
            <span className="block text-xs text-(--color-muted-fg)">{field.hint}</span>
          ) : null}
          <textarea
            rows={field.rows ?? 4}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={cn(FIELD_INPUT_CLS, "leading-relaxed")}
          />
        </label>
      );
    case "number":
      return (
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-(--color-fg-strong)">{field.label}</span>
          {field.hint ? (
            <span className="block text-xs text-(--color-muted-fg)">{field.hint}</span>
          ) : null}
          <input
            type="number"
            min={field.min}
            max={field.max}
            step={field.step}
            value={Number(value ?? 0)}
            onChange={(e) => onChange(Number(e.target.value))}
            className={cn(FIELD_INPUT_CLS, "w-32")}
          />
        </label>
      );
    case "select":
      return (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-(--color-fg-strong)">{field.label}</legend>
          {field.hint ? (
            <span className="block text-xs text-(--color-muted-fg)">{field.hint}</span>
          ) : null}
          <ul className="grid gap-2 sm:grid-cols-2">
            {field.options.map((opt) => {
              const active = (value as string) === opt.value;
              const id = `${field.path}-${opt.value}`;
              return (
                <li key={opt.value}>
                  <label
                    htmlFor={id}
                    className={cn(
                      "flex cursor-pointer items-baseline gap-2 rounded-md border px-3 py-2 text-sm shadow-sm transition",
                      active
                        ? "border-(--color-accent) bg-(--color-accent-soft) ring-2 ring-(--color-accent-soft)"
                        : "border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-2)",
                    )}
                  >
                    <input
                      id={id}
                      type="radio"
                      name={field.path}
                      value={opt.value}
                      checked={active}
                      onChange={() => onChange(opt.value)}
                      className="sr-only"
                    />
                    <span
                      className={
                        active
                          ? "font-medium text-(--color-accent)"
                          : "font-medium text-(--color-fg)"
                      }
                    >
                      {opt.label}
                    </span>
                    {opt.hint ? (
                      <span className="text-xs text-(--color-muted-fg)">{opt.hint}</span>
                    ) : null}
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      );
    case "multiselect": {
      const selected = new Set((value as string[]) ?? []);
      return (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-(--color-fg-strong)">{field.label}</legend>
          {field.hint ? (
            <span className="block text-xs text-(--color-muted-fg)">{field.hint}</span>
          ) : null}
          <ul className="flex flex-wrap gap-2">
            {field.options.map((opt) => {
              const active = selected.has(opt.value);
              const id = `${field.path}-${opt.value}`;
              return (
                <li key={opt.value}>
                  <label
                    htmlFor={id}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition select-none",
                      active
                        ? "border-(--color-accent) bg-(--color-accent-soft) text-(--color-accent)"
                        : "border-(--color-border) bg-(--color-surface) text-(--color-muted-fg) hover:border-(--color-border-strong) hover:text-(--color-fg)",
                    )}
                  >
                    <input
                      id={id}
                      type="checkbox"
                      checked={active}
                      onChange={(e) => {
                        const next = new Set(selected);
                        if (e.target.checked) next.add(opt.value);
                        else next.delete(opt.value);
                        onChange(Array.from(next));
                      }}
                      className="sr-only"
                    />
                    <span>{opt.label}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      );
    }
  }
}
