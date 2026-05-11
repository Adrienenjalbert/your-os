"use client";

import { cn } from "@/lib/cn";
import type {
  DbaProposal,
  IcpProposal,
  PillarProposal,
  SchemaSelection,
  ToolFitScore,
} from "@your-os/configurator";
import { useCallback, useMemo, useState } from "react";
import type { ProposePayload } from "../AiProposeButton";

/**
 * Renders the AI proposal payload as picker cards. The user selects N items
 * (single or multiple depending on the proposal kind), and on Apply we
 * translate the selection into `tenant.config.ts` patches the SectionForm
 * stages alongside any direct field edits.
 */
export function ProposalPicker({
  proposal,
  onApply,
}: {
  proposal: ProposePayload;
  onApply: (patches: Array<{ path: string; value: unknown }>) => void;
}) {
  const kind = proposal.payload.kind as "icps" | "dbas" | "pillars" | "schema" | "tool-fit";
  const items = proposal.payload.items ?? [];
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = useCallback((i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  const apply = useCallback(() => {
    const picked = Array.from(selected).map((i) => items[i]);
    const patches = buildPatches(kind, picked);
    onApply(patches);
  }, [items, kind, onApply, selected]);

  const cards = useMemo(() => {
    switch (kind) {
      case "icps":
        return (items as IcpProposal[]).map((it, i) => ({
          key: it.id ?? `icp-${i}`,
          title: it.role,
          subtitle: it.industry,
          body: (
            <>
              <p className="text-xs text-(--color-muted-fg)">Pain: {it.pain}</p>
              <p className="text-xs text-(--color-muted-fg)">CEP: {it.cep}</p>
            </>
          ),
        }));
      case "dbas":
        return (items as DbaProposal[]).map((it, i) => ({
          key: `dba-${i}`,
          title: it.value,
          subtitle: `${it.type} · target prevalence ${it.prevalenceTarget ?? 0.8}`,
          body: <p className="text-xs text-(--color-muted-fg)">{it.rationale}</p>,
        }));
      case "pillars":
        return (items as PillarProposal[]).map((it, i) => ({
          key: it.slug ?? `pillar-${i}`,
          title: it.name,
          subtitle: `${it.intent} · /${it.slug}`,
          body: (
            <p className="text-xs text-(--color-muted-fg)">
              Clusters: {it.topClusters.slice(0, 3).join(", ") || "—"}
            </p>
          ),
        }));
      case "schema":
        return (items as SchemaSelection[]).map((it, i) => ({
          key: `schema-${i}`,
          title: it.primary,
          subtitle: "primary schema.org type",
          body: <p className="text-xs text-(--color-muted-fg)">{it.rationale}</p>,
        }));
      case "tool-fit":
        return (items as ToolFitScore[]).map((it, i) => ({
          key: `toolfit-${i}`,
          title: `Score ${(it.score * 100).toFixed(0)}/100`,
          subtitle: it.suggestedTool?.kind ?? "n/a",
          body: <p className="text-xs text-(--color-muted-fg)">{it.rationale}</p>,
        }));
      default:
        return [];
    }
  }, [items, kind]);

  if (cards.length === 0) {
    return (
      <p className="text-sm text-(--color-muted-fg)">
        No proposals returned. Try again or check provider keys.
      </p>
    );
  }

  return (
    <div className="space-y-3" data-testid="proposal-picker">
      <ul className="grid gap-2 sm:grid-cols-2">
        {cards.map((c, i) => {
          const active = selected.has(i);
          return (
            <li key={c.key}>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={active}
                className={cn(
                  "block w-full rounded-lg border px-3 py-2.5 text-left shadow-sm transition",
                  active
                    ? "border-(--color-accent) bg-(--color-accent-soft) ring-2 ring-(--color-accent-soft)"
                    : "border-(--color-border) bg-(--color-surface) hover:border-(--color-accent) hover:bg-(--color-surface-2)",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={`text-sm font-semibold ${active ? "text-(--color-accent)" : "text-(--color-fg-strong)"}`}
                  >
                    {c.title}
                  </p>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[10px]",
                      active
                        ? "border-(--color-accent) bg-(--color-accent) text-(--color-accent-fg)"
                        : "border-(--color-border-strong) bg-(--color-surface)",
                    )}
                  >
                    {active ? "✓" : ""}
                  </span>
                </div>
                {c.subtitle ? (
                  <p className="mt-0.5 text-xs text-(--color-muted-fg)">{c.subtitle}</p>
                ) : null}
                <div className="mt-1.5">{c.body}</div>
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={apply}
        disabled={selected.size === 0}
        className={cn(
          "inline-flex h-9 items-center justify-center rounded-md bg-(--color-accent) px-3.5 text-sm font-semibold text-(--color-accent-fg) shadow-sm transition hover:bg-(--color-accent-hover)",
          selected.size === 0 &&
            "cursor-not-allowed bg-(--color-border-strong) text-(--color-muted-fg) shadow-none",
        )}
        data-testid="apply-proposal"
      >
        Apply {selected.size} selection{selected.size === 1 ? "" : "s"}
      </button>
    </div>
  );
}

function buildPatches(
  kind: "icps" | "dbas" | "pillars" | "schema" | "tool-fit",
  picked: unknown[],
): Array<{ path: string; value: unknown }> {
  switch (kind) {
    case "icps": {
      // Tenant ICPSchema accepts {id, role, industry?, cep?}. Drop fields
      // (`pain`) that are part of IcpProposal but not ICPSchema so the
      // PATCH passes Zod validation on commit.
      const value = (picked as IcpProposal[]).map((p) => ({
        id: p.id,
        role: p.role,
        ...(p.industry ? { industry: p.industry } : {}),
        ...(p.cep ? { cep: p.cep } : {}),
      }));
      return [{ path: "audience.icps", value }];
    }
    case "dbas": {
      // DistinctiveBrandAssetSchema only accepts {type, value, prevalenceTarget}.
      // Strip the `rationale` field that lives on the proposal but not the
      // tenant config, otherwise Zod's strict-by-default object rejects it.
      const value = (picked as DbaProposal[]).map((p) => ({
        type: p.type,
        value: p.value,
        prevalenceTarget: p.prevalenceTarget ?? 0.8,
      }));
      return [{ path: "brand.distinctiveAssets", value }];
    }
    case "pillars": {
      const value = (picked as PillarProposal[]).map((p) => ({
        slug: p.slug,
        name: p.name,
        intent: p.intent,
      }));
      return [{ path: "seo.pillars", value }];
    }
    case "schema": {
      const sel = picked[0] as SchemaSelection | undefined;
      if (!sel) return [];
      return [{ path: "seo.primarySchemaType", value: sel.primary }];
    }
    case "tool-fit":
      // tool-fit is informational only — we don't write a tenant.config field
      // for it directly; the tenant decides whether to add a tool to
      // tools.enabled themselves. Emit no patches.
      return [];
    default:
      return [];
  }
}
