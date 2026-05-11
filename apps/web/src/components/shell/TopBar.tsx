"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useKeyboard } from "./KeyboardProvider";

/**
 * Product TopBar shared by every surface.
 *
 * UX intent (Search Console / Drive): a thin, unobtrusive single-line bar.
 * Brand on the left, three underline tabs on the right, one keyboard hint at
 * the far right. No version chip, no "where am I" decoration — the active
 * tab itself is the answer.
 */
const SURFACES = [
  { id: "onboarding", label: "Onboarding", href: "/onboarding/identity", match: "/onboarding" },
  { id: "console", label: "Console", href: "/console", match: "/console" },
  { id: "customise", label: "Customise", href: "/customise", match: "/customise" },
] as const;

export function TopBar() {
  const pathname = usePathname();
  const { togglePalette } = useKeyboard();
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-(--color-border) bg-(--color-surface)/95 px-4 backdrop-blur sm:px-6">
      <Link
        href="/"
        prefetch={false}
        className="flex items-center gap-2 text-(--color-fg-strong) transition hover:opacity-80"
      >
        <span
          aria-hidden="true"
          className="grid h-6 w-6 place-items-center rounded-md border border-(--color-border) bg-(--color-surface-2) text-[10px] font-semibold text-(--color-fg)"
        >
          y
        </span>
        <span className="text-sm font-semibold tracking-tight">your-os</span>
      </Link>
      <nav aria-label="Surfaces" className="hidden h-full items-stretch gap-0 md:flex">
        {SURFACES.map((s) => {
          const active = pathname?.startsWith(s.match);
          return (
            <Link
              key={s.id}
              href={s.href}
              prefetch={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center px-4 text-sm font-medium transition",
                active
                  ? "text-(--color-fg-strong)"
                  : "text-(--color-muted-fg) hover:text-(--color-fg)",
              )}
            >
              {s.label}
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute right-3 -bottom-px left-3 h-0.5 rounded-t bg-(--color-accent)"
                />
              ) : null}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={togglePalette}
        className="hidden items-center gap-1.5 rounded-md border border-(--color-border) bg-(--color-surface) px-2 py-1 text-xs text-(--color-muted-fg) transition hover:border-(--color-border-strong) hover:text-(--color-fg) sm:flex"
        aria-label="Open command palette"
      >
        <span>Search</span>
        <kbd className="rounded border border-(--color-border) px-1 font-mono text-[10px]">⌘K</kbd>
      </button>
    </header>
  );
}
