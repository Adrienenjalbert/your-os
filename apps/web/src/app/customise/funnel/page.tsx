import { CustomiseSection } from "@/components/customise/sections/CustomiseSection";
import { PageHeader } from "@/components/ui/PageHeader";
import { loadCustomiseConfig } from "@/server/customise-data";

export const dynamic = "force-dynamic";

const INTENTS = [
  "informational_early",
  "informational_problem_aware",
  "commercial_investigation",
  "transactional",
  "navigational",
  "tool_utility",
] as const;

const CTA_OPTIONS = [
  { value: "newsletter", label: "newsletter" },
  { value: "lead_magnet", label: "lead_magnet" },
  { value: "tool_try", label: "tool_try" },
  { value: "self_assessment", label: "self_assessment" },
  { value: "email_mini_course", label: "email_mini_course" },
  { value: "free_trial", label: "free_trial" },
  { value: "demo", label: "demo" },
  { value: "pricing", label: "pricing" },
  { value: "comparison_tool", label: "comparison_tool" },
  { value: "roi_calculator", label: "roi_calculator" },
  { value: "case_study", label: "case_study" },
  { value: "purchase", label: "purchase" },
  { value: "app_install", label: "app_install" },
  { value: "hard_gate_before_value", label: "hard_gate_before_value" },
];

type IntentKey = (typeof INTENTS)[number];

export default async function CustomiseFunnelPage() {
  const tenant = await loadCustomiseConfig();
  const intentMap = (tenant.funnel.intentMap ?? {}) as Record<
    IntentKey,
    { allowedPrimaryCta: string[]; forbiddenPrimaryCta: string[] } | undefined
  >;

  return (
    <div className="max-w-4xl space-y-8">
      <PageHeader
        title="Funnel"
        description="Per-intent CTA policy (rule 070). Allowed = render. Forbidden = brand-lint blocks."
      />
      <CustomiseSection
        section="funnel"
        fields={INTENTS.flatMap((intent) => [
          {
            kind: "multiselect" as const,
            path: `funnel.intentMap.${intent}.allowedPrimaryCta`,
            label: `${intent} — allowed CTAs`,
            initial: intentMap[intent]?.allowedPrimaryCta ?? [],
            options: CTA_OPTIONS,
          },
          {
            kind: "multiselect" as const,
            path: `funnel.intentMap.${intent}.forbiddenPrimaryCta`,
            label: `${intent} — forbidden CTAs`,
            initial: intentMap[intent]?.forbiddenPrimaryCta ?? [],
            options: CTA_OPTIONS,
          },
        ])}
      />
    </div>
  );
}
