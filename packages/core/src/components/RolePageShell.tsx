import type { ReactNode } from "react";
import { type Breadcrumb, Breadcrumbs } from "./Breadcrumbs.js";
import { PageContainer } from "./PageContainer.js";
import { PageSection } from "./PageSection.js";

export interface RolePageShellProps {
  roleName: string;
  cityName?: string;
  payRangeLabel: string;
  breadcrumbs?: Breadcrumb[];
  primaryCta?: { label: string; href: string };
  jsonLd?: object;
  children: ReactNode;
}

/**
 * Career Hub-style role x city page shell. Generic enough that other tenants
 * can reuse the shape; pSEO-engine emits one of these per role x city cell.
 */
export function RolePageShell({
  roleName,
  cityName,
  payRangeLabel,
  breadcrumbs,
  primaryCta,
  jsonLd,
  children,
}: RolePageShellProps) {
  const headline = cityName ? `${roleName} jobs in ${cityName}` : `${roleName} jobs`;
  return (
    <PageContainer>
      {jsonLd ? (
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is required server-rendered.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      {breadcrumbs ? <Breadcrumbs trail={breadcrumbs} /> : null}
      <PageSection>
        <h1 className="text-3xl font-semibold sm:text-4xl">{headline}</h1>
        <p className="mt-3 text-lg font-medium text-[var(--color-brand-primary,#3b82f6)]">
          {payRangeLabel}
        </p>
        {primaryCta ? (
          <a
            href={primaryCta.href}
            className="mt-6 inline-block rounded-md bg-[var(--color-brand-primary,#3b82f6)] px-5 py-3 font-medium text-white"
          >
            {primaryCta.label}
          </a>
        ) : null}
      </PageSection>
      <PageSection>
        <div className="prose prose-neutral max-w-none">{children}</div>
      </PageSection>
    </PageContainer>
  );
}
