/**
 * Refresh-PR / Strapi-brief drafter.
 *
 * Translates a `DecayCandidate` into either:
 *   - code-mode: a refresh PR scaffold (file paths + change summary + checklist)
 *   - strapi-mode: an OpportunityBrief patch (status: refresh_draft)
 *
 * Pure. The CI / hosted adapter applies the patch.
 */
import type { TenantConfig } from "@your-os/tenant-config";
import type { DecayCandidate, DecayReasonId } from "./decay.js";

export type RefreshMode = "code" | "strapi";

export interface CodeRefreshPlan {
  mode: "code";
  page: string;
  branchName: string;
  filePathsToTouch: string[];
  changeSummary: string;
  checklist: string[];
  decayScore: number;
  reasons: DecayCandidate["reasons"];
}

export interface StrapiRefreshPatch {
  mode: "strapi";
  briefId?: string;
  data: {
    status: "refresh_draft";
    refreshSummary: string;
    refreshChecklist: string[];
    decayScore: number;
    decayReasons: Array<{ id: DecayReasonId; detail: string }>;
  };
}

export type RefreshPlan = CodeRefreshPlan | StrapiRefreshPatch;

export function draftRefreshPlan(
  candidate: DecayCandidate,
  tenant: Pick<TenantConfig, "contentSources">,
): RefreshPlan {
  const checklist = checklistForReasons(candidate.reasons.map((r) => r.id));
  const summary = `Decay score ${candidate.decayScore} on ${candidate.page}. Reasons: ${candidate.reasons
    .map((r) => r.id)
    .join(", ")}.`;

  // Decide mode: prefer the tenant's primary content storage for "articles".
  // If unspecified, default to code.
  const articlesSource = tenant.contentSources.articles;
  const mode = articlesSource && articlesSource.mode === "strapi" ? "strapi" : "code";

  if (mode === "strapi") {
    return {
      mode: "strapi",
      briefId: candidate.briefId,
      data: {
        status: "refresh_draft",
        refreshSummary: summary,
        refreshChecklist: checklist,
        decayScore: candidate.decayScore,
        decayReasons: candidate.reasons.map((r) => ({ id: r.id, detail: r.detail })),
      },
    };
  }

  // Code-mode: file-path heuristic. The actual file is the slug-ified page
  // path under src/features/{pillar}/data/articles/. Adapter fills in true
  // paths from the project's data-placement convention.
  const slug = candidate.page
    .replace(/^\//, "")
    .replace(/\//g, "-")
    .replace(/\.html?$/, "");
  const filePath =
    candidate.pillar !== undefined
      ? `src/features/${candidate.pillar}/data/articles/${slug}.ts`
      : `src/data/articles/${slug}.ts`;
  return {
    mode: "code",
    page: candidate.page,
    branchName: `refresh/${slug}`,
    filePathsToTouch: [filePath],
    changeSummary: summary,
    checklist,
    decayScore: candidate.decayScore,
    reasons: candidate.reasons,
  };
}

function checklistForReasons(reasons: DecayReasonId[]): string[] {
  const set = new Set(reasons);
  const items: string[] = [];
  if (set.has("stale-date-modified")) {
    items.push("Update `dateModified` and review every claim against the source URL.");
    items.push("Re-fetch each citation; replace dead links.");
  }
  if (set.has("ranking-drop")) {
    items.push("Compare current SERP top-3; identify what they have that we don't.");
    items.push("Audit internal-link inbound count; inject from related pillar pages.");
  }
  if (set.has("roos-drop")) {
    items.push("Check CTA placement and primary CTA archetype against tenant.funnel.intentMap.");
    items.push("Run a brand-lint pass; fix INTENT_CTA_MISMATCH if surfaced.");
  }
  if (set.has("stale-source-data")) {
    items.push("Re-run any data fetcher against the current upstream version; update statistics.");
    items.push("Update `sourceDataVersion` field to the new release.");
  }
  if (items.length === 0) {
    items.push("No-op refresh; consider closing.");
  }
  return items;
}
