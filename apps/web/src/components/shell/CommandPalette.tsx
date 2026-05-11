"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useKeyboard } from "./KeyboardProvider";

export interface PaletteItem {
  id: string;
  label: string;
  href: string;
  group: "Onboarding" | "Console" | "Customise" | "Briefs";
  hint?: string;
}

const STATIC_ITEMS: PaletteItem[] = [
  {
    id: "onb-identity",
    label: "Onboarding · Identity",
    href: "/onboarding/identity",
    group: "Onboarding",
  },
  {
    id: "onb-audience",
    label: "Onboarding · Audience & Conversion",
    href: "/onboarding/audience-conversion",
    group: "Onboarding",
  },
  {
    id: "onb-brand",
    label: "Onboarding · Brand & Voice",
    href: "/onboarding/brand",
    group: "Onboarding",
  },
  {
    id: "onb-seo",
    label: "Onboarding · SEO Architecture",
    href: "/onboarding/seo-architecture",
    group: "Onboarding",
  },
  {
    id: "onb-cms",
    label: "Onboarding · Content Ops & CMS",
    href: "/onboarding/content-ops-cms",
    group: "Onboarding",
  },
  {
    id: "onb-int",
    label: "Onboarding · Integrations",
    href: "/onboarding/integrations",
    group: "Onboarding",
  },
  {
    id: "onb-launch",
    label: "Onboarding · Launch Preview",
    href: "/onboarding/launch-preview",
    group: "Onboarding",
  },
  { id: "console-home", label: "Console · Home", href: "/console", group: "Console", hint: "g h" },
  {
    id: "console-queue",
    label: "Console · Opportunity queue",
    href: "/console/queue",
    group: "Console",
    hint: "g q",
  },
  {
    id: "cust-overview",
    label: "Customise · Overview & diff",
    href: "/customise",
    group: "Customise",
  },
  {
    id: "cust-identity",
    label: "Customise · Identity",
    href: "/customise/identity",
    group: "Customise",
  },
  {
    id: "cust-audience",
    label: "Customise · Audience",
    href: "/customise/audience",
    group: "Customise",
  },
  {
    id: "cust-brand",
    label: "Customise · Brand & DBAs",
    href: "/customise/brand",
    group: "Customise",
  },
  { id: "cust-seo", label: "Customise · SEO", href: "/customise/seo", group: "Customise" },
  {
    id: "cust-funnel",
    label: "Customise · Funnel intent map",
    href: "/customise/funnel",
    group: "Customise",
  },
  {
    id: "cust-int",
    label: "Customise · Integrations",
    href: "/customise/integrations",
    group: "Customise",
  },
  {
    id: "cust-bl",
    label: "Customise · Brand-lint thresholds",
    href: "/customise/brand-lint",
    group: "Customise",
  },
];

const GROUP_ORDER: PaletteItem["group"][] = ["Briefs", "Console", "Customise", "Onboarding"];

export function CommandPalette({ extraItems = [] }: { extraItems?: PaletteItem[] } = {}) {
  const { paletteOpen, closePalette } = useKeyboard();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const items = useMemo<PaletteItem[]>(() => [...STATIC_ITEMS, ...extraItems], [extraItems]);

  useEffect(() => {
    if (paletteOpen) {
      setQuery("");
      // Focus on next tick so the keypress that opened the palette doesn't
      // immediately type into the input.
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [paletteOpen]);

  const filtered = useMemo<PaletteItem[]>(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q) ||
        item.href.includes(q),
    );
  }, [query, items]);

  // Group results so the dropdown reads like a Spotlight / Raycast list.
  const grouped = useMemo<Array<{ group: PaletteItem["group"]; items: PaletteItem[] }>>(() => {
    const byGroup = new Map<PaletteItem["group"], PaletteItem[]>();
    for (const it of filtered) {
      const arr = byGroup.get(it.group) ?? [];
      arr.push(it);
      byGroup.set(it.group, arr);
    }
    return GROUP_ORDER.flatMap((g) => {
      const list = byGroup.get(g);
      return list ? [{ group: g, items: list }] : [];
    });
  }, [filtered]);

  if (!paletteOpen) return null;

  function handleSelect(item: PaletteItem) {
    closePalette();
    router.push(item.href);
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: <dialog> would force a different focus/close model; the inputRef autofocus + Escape handler above already implement modal semantics manually.
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismissal is mouse-only by design; keyboard users dismiss via the Escape handler bound in the parent effect.
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-50 flex items-start justify-center bg-(--color-fg-strong)/40 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={closePalette}
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation prevents the backdrop's mouse handler from firing; keyboard does not bubble click events so no equivalent handler is needed. */}
      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface) shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-(--color-border) px-4">
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="h-4 w-4 text-(--color-faint-fg)"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="M11 11l3 3" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filtered[0]) {
                e.preventDefault();
                handleSelect(filtered[0]);
              }
            }}
            placeholder="Jump to a step, brief, or settings panel…"
            className="w-full bg-transparent py-3 text-base outline-none placeholder:text-(--color-faint-fg)"
            aria-label="Search commands"
          />
        </div>
        <ul className="max-h-[60vh] overflow-y-auto py-1.5">
          {grouped.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-(--color-muted-fg)">No matches.</li>
          ) : (
            grouped.map(({ group, items: groupItems }) => (
              <li key={group}>
                <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-(--color-faint-fg)">
                  {group}
                </p>
                <ul>
                  {groupItems.map((item) => {
                    // Strip the "Surface · " prefix so the line reads as a
                    // single label; the group header above already tells you
                    // which surface you're targeting.
                    const trimmed = item.label.replace(/^[^·]+·\s*/, "");
                    return (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          onClick={() => closePalette()}
                          className="flex items-center justify-between gap-3 px-4 py-2 text-sm text-(--color-fg) transition hover:bg-(--color-surface-2)"
                        >
                          <span className="flex min-w-0 items-center gap-2 truncate">
                            <span aria-hidden="true" className="text-(--color-faint-fg)">
                              ›
                            </span>
                            <span className="truncate">{trimmed}</span>
                          </span>
                          {item.hint ? (
                            <kbd className="rounded border border-(--color-border) bg-(--color-surface) px-1.5 py-0.5 font-mono text-[11px] text-(--color-muted-fg)">
                              {item.hint}
                            </kbd>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>
        <div className="flex items-center justify-between gap-3 border-t border-(--color-border) bg-(--color-surface-2) px-4 py-2 text-[11px] text-(--color-muted-fg)">
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-(--color-border) bg-(--color-surface) px-1 font-mono">
              ↩
            </kbd>
            <span>open</span>
          </span>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-(--color-border) bg-(--color-surface) px-1 font-mono">
              ⌘K
            </kbd>
            <span>toggle</span>
          </span>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-(--color-border) bg-(--color-surface) px-1 font-mono">
              esc
            </kbd>
            <span>close</span>
          </span>
        </div>
      </div>
    </div>
  );
}
