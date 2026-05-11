"use client";

/**
 * Step 6 — Integrations.
 *
 * The Brief schema does NOT yet model integrations explicitly (the configurator
 * fills CRM defaults from businessModel in `briefToTenantConfig`). This step
 * therefore offers a multi-choice "connect now" / "connect later" surface
 * whose state lives entirely in the Customise panel after onboarding.
 *
 * v1.1 records each chip's connect-later decision via telemetry so the
 * design-partner test can see which integrations partners skipped.
 */
import { useState } from "react";
import type { StepFormProps } from "../OnboardingStepClient";

const INTEGRATIONS = [
  { id: "gsc", label: "Google Search Console", purpose: "Top queries → opportunity discovery." },
  { id: "ga4", label: "Google Analytics 4", purpose: "Conversion attribution." },
  { id: "slack", label: "Slack", purpose: "Weekly digest + alert channel." },
  { id: "email", label: "Email provider", purpose: "Warm-up sequences (Kit / Loops / HubSpot)." },
] as const;

export function IntegrationsStep(_props: StepFormProps) {
  const [decided, setDecided] = useState<Record<string, "connect" | "later">>({});

  function decide(id: string, value: "connect" | "later") {
    setDecided((prev) => ({ ...prev, [id]: value }));
    void fetch("/api/telemetry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "configurator.gate.decision",
        payload: { gate: `integration.${id}`, decision: value },
      }),
    }).catch(() => undefined);
  }

  return (
    <ul className="space-y-3">
      {INTEGRATIONS.map((it) => {
        const state = decided[it.id];
        return (
          <li
            key={it.id}
            data-testid="integration-row"
            className="flex items-center justify-between gap-3 rounded-lg border border-(--color-border) p-3"
          >
            <div>
              <p className="text-sm font-medium">{it.label}</p>
              <p className="text-xs text-(--color-muted-fg)">{it.purpose}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid={`integration-${it.id}-connect`}
                onClick={() => decide(it.id, "connect")}
                className={`rounded px-2.5 py-1 text-xs ${
                  state === "connect"
                    ? "bg-(--color-accent) text-(--color-accent-fg)"
                    : "border border-(--color-border) hover:border-(--color-accent)"
                }`}
              >
                Connect
              </button>
              <button
                type="button"
                onClick={() => decide(it.id, "later")}
                className={`rounded px-2.5 py-1 text-xs ${
                  state === "later"
                    ? "bg-(--color-muted) ring-1 ring-(--color-border)"
                    : "border border-(--color-border) hover:border-(--color-accent)"
                }`}
              >
                Connect later
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
