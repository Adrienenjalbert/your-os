import { CustomiseSection } from "@/components/customise/sections/CustomiseSection";
import { PageHeader } from "@/components/ui/PageHeader";
import { loadCustomiseConfig } from "@/server/customise-data";

export const dynamic = "force-dynamic";

const SCHEMA_OPTIONS = [
  { value: "Article", label: "Article" },
  { value: "BlogPosting", label: "BlogPosting" },
  { value: "HowTo", label: "HowTo" },
  { value: "FAQPage", label: "FAQPage" },
  { value: "Product", label: "Product" },
  { value: "JobPosting", label: "JobPosting" },
  { value: "Course", label: "Course" },
];

export default async function CustomiseSeoPage() {
  const tenant = await loadCustomiseConfig();
  return (
    <div className="max-w-4xl space-y-8">
      <PageHeader
        title="SEO"
        description="Primary schema type and content pillars. AI-propose pillars from your brief."
      />
      <CustomiseSection
        section="seo"
        proposeKind="seo"
        fields={[
          {
            kind: "select",
            path: "seo.primarySchemaType",
            label: "Primary schema type",
            initial: tenant.seo.primarySchemaType,
            options: SCHEMA_OPTIONS,
          },
        ]}
      />
    </div>
  );
}
