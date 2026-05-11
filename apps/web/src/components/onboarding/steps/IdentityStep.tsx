"use client";

import { useEffect, useRef, useState } from "react";
import type { StepFormProps } from "../OnboardingStepClient";
import { Field, Select, TextInput } from "./_shared";

const INDUSTRY_PRESETS = [
  "marketplace",
  "saas",
  "fintech",
  "career_services",
  "ecommerce",
  "healthcare",
  "education",
  "media",
  "other",
];

export function IdentityStep({ brief, errors, setFields }: StepFormProps) {
  const [name, setName] = useState(brief.identity?.name ?? "");
  const [slug, setSlug] = useState(brief.identity?.slug ?? "");
  const [domain, setDomain] = useState(brief.identity?.domain ?? "");
  const [industry, setIndustry] = useState(brief.identity?.industry ?? "");
  const [businessModel, setBusinessModel] = useState<"b2c" | "b2b" | "marketplace">(
    brief.identity?.businessModel ?? "b2c",
  );

  // Track latest values via ref so commit() — fired from a child blur — never
  // reads stale closure state. We commit on every change with the new value
  // included so the server is always within one round-trip of the user.
  const latest = useRef({ name, slug, domain, industry, businessModel });
  latest.current = { name, slug, domain, industry, businessModel };

  function commitWith(patch: Partial<typeof latest.current>) {
    Object.assign(latest.current, patch);
    void setFields({ identity: { ...latest.current } });
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: seed-on-mount only; subsequent updates flow through commitWith via a ref to avoid stale closures.
  useEffect(() => {
    if (!brief.identity?.businessModel) {
      void setFields({ identity: { ...latest.current } });
    }
  }, []);

  return (
    <form className="grid gap-4 sm:grid-cols-2">
      <Field label="Hub name" error={errors["identity.name"]}>
        <TextInput
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            commitWith({ name: e.target.value });
          }}
          placeholder="Indeed Flex Career Hub"
        />
      </Field>
      <Field
        label="Slug"
        hint="lowercase + dashes; used as namespace"
        error={errors["identity.slug"]}
      >
        <TextInput
          required
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            commitWith({ slug: e.target.value });
          }}
          pattern="[a-z0-9-]+"
          placeholder="career-hub"
        />
      </Field>
      <Field label="Domain" error={errors["identity.domain"]}>
        <TextInput
          required
          value={domain}
          onChange={(e) => {
            setDomain(e.target.value);
            commitWith({ domain: e.target.value });
          }}
          placeholder="careerhub.example.com"
        />
      </Field>
      <Field label="Industry" error={errors["identity.industry"]}>
        <Select
          value={industry}
          onChange={(e) => {
            setIndustry(e.target.value);
            commitWith({ industry: e.target.value });
          }}
          required
        >
          <option value="">Pick one…</option>
          {INDUSTRY_PRESETS.map((opt) => (
            <option key={opt} value={opt}>
              {opt.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
      </Field>
      <fieldset className="sm:col-span-2">
        <legend className="text-sm font-medium text-(--color-fg-strong)">Business model</legend>
        <p className="mt-1 text-xs text-(--color-muted-fg)">
          Drives ICP, conversion, and content-class defaults.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {(["b2c", "b2b", "marketplace"] as const).map((m) => (
            <label
              key={m}
              data-testid="business-model-card"
              data-selected={businessModel === m ? "true" : "false"}
              className={`block cursor-pointer rounded-lg border p-3 text-sm shadow-sm transition ${
                businessModel === m
                  ? "border-(--color-accent) bg-(--color-accent-soft) ring-2 ring-(--color-accent-soft)"
                  : "border-(--color-border) bg-(--color-surface) hover:border-(--color-accent) hover:bg-(--color-surface-2)"
              }`}
            >
              <input
                type="radio"
                name="businessModel"
                value={m}
                checked={businessModel === m}
                onChange={() => {
                  setBusinessModel(m);
                  commitWith({ businessModel: m });
                }}
                className="sr-only"
              />
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${businessModel === m ? "text-(--color-accent)" : "text-(--color-fg-strong)"}`}
              >
                {m}
              </span>
              <p className="mt-1.5 text-xs leading-relaxed text-(--color-muted-fg)">
                {m === "b2c"
                  ? "Direct-to-consumer hub. Personas + app/newsletter conversion."
                  : m === "b2b"
                    ? "B2B SaaS hub. ICPs, demo-booking, sales enablement."
                    : "Two-sided marketplace. Mixed audience + multiple conversion paths."}
              </p>
            </label>
          ))}
        </div>
      </fieldset>
    </form>
  );
}
