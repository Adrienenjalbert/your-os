/**
 * Client-safe re-export of the onboarding step manifest.
 *
 * `@your-os/configurator` re-exports the scaffolder, which transitively
 * imports `@your-os/cli` and `node:fs/promises`. Webpack's client bundler
 * can't tree-shake the lazy `import()` calls in the cli's dispatcher and
 * fails the build. We therefore declare the step manifest locally here so
 * client components (Stepper, CommandPalette, etc.) get only the JSON they
 * actually need.
 *
 * The shape MUST stay byte-equivalent to `ONBOARDING_STEPS` in
 * `apps/configurator/src/onboarding/steps.ts`. A vitest test enforces this
 * (see `tests/onboarding-meta.test.ts`).
 */

export type OnboardingStepIdLocal =
  | "identity"
  | "audience-conversion"
  | "brand"
  | "seo-architecture"
  | "content-ops-cms"
  | "integrations"
  | "launch-preview";

export interface OnboardingStepMetaLocal {
  id: OnboardingStepIdLocal;
  title: string;
  oneLiner: string;
  timeBudgetMinutes: number;
}

export const ONBOARDING_STEPS_META: readonly OnboardingStepMetaLocal[] = [
  {
    id: "identity",
    title: "Identity",
    oneLiner: "Name the hub. Pick its slug, domain, industry, and business model.",
    timeBudgetMinutes: 3,
  },
  {
    id: "audience-conversion",
    title: "Audience & Conversion",
    oneLiner:
      "Tell us who buys (persona + ICP) and what conversion you optimize for. We propose ICPs in parallel.",
    timeBudgetMinutes: 5,
  },
  {
    id: "brand",
    title: "Brand & Voice",
    oneLiner:
      "Lock the primary distinctive brand asset, voice, and reading level. We propose 2-4 DBAs in parallel.",
    timeBudgetMinutes: 4,
  },
  {
    id: "seo-architecture",
    title: "SEO Architecture",
    oneLiner:
      "Confirm pillars + intent. Pick the primary schema.org type. We run SERP + keyword cluster + pillar research.",
    timeBudgetMinutes: 5,
  },
  {
    id: "content-ops-cms",
    title: "Content Ops & CMS",
    oneLiner: "Pick code-mode or Strapi. Configure draft/preview/publish flow.",
    timeBudgetMinutes: 4,
  },
  {
    id: "integrations",
    title: "Integrations",
    oneLiner:
      "Wire GSC + GA4 + email provider + Slack. Each is optional but unlocks the closed loop.",
    timeBudgetMinutes: 6,
  },
  {
    id: "launch-preview",
    title: "Launch Preview",
    oneLiner:
      "Final review: domain, pillar tree, sample brief, ROOS forecast band, 3 email sequences. Approve to scaffold.",
    timeBudgetMinutes: 3,
  },
] as const;

export const TOTAL_BUDGET_MINUTES_LOCAL: number = ONBOARDING_STEPS_META.reduce(
  (sum, s) => sum + s.timeBudgetMinutes,
  0,
);
