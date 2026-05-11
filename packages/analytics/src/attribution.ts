import type { AttributionParams } from "./tracker.js";

export function extractAttribution(
  search: string | URLSearchParams,
  keys: readonly string[] = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"],
): AttributionParams {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const out: AttributionParams = {};
  for (const key of keys) {
    const value = params.get(key);
    if (value !== null) out[key] = value;
  }
  return out;
}
