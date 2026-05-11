"use client";

import { useEffect, useState } from "react";
import type { StepFormProps } from "../OnboardingStepClient";
import { Field, Select, TextInput } from "./_shared";

const PROVIDERS = ["render", "railway", "fly"] as const;

export function ContentOpsCmsStep({ brief, errors, setFields }: StepFormProps) {
  const [mode, setMode] = useState<"code" | "strapi">(brief.contentStorage?.mode ?? "code");
  const [baseUrl, setBaseUrl] = useState(brief.contentStorage?.strapi?.baseUrl ?? "");
  const [provider, setProvider] = useState<(typeof PROVIDERS)[number]>(
    (brief.contentStorage?.strapi?.deployProvider as (typeof PROVIDERS)[number]) ?? "render",
  );

  // Persist the default selection on mount so users can click "Advance"
  // without first clicking a radio they already see selected. Idempotent.
  // biome-ignore lint/correctness/useExhaustiveDependencies: seed-on-mount only; subsequent updates flow through the explicit `commit` callback.
  useEffect(() => {
    if (!brief.contentStorage?.mode) {
      void commit(mode);
    }
  }, []);

  async function commit(nextMode = mode) {
    const next: Parameters<typeof setFields>[0]["contentStorage"] =
      nextMode === "code"
        ? { mode: "code" }
        : {
            mode: "strapi",
            strapi: {
              baseUrl,
              deployProvider: provider,
            },
          };
    await setFields({ contentStorage: next });
  }

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-sm font-semibold">Content storage</legend>
        <p className="text-xs text-(--color-muted-fg)">
          Pick once per content-type later in Customise. Onboarding picks the dominant default.
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(["code", "strapi"] as const).map((m) => (
            <label
              key={m}
              data-testid="content-storage-card"
              data-selected={mode === m ? "true" : "false"}
              className={`cursor-pointer rounded-lg border p-3 text-sm ${
                mode === m
                  ? "border-(--color-accent) bg-(--color-muted) ring-1 ring-(--color-accent)"
                  : "border-(--color-border) hover:border-(--color-accent)"
              }`}
            >
              <input
                type="radio"
                name="contentMode"
                value={m}
                checked={mode === m}
                onChange={() => {
                  setMode(m);
                  void commit(m);
                }}
                className="sr-only"
              />
              <span className="font-medium uppercase">{m}</span>
              <p className="mt-1 text-xs text-(--color-muted-fg)">
                {m === "code"
                  ? "Editorial edits TS data files in the repo. Zero infra. Best when the team is engineering-led."
                  : "Editorial edits in Strapi admin. Webhook → ISR. Best when the team is HR/marketing-led."}
              </p>
            </label>
          ))}
        </div>
      </fieldset>

      {mode === "strapi" ? (
        <section className="grid gap-3 sm:grid-cols-2" onBlur={() => void commit()}>
          <Field label="Strapi base URL" error={errors["contentStorage.strapi"]}>
            <TextInput
              type="url"
              required
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://cms.your-tenant.example.com"
            />
          </Field>
          <Field label="Deploy provider">
            <Select
              value={provider}
              onChange={(e) => setProvider(e.target.value as typeof provider)}
            >
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </Field>
        </section>
      ) : null}
    </div>
  );
}
