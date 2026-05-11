"use client";

import type { ResearchJobId } from "@your-os/configurator";
import { useState } from "react";

export interface ProposeAgainButtonProps {
  job: ResearchJobId;
  machineId: string;
  onResult: (result: unknown) => void;
}

export function ProposeAgainButton({ job, machineId, onResult }: ProposeAgainButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function rerun() {
    setBusy(true);
    setError(null);
    try {
      // Reset cached job by calling reset → re-snapshot. For v1.1 we simply
      // re-fetch; the OnboardingMachine will return the cached promise. To
      // truly re-roll we go through `setFields` with a tweaked seed; that
      // arrives in v1.2 via the AI SDK streaming endpoint.
      const res = await fetch(`/api/research/${job}?machineId=${machineId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { result: unknown };
      onResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={rerun}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded border border-(--color-border) bg-(--color-bg) px-2.5 py-1 text-xs hover:border-(--color-accent) disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? "Proposing…" : "Propose again"}
      </button>
      {error ? (
        <span role="alert" className="ml-2 text-xs text-(--color-danger)">
          {error}
        </span>
      ) : null}
    </div>
  );
}
