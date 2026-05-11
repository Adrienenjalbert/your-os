import { CustomiseSection } from "@/components/customise/sections/CustomiseSection";
import { PageHeader } from "@/components/ui/PageHeader";
import { loadCustomiseConfig } from "@/server/customise-data";

export const dynamic = "force-dynamic";

export default async function CustomiseAudiencePage() {
  const tenant = await loadCustomiseConfig();
  const persona = tenant.audience.personas[0];
  return (
    <div className="max-w-4xl space-y-8">
      <PageHeader
        title="Audience"
        description="Personas + ICPs (Ideal Customer Profiles). AI-propose ICPs based on the brief."
      />
      <CustomiseSection
        section="audience"
        proposeKind="audience"
        fields={[
          {
            kind: "text",
            path: "audience.personas.0.name",
            label: "Primary persona name",
            initial: persona?.name ?? "",
          },
          {
            kind: "textarea",
            path: "audience.personas.0.pain",
            label: "Primary persona pain",
            initial: persona?.pain ?? "",
            rows: 2,
          },
          {
            kind: "textarea",
            path: "audience.personas.0.value",
            label: "Value delivered",
            initial: persona?.value ?? "",
            rows: 2,
          },
        ]}
      />
    </div>
  );
}
