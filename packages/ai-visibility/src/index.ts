/**
 * @your-os/ai-visibility — v1 (CSV import only)
 *
 * Pure helpers for ingesting Profound / Peec CSV exports and aggregating
 * citations into pillar / persona share. v2 will add an in-house scraper
 * once design partners confirm citation share matters to their decisions.
 */
export {
  parseProfoundExport,
  parsePeecExport,
  type AiEngine,
  type Citation,
} from "./import.js";

export {
  aggregateByPillar,
  aggregateByPersona,
  wowDelta,
  type PillarMap,
  type PersonaTags,
  type PillarShare,
  type PersonaShare,
  type WowDelta,
} from "./aggregate.js";

export { parseCsv } from "./csv.js";
