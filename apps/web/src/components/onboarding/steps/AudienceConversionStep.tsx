"use client";

import { ProposeAgainButton } from "@/components/ai/ProposeAgainButton";
import { ChoiceCardGrid } from "@/components/multichoice/ChoiceCardGrid";
import { IcpCardContent } from "@/components/multichoice/IcpCard";
import type { IcpProposal, ToolFitScore } from "@your-os/configurator";
import { useEffect, useRef, useState } from "react";
import type { StepFormProps } from "../OnboardingStepClient";
import { Field, Select, TextInput } from "./_shared";

const CTA_PATTERNS = [
  "Find $15-$25/hr {role} shifts",
  "Book a demo",
  "Start your free trial",
  "Subscribe to the weekly digest",
  "Try the calculator",
  "Download the playbook",
];

const CONVERSIONS = [
  "app_install",
  "demo_booking",
  "sql",
  "newsletter",
  "purchase",
  "lead_form",
] as const;

export function AudienceConversionStep({
  brief,
  errors,
  setFields,
  recordGate,
  fetchResearch,
  machineId,
}: StepFormProps) {
  const [name, setName] = useState(brief.audience?.primaryPersona?.name ?? "");
  const [pain, setPain] = useState(brief.audience?.primaryPersona?.pain ?? "");
  const [value, setValue] = useState(brief.audience?.primaryPersona?.value ?? "");
  const [primary, setPrimary] = useState<(typeof CONVERSIONS)[number]>(
    (brief.conversion?.primary as (typeof CONVERSIONS)[number]) ?? "newsletter",
  );
  const [ctaPattern, setCtaPattern] = useState<string>(
    brief.conversion?.ctaPattern ?? (CTA_PATTERNS[0] as string),
  );

  const [icps, setIcps] = useState<IcpProposal[] | null>(null);
  const [toolFit, setToolFit] = useState<ToolFitScore | null>(null);
  const [pickedIcps, setPickedIcps] = useState<string[]>([]);

  // Load research that the page-server already kicked off.
  useEffect(() => {
    let alive = true;
    void fetchResearch<IcpProposal[]>("proposeIcps")
      .then((r) => {
        if (alive) setIcps(r);
      })
      .catch(() => undefined);
    void fetchResearch<ToolFitScore>("scoreToolFit")
      .then((r) => {
        if (alive) setToolFit(r);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [fetchResearch]);

  const latest = useRef({ name, pain, value, primary, ctaPattern });
  latest.current = { name, pain, value, primary, ctaPattern };

  function commitWith(patch: Partial<typeof latest.current>) {
    Object.assign(latest.current, patch);
    void setFields({
      audience: {
        primaryPersona: {
          name: latest.current.name,
          pain: latest.current.pain,
          value: latest.current.value,
        },
      },
      conversion: { primary: latest.current.primary, ctaPattern: latest.current.ctaPattern },
    });
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: seed-on-mount only; user-driven changes flow through commitIcpDecision/commitCtaDecision using `latest.current`.
  useEffect(() => {
    if (!brief.conversion?.primary || !brief.conversion?.ctaPattern) {
      void setFields({ conversion: { primary, ctaPattern } });
    }
  }, []);

  async function commitIcpDecision(ids: string[]) {
    setPickedIcps(ids);
    if (!icps) return;
    const picked = icps.filter((i) => ids.includes(i.id));
    await recordGate({
      gate: "icps",
      decision: ids.length === icps.length ? "accept" : "edit",
      payload: picked,
    });
  }

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-base font-semibold">Primary persona</h3>
        <p className="text-xs text-(--color-muted-fg)">
          One sentence each. AI proposes ICPs from these answers.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label="Name" error={errors["audience.primaryPersona.name"]}>
            <TextInput
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                commitWith({ name: e.target.value });
              }}
              placeholder="Working parent earning hourly"
            />
          </Field>
          <Field label="Pain" error={errors["audience.primaryPersona.pain"]}>
            <TextInput
              required
              value={pain}
              onChange={(e) => {
                setPain(e.target.value);
                commitWith({ pain: e.target.value });
              }}
              placeholder="Unpredictable schedules"
            />
          </Field>
          <Field label="Value" error={errors["audience.primaryPersona.value"]}>
            <TextInput
              required
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                commitWith({ value: e.target.value });
              }}
              placeholder="Earn $20/hr on flexible shifts"
            />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold">Conversion</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Primary event" error={errors["conversion.primary"]}>
            <Select
              value={primary}
              onChange={(e) => {
                const v = e.target.value as typeof primary;
                setPrimary(v);
                commitWith({ primary: v });
              }}
            >
              {CONVERSIONS.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="CTA pattern" error={errors["conversion.ctaPattern"]}>
            <Select
              value={ctaPattern}
              onChange={(e) => {
                setCtaPattern(e.target.value);
                commitWith({ ctaPattern: e.target.value });
              }}
            >
              {CTA_PATTERNS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-base font-semibold">ICP proposals</h3>
          <ProposeAgainButton
            job="proposeIcps"
            machineId={machineId}
            onResult={(r) => setIcps(r as IcpProposal[])}
          />
        </div>
        <ChoiceCardGrid<IcpProposal>
          label="Pick the ICPs the OS should target"
          description="HITL #2 — Brief sign-off (narrow). Pick all that fit; reject what doesn't."
          items={icps ?? []}
          keyOf={(p) => p.id}
          mode="multi"
          selected={pickedIcps}
          onChange={commitIcpDecision}
          render={(p) => <IcpCardContent proposal={p} />}
          emptyMessage="ICP research is still running — fill in the persona above to give the LLM enough context."
        />
      </section>

      {toolFit ? (
        <section className="rounded-lg border border-(--color-border) bg-(--color-muted) p-3 text-sm">
          <p className="text-xs uppercase tracking-wider text-(--color-muted-fg)">Tool-fit score</p>
          <p className="mt-1">
            <span className="font-mono text-base">{Math.round(toolFit.score * 100)}/100</span> —{" "}
            {toolFit.rationale}
          </p>
          {toolFit.suggestedTool ? (
            <p className="mt-1 text-xs text-(--color-muted-fg)">
              Suggested tool: <span className="font-mono">{toolFit.suggestedTool.kind}</span>
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
