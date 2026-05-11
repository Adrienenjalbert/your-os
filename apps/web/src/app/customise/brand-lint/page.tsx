import { CustomiseSection } from "@/components/customise/sections/CustomiseSection";
import { PageHeader } from "@/components/ui/PageHeader";
import { loadCustomiseConfig } from "@/server/customise-data";

export const dynamic = "force-dynamic";

export default async function CustomiseBrandLintPage() {
  const tenant = await loadCustomiseConfig();
  const dba0 = tenant.brand.distinctiveAssets[0];
  return (
    <div className="max-w-4xl space-y-8">
      <PageHeader
        title="Brand-lint thresholds"
        description="DBA prevalence target (Romaniuk ≥80%) and E-E-A-T citation density floor."
      />
      <CustomiseSection
        section="brand-lint"
        fields={[
          {
            kind: "number",
            path: "brand.distinctiveAssets.0.prevalenceTarget",
            label: "Primary DBA prevalence target",
            initial: dba0?.prevalenceTarget ?? 0.8,
            min: 0,
            max: 1,
            step: 0.05,
            hint: "Romaniuk floor is 0.8.",
          },
          {
            kind: "select",
            path: "seo.eeAtSignals.citationDensity",
            label: "Citation density",
            initial: tenant.seo.eeAtSignals.citationDensity,
            options: [
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ],
          },
        ]}
      />
    </div>
  );
}
