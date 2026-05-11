import { PageHeader } from "@/components/ui/PageHeader";
import { Surface } from "@/components/ui/Surface";
import { Tag } from "@/components/ui/Tag";
import { loadCustomiseConfig } from "@/server/customise-data";
import { readTenantConfig } from "@/server/tenant-store";
import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Customise overview.
 *
 * Per AUDIENCE.md: the Growth lead and the SEO lead don't edit every section
 * with equal frequency. Identity + Funnel get tuned often (post-launch
 * naming, intent-CTA exceptions); Brand + SEO get tuned monthly; Audience
 * + Integrations + Brand-lint are typically set once and forgotten.
 *
 * The overview reflects that ranking — "Most-edited" up top, "Tune
 * occasionally" below — so first-time and returning users both land on the
 * panel that's most likely to be useful.
 */
interface SectionLink {
  href: string;
  label: string;
  description: string;
}

const MOST_EDITED: SectionLink[] = [
  {
    href: "/customise/identity",
    label: "Identity",
    description: "Hub name, slug, domain, business model.",
  },
  {
    href: "/customise/funnel",
    label: "Funnel",
    description: "Allowed and forbidden CTAs per intent. Drives the brand-lint check.",
  },
  {
    href: "/customise/brand",
    label: "Brand & DBAs",
    description: "Distinctive brand assets, voice, and tone.",
  },
];

const OCCASIONAL: SectionLink[] = [
  {
    href: "/customise/seo",
    label: "SEO",
    description: "Pillars, schema, intent-mapping defaults.",
  },
  {
    href: "/customise/audience",
    label: "Audience",
    description: "Personas, ICPs, and category-entry points.",
  },
  {
    href: "/customise/integrations",
    label: "Integrations",
    description: "CRM, email, GSC, and analytics connectors.",
  },
  {
    href: "/customise/brand-lint",
    label: "Brand-lint",
    description: "DBA prevalence and citation density rules.",
  },
];

export default async function CustomiseOverviewPage() {
  const onDisk = await readTenantConfig();
  const effective = await loadCustomiseConfig();
  return (
    <div className="space-y-8">
      <PageHeader
        title="Customise"
        description={
          onDisk
            ? "Pick a section. Changes preview as a diff before they touch tenant.config.ts."
            : "No tenant.config.ts on disk yet — you're editing the seed. Commit any section to persist."
        }
        actions={
          <Tag tone={onDisk ? "success" : "neutral"}>{onDisk ? "Persisted" : "Seed only"}</Tag>
        }
      />

      <SectionGroup
        heading="Most-edited"
        helper="The three you'll touch every couple of weeks."
        links={MOST_EDITED}
      />

      <SectionGroup
        heading="Tune occasionally"
        helper="Set once, revisit when something changes upstream."
        links={OCCASIONAL}
      />

      {/* Raw config — engineering escape hatch only, kept low-emphasis. */}
      <details className="text-xs">
        <summary className="inline-flex cursor-pointer items-center gap-1.5 text-(--color-faint-fg) hover:text-(--color-fg)">
          <span>View raw tenant.config.ts</span>
          <span aria-hidden="true" className="font-mono">
            ›
          </span>
        </summary>
        <Surface padding="none" className="mt-2 overflow-hidden">
          <pre className="max-h-[60vh] overflow-auto bg-(--color-surface-2) p-4 font-mono text-xs leading-relaxed text-(--color-fg)">
            {JSON.stringify(effective, null, 2)}
          </pre>
        </Surface>
      </details>
    </div>
  );
}

function SectionGroup({
  heading,
  helper,
  links,
}: {
  heading: string;
  helper: string;
  links: SectionLink[];
}) {
  return (
    <section aria-labelledby={`group-${heading.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2
          id={`group-${heading.toLowerCase().replace(/\s+/g, "-")}`}
          className="text-xs font-semibold uppercase tracking-wider text-(--color-muted-fg)"
        >
          {heading}
        </h2>
        <p className="text-xs text-(--color-faint-fg)">{helper}</p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {links.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="group block h-full rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-3 transition hover:border-(--color-border-strong) hover:bg-(--color-surface-2)"
            >
              <h3 className="text-sm font-semibold text-(--color-fg-strong) group-hover:text-(--color-accent)">
                {s.label}
              </h3>
              <p className="mt-0.5 text-xs text-(--color-muted-fg)">{s.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
