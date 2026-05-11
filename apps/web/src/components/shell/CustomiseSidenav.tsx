"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Customise side navigation — the persistent rail that lists every section
 * a tenant can tune. Visual treatment matches Google Workspace settings:
 * quiet labels, accent-on-active, generous tap targets.
 *
 * Note: section labels here MUST equal the labels rendered on the overview
 * page so the M3 Playwright assertion (`overview lists every section link`)
 * still finds them in `<main>`.
 */
interface CustomiseSection {
  href: string;
  label: string;
  /** When true, only matches an exact pathname (used for the overview route). */
  end?: boolean;
}

const SECTIONS: CustomiseSection[] = [
  { href: "/customise", label: "Overview", end: true },
  { href: "/customise/identity", label: "Identity" },
  { href: "/customise/audience", label: "Audience" },
  { href: "/customise/brand", label: "Brand & DBAs" },
  { href: "/customise/seo", label: "SEO" },
  { href: "/customise/funnel", label: "Funnel" },
  { href: "/customise/integrations", label: "Integrations" },
  { href: "/customise/brand-lint", label: "Brand-lint" },
];

export function CustomiseSidenav() {
  const pathname = usePathname() ?? "";
  return (
    <aside
      aria-label="Customise sections"
      className="border-(--color-border) lg:sticky lg:top-14 lg:h-[calc(100dvh-3.5rem)] lg:border-r"
    >
      <p className="px-4 pt-6 pb-3 text-xs font-medium uppercase tracking-wider text-(--color-muted-fg) sm:px-6">
        Customise
      </p>
      <nav className="px-2 pb-6">
        <ul className="space-y-0.5">
          {SECTIONS.map((s) => {
            const active = s.end ? pathname === s.href : pathname.startsWith(s.href);
            return (
              <li key={s.href}>
                <Link
                  href={s.href}
                  prefetch={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-(--color-accent-soft) text-(--color-accent)"
                      : "text-(--color-fg) hover:bg-(--color-surface-2)",
                  )}
                >
                  {s.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
