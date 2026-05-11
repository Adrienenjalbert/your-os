import { CustomiseSection } from "@/components/customise/sections/CustomiseSection";
import { PageHeader } from "@/components/ui/PageHeader";
import { loadCustomiseConfig } from "@/server/customise-data";

export const dynamic = "force-dynamic";

export default async function CustomiseIntegrationsPage() {
  const tenant = await loadCustomiseConfig();
  return (
    <div className="max-w-4xl space-y-8">
      <PageHeader
        title="Integrations"
        description={
          <>
            CRM and email connections. CRM-specific fields live in{" "}
            <span className="font-mono">integrations.crmConfig</span>.
          </>
        }
      />
      <CustomiseSection
        section="integrations"
        fields={[
          {
            kind: "select",
            path: "integrations.crm",
            label: "CRM",
            initial: tenant.integrations.crm,
            options: [
              { value: "none", label: "None" },
              { value: "hubspot", label: "HubSpot" },
              { value: "salesforce", label: "Salesforce" },
            ],
          },
          {
            kind: "text",
            path: "integrations.email",
            label: "Email service (optional)",
            initial: tenant.integrations.email ?? "",
            hint: "e.g. resend, postmark, sendgrid",
          },
        ]}
      />
    </div>
  );
}
