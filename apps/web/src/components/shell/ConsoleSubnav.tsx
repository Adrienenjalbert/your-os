"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Console sub-navigation tabs. Sits just under the product TopBar and
 * mimics Search Console's section tabs — underline-on-active, generous
 * hover, no boxes.
 */
const TABS = [
  { href: "/console", label: "Home", match: (p: string) => p === "/console" },
  {
    href: "/console/queue",
    label: "Opportunity queue",
    match: (p: string) => p.startsWith("/console/queue"),
  },
  {
    href: "/console/briefs",
    label: "Briefs",
    match: (p: string) => p.startsWith("/console/briefs"),
  },
] as const;

export function ConsoleSubnav() {
  const pathname = usePathname() ?? "";
  return (
    <div className="border-b border-(--color-border) bg-(--color-surface)">
      <nav
        aria-label="Console sections"
        className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6"
      >
        {TABS.map((t) => {
          const active = t.match(pathname);
          return (
            <Link
              key={t.href}
              href={t.href}
              prefetch={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative px-3 py-3 text-sm font-medium transition",
                active
                  ? "text-(--color-fg-strong)"
                  : "text-(--color-muted-fg) hover:text-(--color-fg)",
              )}
            >
              {t.label}
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute right-3 -bottom-px left-3 h-0.5 rounded-full bg-(--color-accent)"
                />
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
