"use client";

import { ProposeAgainButton } from "@/components/ai/ProposeAgainButton";
// (useEffect already imported above)
import { ChoiceCardGrid } from "@/components/multichoice/ChoiceCardGrid";
import { DbaCardContent } from "@/components/multichoice/DbaCard";
import type { DbaProposal } from "@your-os/configurator";
import { useEffect, useRef, useState } from "react";
import type { StepFormProps } from "../OnboardingStepClient";
import { Field, Select, TextInput } from "./_shared";

const VOICE_TONES = ["warm", "expert", "playful", "direct", "empathetic", "bold"];
const READING_LEVELS = [
  "6th_grade",
  "7th_grade",
  "8th_grade",
  "9th_grade",
  "10th_grade",
  "college",
] as const;
const POVS = ["first_person", "second_person", "third_person"] as const;

export function BrandStep({
  brief,
  errors,
  setFields,
  recordGate,
  fetchResearch,
  machineId,
}: StepFormProps) {
  const [primaryDba, setPrimaryDba] = useState(brief.brand?.primaryDistinctiveAsset ?? "");
  const [voiceTone, setVoiceTone] = useState<string>(
    brief.brand?.voiceTone ?? (VOICE_TONES[0] as string),
  );
  const [readingLevel, setReadingLevel] = useState<(typeof READING_LEVELS)[number]>(
    (brief.brand?.readingLevel as (typeof READING_LEVELS)[number]) ?? "8th_grade",
  );
  const [pov, setPov] = useState<(typeof POVS)[number]>(
    (brief.brand?.pov as (typeof POVS)[number]) ?? "second_person",
  );
  const [dbas, setDbas] = useState<DbaProposal[] | null>(null);
  const [pickedDbas, setPickedDbas] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    void fetchResearch<DbaProposal[]>("proposeDbas")
      .then((r) => {
        if (alive) setDbas(r);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [fetchResearch]);

  const latest = useRef({ primaryDba, voiceTone, readingLevel, pov });
  latest.current = { primaryDba, voiceTone, readingLevel, pov };

  function commitWith(patch: Partial<typeof latest.current>) {
    Object.assign(latest.current, patch);
    void setFields({
      brand: {
        primaryDistinctiveAsset: latest.current.primaryDba,
        voiceTone: latest.current.voiceTone,
        readingLevel: latest.current.readingLevel,
        pov: latest.current.pov,
      },
    });
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: seed-on-mount only; user-driven changes flow through commitBrand using `latest.current` to avoid stale closures.
  useEffect(() => {
    if (!brief.brand?.voiceTone) {
      void setFields({
        brand: {
          primaryDistinctiveAsset: primaryDba,
          voiceTone,
          readingLevel,
          pov,
        },
      });
    }
  }, []);

  async function commitDbaDecision(ids: string[]) {
    setPickedDbas(ids);
    if (!dbas) return;
    const picked = dbas.filter((d) => ids.includes(d.value));
    await recordGate({
      gate: "dbas",
      decision: ids.length === dbas.length ? "accept" : "edit",
      payload: picked,
    });
  }

  return (
    <div className="space-y-6">
      <Field
        label="Primary distinctive brand asset"
        error={errors["brand.primaryDistinctiveAsset"]}
      >
        <TextInput
          required
          value={primaryDba}
          onChange={(e) => {
            setPrimaryDba(e.target.value);
            commitWith({ primaryDba: e.target.value });
          }}
          placeholder="e.g. 'Work when you want' or '15-minute payroll'"
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Voice tone">
          <Select
            value={voiceTone}
            onChange={(e) => {
              setVoiceTone(e.target.value);
              commitWith({ voiceTone: e.target.value });
            }}
          >
            {VOICE_TONES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Reading level">
          <Select
            value={readingLevel}
            onChange={(e) => {
              const v = e.target.value as typeof readingLevel;
              setReadingLevel(v);
              commitWith({ readingLevel: v });
            }}
          >
            {READING_LEVELS.map((v) => (
              <option key={v} value={v}>
                {v.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Point of view">
          <Select
            value={pov}
            onChange={(e) => {
              const v = e.target.value as typeof pov;
              setPov(v);
              commitWith({ pov: v });
            }}
          >
            {POVS.map((v) => (
              <option key={v} value={v}>
                {v.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <section className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-base font-semibold">DBA proposals</h3>
          <ProposeAgainButton
            job="proposeDbas"
            machineId={machineId}
            onResult={(r) => setDbas(r as DbaProposal[])}
          />
        </div>
        <ChoiceCardGrid<DbaProposal>
          label="Pick the distinctive brand assets to enforce"
          description="Brand-lint will require these to appear with ≥80% prevalence (Romaniuk default)."
          items={dbas ?? []}
          keyOf={(d) => d.value}
          mode="multi"
          selected={pickedDbas}
          onChange={commitDbaDecision}
          render={(d) => <DbaCardContent proposal={d} />}
          emptyMessage="DBA research is still running. Type the primary DBA above to seed the LLM."
        />
      </section>
    </div>
  );
}
