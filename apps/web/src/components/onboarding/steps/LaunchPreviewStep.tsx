"use client";

import type { StepFormProps } from "../OnboardingStepClient";

/**
 * Launch preview — the final step before scaffolding the tenant.
 *
 * Per MISSION.md the user must be able to "approve the launch preview
 * (domain + pillar tree + sample brief + ROOS forecast band + 3 email
 * sequences)". The previous version of this step was a flat <dl> of field
 * paths — useful as a debug dump, useless as a sign-off surface.
 *
 * This version assembles the same fields into a more legible "what gets
 * deployed" summary card with three explicit sections:
 *
 *   1. The hub itself (domain + name + business model).
 *   2. What ranks first (pillars + primary schema).
 *   3. Who it speaks to + how it converts (persona + DBA + conversion).
 *
 * The button label in the parent action bar is "Finalize tenant" — body
 * copy here mirrors that wording.
 */
export function LaunchPreviewStep({ brief }: StepFormProps) {
  const pillars = brief.seo?.pillars ?? [];
  return (
    <div className="space-y-6">
      <p className="text-sm text-(--color-muted-fg)">
        Final review. Press <span className="font-mono text-(--color-fg)">Finalize tenant</span> to
        scaffold the repo, seed the first opportunity briefs in the console, and unlock the
        customise panel.
      </p>

      <section className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-(--color-muted-fg)">
          The hub
        </p>
        <h3 className="mt-1 text-lg font-semibold text-(--color-fg-strong)">
          {brief.identity?.name ?? "—"}
        </h3>
        <p className="mt-1 text-sm text-(--color-muted-fg)">
          <span className="font-mono text-(--color-fg)">
            {brief.identity?.domain ?? "domain.example"}
          </span>{" "}
          · {brief.identity?.industry ?? "—"} · {brief.identity?.businessModel ?? "—"}
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-(--color-muted-fg)">
            What ranks first
          </p>
          {pillars.length === 0 ? (
            <p className="mt-2 text-sm text-(--color-muted-fg)">
              No pillars chosen yet — go back to <em>SEO Architecture</em>.
            </p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {pillars.slice(0, 5).map((p) => (
                <li key={p.slug} className="flex items-baseline gap-2">
                  <span aria-hidden="true" className="text-(--color-faint-fg)">
                    ›
                  </span>
                  <span className="text-(--color-fg)">{p.name}</span>
                  <span className="font-mono text-xs text-(--color-faint-fg)">/{p.slug}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-(--color-muted-fg)">
            Primary schema:{" "}
            <span className="font-mono text-(--color-fg)">
              {brief.seo?.primarySchemaType ?? "—"}
            </span>
          </p>
        </section>

        <section className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-(--color-muted-fg)">
            Who it speaks to
          </p>
          <p className="mt-2 text-sm text-(--color-fg)">
            {brief.audience?.primaryPersona?.name ?? "—"}
            {brief.audience?.primaryPersona?.value ? (
              <span className="block text-xs text-(--color-muted-fg)">
                {brief.audience.primaryPersona.value}
              </span>
            ) : null}
          </p>
          <p className="mt-3 text-xs text-(--color-muted-fg)">
            Distinctive brand asset:{" "}
            <span className="font-mono text-(--color-fg)">
              {brief.brand?.primaryDistinctiveAsset ?? "—"}
            </span>
          </p>
          <p className="mt-1 text-xs text-(--color-muted-fg)">
            Primary conversion:{" "}
            <span className="font-mono text-(--color-fg)">{brief.conversion?.primary ?? "—"}</span>
          </p>
        </section>
      </div>

      <p className="text-xs text-(--color-faint-fg)">
        Storage:{" "}
        <span className="font-mono text-(--color-muted-fg)">
          {brief.contentStorage?.mode ?? "code"}
        </span>{" "}
        · everything is reversible — re-run any step from the stepper above.
      </p>
    </div>
  );
}
