"use client";

import type { TenantConfig } from "@your-os/tenant-config";
import { useCallback, useState } from "react";
import { AiProposeButton, type ProposePayload } from "../AiProposeButton";
import { type SectionField, SectionForm } from "../SectionForm";
import { ProposalPicker } from "./ProposalPicker";

/**
 * The Customise panel surface for one section.
 *
 * UX intent (v1.1 simplification): the AI propose button used to live in a
 * loud accent-bordered hero card above the form. That competed with the form
 * for primary attention. We've demoted it to an inline secondary control —
 * a small button rendered to the right of an "Optional shortcut" caption —
 * so the form is always the obvious primary action.
 *
 * Sections without an AI propose method (e.g. /identity) just omit the
 * `proposeKind` prop and the propose region disappears entirely.
 */
export type CustomiseProposeKind = "audience" | "brand" | "seo" | "schema" | "tool-fit";

export function CustomiseSection({
  section,
  fields,
  proposeKind,
}: {
  section: string;
  fields: SectionField[];
  /** When set, the section can call `/api/customise/propose/[proposeKind]`. */
  proposeKind?: CustomiseProposeKind;
}) {
  const [proposed, setProposed] = useState<ProposePayload | null>(null);
  const [externalPatches, setExternalPatches] = useState<Array<{ path: string; value: unknown }>>(
    [],
  );

  const onProposed = useCallback((data: ProposePayload) => {
    setProposed(data);
    // Wipe any pending external patches when a fresh proposal is made — the
    // user must explicitly re-apply.
    setExternalPatches([]);
  }, []);

  const onPicked = useCallback((patches: Array<{ path: string; value: unknown }>) => {
    setExternalPatches(patches);
  }, []);

  // Clear proposed picker + applied AI patches once a commit succeeds.
  // Otherwise the "AI patches applied" banner sticks around even after the
  // patches are already on disk, which confuses anyone scanning the page.
  const onCommit = useCallback((_validated: TenantConfig) => {
    setExternalPatches([]);
    setProposed(null);
  }, []);

  return (
    <section data-section={section} className="space-y-5">
      {proposeKind ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-(--color-muted-fg)">
          <span>
            Optional shortcut: let AI propose options based on your current{" "}
            <span className="font-mono text-(--color-fg)">tenant.config.ts</span>.
          </span>
          <AiProposeButton section={proposeKind} onProposed={onProposed} />
        </div>
      ) : null}
      {proposed ? <ProposalPicker proposal={proposed} onApply={onPicked} /> : null}

      <SectionForm fields={fields} externalPatches={externalPatches} onCommit={onCommit} />
    </section>
  );
}
