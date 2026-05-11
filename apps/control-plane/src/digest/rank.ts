import type { Ga4Row, GscRow } from "../ingest/types.js";

/**
 * The seven 90/10 opportunity kinds from the parent skill
 * `.agents/skills/ops/opportunity-discovery/SKILL.md`. v1 of the OS emitted
 * only the first two; v2 emits all seven where data is available.
 *
 * - striking-distance: position 4-20 with material impressions.
 * - ctr-rescue: top-5 with anomalously low CTR.
 * - schema-fix: pages with missing/broken schema.org markup.
 * - link-injection: orphans (no internal inbound links) with material traffic.
 * - cannibalization-consolidation: two URLs ranking for same query.
 * - template-extension: a template ranks well; extend to more cells.
 * - linkable-asset: high topical authority + high inbound link velocity.
 */
export type OpportunityKind =
  | "striking-distance"
  | "ctr-rescue"
  | "schema-fix"
  | "link-injection"
  | "cannibalization-consolidation"
  | "template-extension"
  | "linkable-asset";

export interface Opportunity {
  page: string;
  query: string;
  kind: OpportunityKind;
  /** Estimated additional clicks per month if we ship this fix. */
  liftClicks: number;
  /** 0..1 — relative implementation effort. */
  effort: number;
  /** liftClicks / max(effort, 0.05) — used to rank. */
  liftPerEffort: number;
  /** Free-form context for the brief drafter. */
  reason: string;
  /** Optional: secondary URLs (cannibalization), or the target template. */
  relatedPages?: string[];
}

/** Schema audit result per page (optional input — emits schema-fix opps). */
export interface SchemaAuditRow {
  page: string;
  /** Validity score 0..1 from a schema validator (e.g. Google Rich Results). */
  validity: number;
  /** Missing required schema types we expected. */
  missing: string[];
}

/** Internal-link graph row per page (optional input — emits link-injection opps). */
export interface InternalLinkGraphRow {
  page: string;
  /** Inbound internal-link count. 0 = orphan. */
  inboundLinks: number;
  /** Topical pillar slug (optional, used for matching link sources). */
  pillar?: string;
}

/** Page → template mapping (optional input — emits template-extension opps). */
export interface TemplateUsageRow {
  page: string;
  template: string;
  /** Est. number of additional cells this template could expand to. */
  additionalCellsAvailable: number;
}

/** Backlink growth row per page (optional input — emits linkable-asset opps). */
export interface BacklinkGrowthRow {
  page: string;
  /** Referring domains in last 30 days. */
  newReferringDomains30d: number;
  /** Total inbound backlinks. */
  totalBacklinks: number;
}

export interface RankInput {
  gsc: GscRow[];
  ga4?: Ga4Row[];
  schemaAudit?: SchemaAuditRow[];
  linkGraph?: InternalLinkGraphRow[];
  templates?: TemplateUsageRow[];
  backlinks?: BacklinkGrowthRow[];
}

export interface RankWeights {
  /** Multiplier on impressions when modeling striking-distance lift. */
  strikingDistanceImpressionWeight: number;
  /** CTR delta we expect for a CTR-rescue play (e.g. 0.02 = +2pp). */
  ctrRescueDelta: number;
  /** Min impressions to consider any opportunity. Filters noise. */
  impressionFloor: number;
  /** Schema-fix recovery factor: clicks gained per impression on validity-fix. */
  schemaFixClicksPerImpression: number;
  /** Min validity below which schema-fix is recommended. */
  schemaValidityFloor: number;
  /** Link-injection: clicks recoverable per impression on orphan pages. */
  linkInjectionClicksPerImpression: number;
  /** Cannibalization: 2+ URLs on same query → consolidation lift factor. */
  cannibalizationConsolidationFactor: number;
  /** Template-extension: lift per additional cell (in clicks/mo). */
  templateExtensionClicksPerCell: number;
  /** Linkable-asset: ref-domains/30d threshold to flag as already-linkable. */
  linkableAssetRefDomainsFloor: number;
}

const DEFAULT_WEIGHTS: RankWeights = {
  strikingDistanceImpressionWeight: 0.06,
  ctrRescueDelta: 0.02,
  impressionFloor: 50,
  schemaFixClicksPerImpression: 0.01,
  schemaValidityFloor: 0.7,
  linkInjectionClicksPerImpression: 0.03,
  cannibalizationConsolidationFactor: 0.4,
  templateExtensionClicksPerCell: 5,
  linkableAssetRefDomainsFloor: 3,
};

