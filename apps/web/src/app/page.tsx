import { PageHeader } from "@/components/ui/PageHeader";
import { readTenantConfig } from "@/server/tenant-store";
import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Router landing — what you see when you open the web shell with no path.
 *
 * UX intent (Google Cloud "Resume project" pattern): we infer the single most
 * likely next step from on-disk state and promote it as the only primary CTA.
 * Everything else demotes to a quiet row of secondary links so a first-time
 * user is not asked to choose between three top-level surfaces.
 */
export default async function HomeRouterPage() {
  const tenant = await readTenantConfig();
  const hasTenant = tenant !== null;

  // The primary action depends on whether a tenant exists. We pick *one* to
  // anchor the page; the others stay reachable via the secondary row + the
  // top-bar surface tabs.
  const primary = hasTenant
    ? {
        href: "/console",
        label: "Open the console",
        sub: `Tenant ${tenant.identity.slug} · KPIs, queue, and brief editor.`,
      }
    : {
        href: "/onboarding/identity",
        label: "Start onboarding",
        sub: "Seven multi-choice steps. About 30 minutes. AI does the research for you.",
      };

  // Secondary surfaces are sized down so they read as "you can also" rather
  // than "pick one of three".
  const secondary: Array<{ href: string; label: string; sub: string }> = hasTenant
    ? [
        {
          href: "/customise",
          label: "Customise",
          sub: "Tune identity, audience, brand, SEO, funnel.",
        },
        {
          href: "/onboarding/identity",
          label: "Re-run onboarding",
          sub: "Re-research and rebuild the brief.",
        },
      ]
    : [
        {
          href: "/console",
          label: "Preview the console",
          sub: "See KPIs, queue, and the brief editor with seed data.",
        },
        {
          href: "/customise",
          label: "Browse settings",
          sub: "Inspect every tenant.config.ts surface.",
        },
      ];

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 sm:py-28">
      <PageHeader
        eyebrow="your-os"
        title={hasTenant ? "Welcome back." : "Let's set up your hub."}
        description={
          hasTenant
            ? "Pick up where you left off, or jump into a different surface."
            : "One shell, three surfaces. Most people start with onboarding."
        }
      />

      <Link
        href={primary.href}
        prefetch={false}
        className="mt-10 flex items-center justify-between gap-4 rounded-xl bg-(--color-accent) px-6 py-5 text-(--color-accent-fg) shadow-sm transition hover:bg-(--color-accent-hover) hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)"
      >
        <span className="min-w-0">
          <span className="block text-base font-semibold">{primary.label}</span>
          <span className="mt-1 block text-sm text-(--color-accent-fg)/85">{primary.sub}</span>
        </span>
        <span aria-hidden="true" className="text-xl">
          →
        </span>
      </Link>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {secondary.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              prefetch={false}
              className="group flex h-full flex-col rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-3 transition hover:border-(--color-border-strong)"
            >
              <span className="text-sm font-medium text-(--color-fg-strong) group-hover:text-(--color-accent)">
                {s.label}
              </span>
              <span className="mt-0.5 text-xs text-(--color-muted-fg)">{s.sub}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
