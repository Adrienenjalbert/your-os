import { Surface, SurfaceHeader } from "@/components/ui/Surface";
import type { BriefDraft } from "@your-os/console";
import type { SearchIntent } from "@your-os/tenant-config";

/**
 * Brief outline — what the *article* will be, in human terms.
 *
 * The headless `briefEditorViewModel` exposes intent / CTA / status, but a
 * Growth lead approving a brief needs to see the proposed H1, the section
 * skeleton, the citation seeds, and the internal-link plan. v1.1 doesn't
 * persist a per-brief outline yet, so we synthesize a believable one from
 * the opportunity + intent fields.
 *
 * This is intentionally read-only and always-visible above the metadata —
 * the metadata answers "is this safe to ship?", but the outline answers
 * "what am I shipping?", which is the primary HITL question.
 */
export function BriefOutline({ brief }: { brief: BriefDraft }) {
  const sections = sectionsForIntent(brief.intent, brief.opportunity.query);
  const internalLinks = internalLinksFor(brief.opportunity.query);
  const citationSeeds = citationSeedsForKind(brief.opportunity.kind);
  return (
    <Surface aria-labelledby="outline-heading" padding="md">
      <SurfaceHeader
        title={<span id="outline-heading">What this article will be</span>}
        description="A draft outline. The writer / editor builds from here."
      />
      <div className="mt-4 space-y-5 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-(--color-muted-fg)">
            Working H1
          </p>
          <p className="mt-1 text-base font-medium text-(--color-fg-strong)">
            {h1ForQuery(brief.opportunity.query)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-(--color-muted-fg)">
            Section skeleton
          </p>
          <ol className="mt-2 space-y-1 text-(--color-fg)">
            {sections.map((s, i) => (
              <li key={s} className="flex items-baseline gap-2">
                <span
                  aria-hidden="true"
                  className="font-mono text-xs text-(--color-faint-fg) tabular-nums"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-(--color-muted-fg)">
              Citation seeds
            </p>
            <ul className="mt-2 space-y-1 text-(--color-fg)">
              {citationSeeds.map((c) => (
                <li key={c} className="flex items-baseline gap-2 text-sm">
                  <span aria-hidden="true" className="text-(--color-faint-fg)">
                    ›
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-(--color-muted-fg)">
              Internal links
            </p>
            <ul className="mt-2 space-y-1">
              {internalLinks.map((l) => (
                <li key={l.href} className="flex items-baseline gap-2 text-sm">
                  <span aria-hidden="true" className="text-(--color-faint-fg)">
                    ›
                  </span>
                  <span>
                    <span className="text-(--color-fg)">{l.label}</span>{" "}
                    <span className="font-mono text-xs text-(--color-faint-fg)">{l.href}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Surface>
  );
}

// ---- synthesis helpers ----
// Heuristics here are intentionally simple — the goal is a believable preview
// for HITL #2, not a real generator. The real outline drafter lives in
// `apps/control-plane/src/digest/brief-drafter.ts` and will replace these
// once briefs are persisted with their outline payload.

function h1ForQuery(query: string): string {
  // Title-case the query; if it starts with a noun phrase, prepend "The".
  const titled = query.replace(/\b\w/g, (c) => c.toUpperCase());
  return /^(how|what|why|when|where|find)/i.test(query) ? titled : `The ${titled}: A 2026 Guide`;
}

function sectionsForIntent(intent: SearchIntent, query: string): string[] {
  const base = [
    `Quick answer: ${query}`,
    "Who this is for",
    "How to use the calculator (or method)",
    "Worked example with current rates",
    "Edge cases & common mistakes",
    "Related guides",
  ];
  if (intent.startsWith("commercial")) {
    return [
      "TL;DR (with the recommendation)",
      "Comparison table",
      "How we evaluated",
      "When to choose each option",
      "FAQ",
    ];
  }
  if (intent.startsWith("transactional")) {
    return ["What you'll get", "Eligibility", "How it works", "Start now (CTA)", "FAQ"];
  }
  return base;
}

function internalLinksFor(query: string): Array<{ label: string; href: string }> {
  const slug = query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return [
    { label: "Pillar: guides hub", href: "/guides" },
    { label: "Related tool", href: `/tools/${slug.split("-")[0] ?? "home"}-helper` },
    { label: "Newsletter signup", href: "/newsletter" },
  ];
}

function citationSeedsForKind(kind: string): string[] {
  // Per .agents/rules/050 — every dollar amount and statistic needs a
  // citation. We propose canonical primary sources up front so the writer
  // knows where to point the reader.
  const common = ["BLS · Occupational Employment & Wages (latest)", "IRS · Publication 15-T"];
  if (kind === "schema-fix")
    return ["schema.org spec for the affected type", "Google Search Central docs"];
  if (kind === "linkable-asset") return ["Original BLS dataset", "State labor department release"];
  return common;
}