/**
 * Implements the `opportunity-discovery` skill's `lift_per_effort` formula.
 * Surfaces 5-15 opportunities per week per tenant; biases toward 90/10 plays.
 *
 * Pure: no I/O. Caller supplies fixtures or live data. Optional inputs gate
 * the corresponding kinds — e.g. if `schemaAudit` is omitted, no `schema-fix`
 * opportunities are emitted.
 */
export function rankOpportunities(
  input: RankInput,
  opts: { weights?: Partial<RankWeights>; limit?: number } = {},
): Opportunity[] {
  const weights = { ...DEFAULT_WEIGHTS, ...(opts.weights ?? {}) };
  const limit = opts.limit ?? 15;
  const opps: Opportunity[] = [];

  // Index gsc by page for cross-cutting lookups.
  const gscByPage = new Map<string, GscRow[]>();
  for (const row of input.gsc) {
    const list = gscByPage.get(row.page) ?? [];
    list.push(row);
    gscByPage.set(row.page, list);
  }

  // 1 + 2: striking-distance + ctr-rescue (per-row signals from GSC).
  for (const row of input.gsc) {
    if (row.impressions < weights.impressionFloor) continue;

    if (row.position >= 4 && row.position <= 20) {
      const liftClicks = Math.round(row.impressions * weights.strikingDistanceImpressionWeight);
      opps.push({
        page: row.page,
        query: row.query,
        kind: "striking-distance",
        liftClicks,
        effort: 0.3,
        liftPerEffort: liftClicks / 0.3,
        reason: `Position ${row.position.toFixed(1)} for "${row.query}" (${row.impressions} impr).`,
      });
    }

    if (row.position <= 5 && row.ctr < 0.1) {
      const liftClicks = Math.round(row.impressions * weights.ctrRescueDelta);
      opps.push({
        page: row.page,
        query: row.query,
        kind: "ctr-rescue",
        liftClicks,
        effort: 0.15,
        liftPerEffort: liftClicks / 0.15,
        reason: `Top-5 query with CTR ${(row.ctr * 100).toFixed(1)}% — title/meta rewrite + schema.`,
      });
    }
  }

  // 3: schema-fix — pages with low validity that have material impressions.
  if (input.schemaAudit) {
    for (const audit of input.schemaAudit) {
      if (audit.validity >= weights.schemaValidityFloor) continue;
      const pageRows = gscByPage.get(audit.page) ?? [];
      const totalImpressions = pageRows.reduce((s, r) => s + r.impressions, 0);
      if (totalImpressions < weights.impressionFloor) continue;
      const topQuery = pageRows.sort((a, b) => b.impressions - a.impressions)[0]?.query ?? "";
      const liftClicks = Math.round(totalImpressions * weights.schemaFixClicksPerImpression);
      opps.push({
        page: audit.page,
        query: topQuery,
        kind: "schema-fix",
        liftClicks,
        effort: 0.1,
        liftPerEffort: liftClicks / 0.1,
        reason: `Schema validity ${(audit.validity * 100).toFixed(0)}%${audit.missing.length ? ` — missing: ${audit.missing.join(", ")}` : ""}.`,
      });
    }
  }

  // 4: link-injection — orphan pages with material impressions.
  if (input.linkGraph) {
    for (const lg of input.linkGraph) {
      if (lg.inboundLinks > 0) continue;
      const pageRows = gscByPage.get(lg.page) ?? [];
      const totalImpressions = pageRows.reduce((s, r) => s + r.impressions, 0);
      if (totalImpressions < weights.impressionFloor) continue;
      const topQuery = pageRows.sort((a, b) => b.impressions - a.impressions)[0]?.query ?? "";
      const liftClicks = Math.round(totalImpressions * weights.linkInjectionClicksPerImpression);
      opps.push({
        page: lg.page,
        query: topQuery,
        kind: "link-injection",
        liftClicks,
        effort: 0.1,
        liftPerEffort: liftClicks / 0.1,
        reason: `Orphan page with ${totalImpressions} impressions${lg.pillar ? ` in pillar "${lg.pillar}"` : ""} — inject from related pillar pages.`,
      });
    }
  }

  // 5: cannibalization-consolidation — same query ranking on 2+ pages.
  const queryToPages = new Map<string, GscRow[]>();
  for (const row of input.gsc) {
    if (row.impressions < weights.impressionFloor) continue;
    const list = queryToPages.get(row.query) ?? [];
    list.push(row);
    queryToPages.set(row.query, list);
  }
  for (const [query, rows] of queryToPages) {
    if (rows.length < 2) continue;
    rows.sort((a, b) => a.position - b.position);
    const winner = rows[0];
    const loser = rows[1];
    if (!winner || !loser) continue;
    if (winner.page === loser.page) continue;
    const lostImpressions = rows.slice(1).reduce((s, r) => s + r.impressions, 0);
    const liftClicks = Math.round(
      lostImpressions * weights.cannibalizationConsolidationFactor * Math.max(winner.ctr, 0.03),
    );
    opps.push({
      page: winner.page,
      query,
      kind: "cannibalization-consolidation",
      liftClicks,
      effort: 0.4,
      liftPerEffort: liftClicks / 0.4,
      reason: `${rows.length} URLs ranking for "${query}" — consolidate into ${winner.page} (best position ${winner.position.toFixed(1)}).`,
      relatedPages: rows.slice(1).map((r) => r.page),
    });
  }

  // 6: template-extension — templates with proven traction + room to grow.
  if (input.templates) {
    const templatePerformance = new Map<
      string,
      { totalClicks: number; pages: number; sample: TemplateUsageRow }
    >();
    for (const t of input.templates) {
      const pageRows = gscByPage.get(t.page) ?? [];
      const totalClicks = pageRows.reduce((s, r) => s + r.clicks, 0);
      const existing = templatePerformance.get(t.template);
      if (existing) {
        existing.totalClicks += totalClicks;
        existing.pages += 1;
      } else {
        templatePerformance.set(t.template, {
          totalClicks,
          pages: 1,
          sample: t,
        });
      }
    }
    for (const [template, perf] of templatePerformance) {
      if (perf.totalClicks < weights.impressionFloor) continue;
      if (perf.sample.additionalCellsAvailable <= 0) continue;
      const liftClicks = Math.round(
        perf.sample.additionalCellsAvailable * weights.templateExtensionClicksPerCell,
      );
      opps.push({
        page: perf.sample.page,
        query: template,
        kind: "template-extension",
        liftClicks,
        effort: 0.5,
        liftPerEffort: liftClicks / 0.5,
        reason: `Template "${template}" averages ${(perf.totalClicks / perf.pages).toFixed(0)} clicks/page across ${perf.pages} cells; ${perf.sample.additionalCellsAvailable} more available.`,
      });
    }
  }

  // 7: linkable-asset — pages already attracting backlinks; double down.
  if (input.backlinks) {
    for (const bl of input.backlinks) {
      if (bl.newReferringDomains30d < weights.linkableAssetRefDomainsFloor) continue;
      const pageRows = gscByPage.get(bl.page) ?? [];
      const totalImpressions = pageRows.reduce((s, r) => s + r.impressions, 0);
      if (totalImpressions < weights.impressionFloor) continue;
      const topQuery = pageRows.sort((a, b) => b.impressions - a.impressions)[0]?.query ?? "";
      // Lift = naturalized 5% of total impressions per ref-domain (conservative).
      const liftClicks = Math.round(totalImpressions * 0.005 * bl.newReferringDomains30d);
      opps.push({
        page: bl.page,
        query: topQuery,
        kind: "linkable-asset",
        liftClicks,
        effort: 0.6,
        liftPerEffort: liftClicks / 0.6,
        reason: `${bl.newReferringDomains30d} new referring domains in 30d (${bl.totalBacklinks} total). Promote with digital PR; build clusters around it.`,
      });
    }
  }

  // GA4 enrichment: low-conversion striking-distance opps get a CTA tag.
  if (input.ga4) {
    const lowConvIndex = new Map(
      input.ga4.filter((r) => r.conversionRate < 0.01).map((r) => [r.page, r]),
    );
    for (const opp of opps) {
      if (lowConvIndex.has(opp.page) && opp.kind === "striking-distance") {
        opp.reason += " GA4 shows low conversion — pair with CTA refresh.";
      }
    }
  }

  return opps.sort((a, b) => b.liftPerEffort - a.liftPerEffort).slice(0, limit);
}
