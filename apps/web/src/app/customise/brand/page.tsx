import { CustomiseSection } from "@/components/customise/sections/CustomiseSection";
import { PageHeader } from "@/components/ui/PageHeader";
import { loadCustomiseConfig } from "@/server/customise-data";

export const dynamic = "force-dynamic";

export default async function CustomiseBrandPage() {
  const tenant = await loadCustomiseConfig();
  return (
    <div className="max-w-4xl space-y-8">
      <PageHeader
        title="Brand & DBAs"
        description="Distinctive Brand Assets (Romaniuk). Voice tone, reading level, point of view."
      />
      <CustomiseSection
        section="brand"
        proposeKind="brand"
        fields={[
          {
            kind: "text",
            path: "brand.voice.tone",
            label: "Voice tone",
            initial: tenant.brand.voice.tone,
          },
          {
            kind: "select",
            path: "brand.voice.readingLevel",
            label: "Reading level",
            initial: tenant.brand.voice.readingLevel,
            options: [
              { value: "6th_grade", label: "6th grade" },
              { value: "7th_grade", label: "7th grade" },
              { value: "8th_grade", label: "8th grade" },
              { value: "9th_grade", label: "9th grade" },
              { value: "10th_grade", label: "10th grade" },
              { value: "college", label: "College" },
            ],
          },
          {
            kind: "select",
            path: "brand.voice.pov",
            label: "Point of view",
            initial: tenant.brand.voice.pov,
            options: [
              { value: "first_person", label: "First person", hint: "we / our" },
              { value: "second_person", label: "Second person", hint: "you / your" },
              { value: "third_person", label: "Third person", hint: "they / their" },
            ],
          },
        ]}
      />
    </div>
  );
}
