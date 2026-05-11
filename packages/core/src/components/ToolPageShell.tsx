import type { ReactNode } from "react";
import { type Breadcrumb, Breadcrumbs } from "./Breadcrumbs.js";
import { PageContainer } from "./PageContainer.js";
import { PageSection } from "./PageSection.js";

export interface ToolPageShellProps {
  name: string;
  description: string;
  breadcrumbs?: Breadcrumb[];
  toolUi: ReactNode;
  results?: ReactNode;
  jsonLd?: object;
  faq?: ReactNode;
  related?: ReactNode;
}

export function ToolPageShell({
  name,
  description,
  breadcrumbs,
  toolUi,
  results,
  jsonLd,
  faq,
  related,
}: ToolPageShellProps) {
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
        <header className="mb-6">
          <h1 className="text-3xl font-semibold sm:text-4xl">{name}</h1>
          <p className="mt-3 text-lg text-black/70">{description}</p>
        </header>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>{toolUi}</div>
          <div>{results}</div>
        </div>
      </PageSection>
      {faq ? <PageSection>{faq}</PageSection> : null}
      {related ? <PageSection>{related}</PageSection> : null}
    </PageContainer>
  );
}
