import { type TenantConfig, parseTenantConfig } from "@your-os/tenant-config";
import type { Brief } from "../schema.js";
import { briefToTenantConfig } from "../translate.js";
import type { ConfirmedReport } from "./confirm-gates.js";

/**
 * Brief + confirmed AI Research → final TenantConfig. The translator handles
 * the brief side; this layer adds research outputs (extra ICPs, additional
 * DBAs, additional pillars, refined schema, tool-fit-driven `tools.enabled`).
 */
export function enrichWithResearch(brief: Brief, report: ConfirmedReport): TenantConfig {
  const base = briefToTenantConfig(brief);

  const dbas = mergeDbas(base.brand.distinctiveAssets, report.dbaProposals);
  const icps = mergeIcps(base.audience.icps, report.icpProposals);
  const pillars = mergePillars(base.seo.pillars, report.pillarProposals);
  const tools = report.toolFit.suggestedTool
    ? [report.toolFit.suggestedTool.kind]
    : base.tools.enabled;

  const merged = {
    ...base,
    brand: { ...base.brand, distinctiveAssets: dbas },
    audience: { ...base.audience, icps },
    seo: {
      ...base.seo,
      primarySchemaType: report.schema.primary || base.seo.primarySchemaType,
      pillars,
    },
    tools: { enabled: tools },
  };
  return parseTenantConfig(merged);
}

function mergeDbas(
  base: TenantConfig["brand"]["distinctiveAssets"],
  proposed: ConfirmedReport["dbaProposals"],
): TenantConfig["brand"]["distinctiveAssets"] {
  const seen = new Set(base.map((b) => `${b.type}:${b.value.toLowerCase()}`));
  const additions = proposed
    .filter((p) => !seen.has(`${p.type}:${p.value.toLowerCase()}`))
    .map((p) => ({ type: p.type, value: p.value, prevalenceTarget: p.prevalenceTarget ?? 0.8 }));
  return [...base, ...additions];
}

function mergeIcps(
  base: TenantConfig["audience"]["icps"],
  proposed: ConfirmedReport["icpProposals"],
): TenantConfig["audience"]["icps"] {
  const seen = new Set(base.map((i) => i.id));
  const additions = proposed
    .filter((p) => !seen.has(p.id))
    .map((p) => ({
      id: p.id,
      role: p.role,
      industry: p.industry,
      cep: p.cep,
    }));
  return [...base, ...additions];
}

function mergePillars(
  base: TenantConfig["seo"]["pillars"],
  proposed: ConfirmedReport["pillarProposals"],
): TenantConfig["seo"]["pillars"] {
  const seen = new Set(base.map((p) => p.slug));
  const additions = proposed
    .filter((p) => !seen.has(p.slug))
    .map((p) => ({ slug: p.slug, name: p.name, intent: p.intent }));
  return [...base, ...additions];
}
