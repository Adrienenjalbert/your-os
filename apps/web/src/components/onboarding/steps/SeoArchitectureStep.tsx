"use client";

import { ProposeAgainButton } from "@/components/ai/ProposeAgainButton";
import { ChoiceCardGrid } from "@/components/multichoice/ChoiceCardGrid";
import { PillarCardContent } from "@/components/multichoice/PillarCard";
import { SchemaCardContent } from "@/components/multichoice/SchemaCard";
import type {
  KeywordCluster,
  PillarProposal,
  SchemaSelection,
  SerpResult,
} from "@your-os/configurator";
import { useEffect, useState } from "react";
import type { StepFormProps } from "../OnboardingStepClient";

const SCHEMA_TYPES = [
  "Article",
  "JobPosting",
  "Product",
  "Service",
  "FAQPage",
  "HowTo",
  "Recipe",
  "LocalBusiness",
  "Event",
];

export function SeoArchitectureStep({
  brief,
  setFields,
  recordGate,
  fetchResearch,
  machineId,
}: StepFormProps) {
  const [primarySchema, setPrimarySchema] = useState(brief.seo?.primarySchemaType ?? "Article");
  const [pillars, setPillars] = useState<PillarProposal[] | null>(null);
  const [pickedPillars, setPickedPillars] = useState<string[]>([]);
  const [schema, setSchema] = useState<SchemaSelection | null>(null);
  const [serp, setSerp] = useState<SerpResult[] | null>(null);
  const [keywordCluster, setKeywordCluster] = useState<KeywordCluster | null>(null);

  useEffect(() => {
    let alive = true;
    void fetchResearch<PillarProposal[]>("proposePillars")
      .then((r) => alive && setPillars(r))
      .catch(() => undefined);
    void fetchResearch<SchemaSelection>("selectPrimarySchema")
      .then((r) => {
        if (!alive) return;
        setSchema(r);
        if (!brief.seo?.primarySchemaType) setPrimarySchema(r.primary);
      })
      .catch(() => undefined);
    void fetchResearch<SerpResult[]>("serp")
      .then((r) => alive && setSerp(r))
      .catch(() => undefined);
    void fetchResearch<KeywordCluster>("keywordCluster")
      .then((r) => alive && setKeywordCluster(r))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [fetchResearch, brief.seo?.primarySchemaType]);

  async function commitPrimarySchema(value: string) {
    setPrimarySchema(value);
    await setFields({
      seo: {
        primarySchemaType: value,
        pillars: brief.seo?.pillars ?? [],
      },
    });
    if (schema) {
      await recordGate({
        gate: "schema",
        decision: value === schema.primary ? "accept" : "edit",
        payload: { ...schema, primary: value },
      });
    }
  }

  async function commitPillarDecision(slugs: string[]) {
    setPickedPillars(slugs);
    if (!pillars) return;
    const picked = pillars.filter((p) => slugs.includes(p.slug));
    await setFields({
      seo: {
        primarySchemaType: primarySchema,
        pillars: picked.map((p) => ({ slug: p.slug, name: p.name, intent: p.intent })),
      },
    });
    await recordGate({
      gate: "pillars",
      decision: slugs.length === pillars.length ? "accept" : "edit",
      payload: picked,
    });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-base font-semibold">Pillar proposals</h3>
          <ProposeAgainButton
            job="proposePillars"
            machineId={machineId}
            onResult={(r) => setPillars(r as PillarProposal[])}
          />
        </div>
        <ChoiceCardGrid<PillarProposal>
          label="Pick the pillars to ship"
          description="Each pillar produces a hub page + clusters. Edit selection until they map to how YOUR users think."
          items={pillars ?? []}
          keyOf={(p) => p.slug}
          mode="multi"
          selected={pickedPillars}
          onChange={commitPillarDecision}
          render={(p) => <PillarCardContent proposal={p} />}
          emptyMessage="Pillar research is still running. Earlier steps' answers feed this."
        />
      </section>

      <section className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-base font-semibold">Primary schema.org type</h3>
          <ProposeAgainButton
            job="selectPrimarySchema"
            machineId={machineId}
            onResult={(r) => setSchema(r as SchemaSelection)}
          />
        </div>
        {schema ? (
          <div
            className="rounded-lg border border-(--color-border) p-3 text-sm"
            data-testid="schema-rationale"
          >
            <SchemaCardContent selection={{ ...schema, primary: primarySchema }} />
          </div>
        ) : null}
        <fieldset>
          <legend className="text-sm font-semibold">Override primary schema</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {SCHEMA_TYPES.map((s) => (
              <label
                key={s}
                data-testid="schema-card"
                data-selected={primarySchema === s ? "true" : "false"}
                className={`cursor-pointer rounded border p-2 text-sm font-mono ${
                  primarySchema === s
                    ? "border-(--color-accent) bg-(--color-muted) ring-1 ring-(--color-accent)"
                    : "border-(--color-border) hover:border-(--color-accent)"
                }`}
              >
                <input
                  type="radio"
                  name="primarySchema"
                  value={s}
                  checked={primarySchema === s}
                  onChange={() => commitPrimarySchema(s)}
                  className="sr-only"
                />
                {s}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {keywordCluster ? (
        <section className="rounded-lg border border-(--color-border) p-3 text-sm">
          <h3 className="text-base font-semibold">Keyword cluster</h3>
          <p className="mt-1 text-xs text-(--color-muted-fg)">
            Primary: <span className="font-mono">{keywordCluster.primary}</span>
          </p>
          <ul className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
            {keywordCluster.secondary.map((k) => (
              <li key={k} className="rounded bg-(--color-muted) px-1.5 py-0.5 font-mono">
                {k}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {serp && serp.length > 0 ? (
        <section className="rounded-lg border border-(--color-border) p-3 text-sm">
          <h3 className="text-base font-semibold">Top SERP signals</h3>
          <ul className="mt-2 space-y-1 text-xs">
            {serp.slice(0, 5).map((r) => (
              <li key={r.url} className="text-(--color-muted-fg)">
                <span className="text-(--color-fg)">{r.title}</span>{" "}
                <span className="font-mono">[{r.intent ?? "—"}]</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
