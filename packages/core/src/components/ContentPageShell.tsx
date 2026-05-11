import type { ReactNode } from "react";
import { type Breadcrumb, Breadcrumbs } from "./Breadcrumbs.js";
import { PageContainer } from "./PageContainer.js";
import { PageSection } from "./PageSection.js";

export interface ContentPageShellProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  authorByline?: ReactNode;
  contentFreshness?: ReactNode;
  jsonLd?: object;
  children: ReactNode;
}

/**
 * Article / guide shell. Renders title, breadcrumbs, EEAT signals (byline +
 * freshness), and a JSON-LD script tag. Body comes from children.
 */
export function ContentPageShell({
  title,
  description,
  breadcrumbs,
  authorByline,
  contentFreshness,
  jsonLd,
  children,
}: ContentPageShellProps) {
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
      <PageSection as="article">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
          {description ? <p className="mt-3 text-lg text-black/70">{description}</p> : null}
          <div className="mt-4 flex items-center gap-4 text-sm text-black/60">
            {authorByline}
            {contentFreshness}
          </div>
        </header>
        <div className="prose prose-neutral max-w-none">{children}</div>
      </PageSection>
    </PageContainer>
  );
}
