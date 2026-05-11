/**
 * Import + aggregate AI citations from vendor CSV exports.
 *
 * v1 supports Profound and Peec column conventions. Both vendors ship a row
 * per (engine × prompt × cited URL × week). We coalesce to a single Citation
 * shape so downstream aggregation doesn't care about the vendor.
 */
import { parseCsv } from "./csv.js";

export type AiEngine = "chatgpt" | "perplexity" | "claude" | "gemini" | "ai-overviews";

export interface Citation {
  /** ISO date (week-start). */
  weekStart: string;
  engine: AiEngine;
  /** The user-facing prompt that triggered the citation. */
  prompt: string;
  /** The URL cited. */
  url: string;
  /** Position of the URL in the answer (1 = first link). */
  position: number;
  /** Vendor-specific share metric, normalized 0..1 if known. */
  share?: number;
}

/**
 * Parse a Profound CSV export.
 *
 * Expected columns (case-insensitive):
 *   week, engine, prompt, citation_url, position, share_pct
 */
export function parseProfoundExport(csv: string): Citation[] {
  const rows = parseCsv(csv);
  if (rows.length === 0) return [];
  const header = rows[0]!.map((h) => h.toLowerCase().trim());
  const idx = (key: string) => header.indexOf(key);
  const wIdx = idx("week");
  const eIdx = idx("engine");
  const pIdx = idx("prompt");
  const uIdx = idx("citation_url");
  const posIdx = idx("position");
  const shareIdx = idx("share_pct");
  if (wIdx < 0 || eIdx < 0 || pIdx < 0 || uIdx < 0) {
    throw new Error("Profound CSV: missing required columns (week, engine, prompt, citation_url).");
  }
  const out: Citation[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]!;
    if (row.length < header.length) continue;
    out.push({
      weekStart: row[wIdx] ?? "",
      engine: normalizeEngine(row[eIdx] ?? ""),
      prompt: row[pIdx] ?? "",
      url: row[uIdx] ?? "",
      position: posIdx >= 0 ? Number(row[posIdx]) || 0 : 0,
      share: shareIdx >= 0 ? safePctToFraction(row[shareIdx]) : undefined,
    });
  }
  return out;
}

/**
 * Parse a Peec CSV export.
 *
 * Expected columns (case-insensitive):
 *   date, ai_engine, prompt_text, source_url, rank, voice_share
 */
export function parsePeecExport(csv: string): Citation[] {
  const rows = parseCsv(csv);
  if (rows.length === 0) return [];
  const header = rows[0]!.map((h) => h.toLowerCase().trim());
  const idx = (key: string) => header.indexOf(key);
  const dIdx = idx("date");
  const eIdx = idx("ai_engine");
  const pIdx = idx("prompt_text");
  const uIdx = idx("source_url");
  const rIdx = idx("rank");
  const sIdx = idx("voice_share");
  if (dIdx < 0 || eIdx < 0 || pIdx < 0 || uIdx < 0) {
    throw new Error(
      "Peec CSV: missing required columns (date, ai_engine, prompt_text, source_url).",
    );
  }
  const out: Citation[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]!;
    if (row.length < header.length) continue;
    out.push({
      weekStart: row[dIdx] ?? "",
      engine: normalizeEngine(row[eIdx] ?? ""),
      prompt: row[pIdx] ?? "",
      url: row[uIdx] ?? "",
      position: rIdx >= 0 ? Number(row[rIdx]) || 0 : 0,
      share: sIdx >= 0 ? safePctToFraction(row[sIdx]) : undefined,
    });
  }
  return out;
}

function normalizeEngine(raw: string): AiEngine {
  const r = raw.toLowerCase().trim();
  if (r.includes("chatgpt") || r === "openai") return "chatgpt";
  if (r.includes("perplexity")) return "perplexity";
  if (r.includes("claude") || r === "anthropic") return "claude";
  if (r.includes("gemini")) return "gemini";
  if (r.includes("overview") || r === "ai mode") return "ai-overviews";
  return "chatgpt"; // sensible default; flagged by the caller in the console UI.
}

function safePctToFraction(raw: string | undefined): number | undefined {
  if (raw === undefined) return undefined;
  const trimmed = raw.replace("%", "").trim();
  if (trimmed === "") return undefined;
  const n = Number(trimmed);
  if (Number.isNaN(n)) return undefined;
  if (n > 1) return Math.min(n / 100, 1);
  return n;
}
