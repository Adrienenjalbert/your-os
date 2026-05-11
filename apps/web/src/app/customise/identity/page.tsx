import { CustomiseSection } from "@/components/customise/sections/CustomiseSection";
import { PageHeader } from "@/components/ui/PageHeader";
import { loadCustomiseConfig } from "@/server/customise-data";

export const dynamic = "force-dynamic";

export default async function CustomiseIdentityPage() {
  const tenant = await loadCustomiseConfig();
  return (
    <div className="max-w-4xl space-y-8">
      <PageHeader
        title="Identity"
        description="The tenant's name, slug, domain, and business model."
      />
      <CustomiseSection
        section="identity"
        fields={[
          {
            kind: "text",
            path: "identity.name",
            label: "Name",
            initial: tenant.identity.name,
            required: true,
          },
          {
            kind: "text",
            path: "identity.slug",
            label: "Slug",
            initial: tenant.identity.slug,
            required: true,
            hint: "lowercase, dashes only",
          },
          {
            kind: "text",
            path: "identity.domain",
            label: "Domain",
            initial: tenant.identity.domain,
            required: true,
          },
          {
            kind: "text",
            path: "identity.industry",
            label: "Industry",
            initial: tenant.identity.industry,
          },
          {
            kind: "select",
            path: "identity.businessModel",
            label: "Business model",
            initial: tenant.identity.businessModel,
            options: [
              { value: "b2c", label: "B2C", hint: "consumer-facing" },
              { value: "b2b", label: "B2B", hint: "business buyers" },
              { value: "marketplace", label: "Marketplace", hint: "two-sided" },
            ],
          },
        ]}
      />
    </div>
  );
}
