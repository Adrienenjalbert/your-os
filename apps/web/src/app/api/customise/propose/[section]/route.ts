import { getResearchProvider } from "@/server/provider-factory";
import { readTenantConfig, seedTenantConfig } from "@/server/tenant-store";
import type { Brief } from "@your-os/configurator";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Per-section AI propose endpoint for the Customise panel.
 *
 * Takes the current `tenant.config.ts` (or the seed when none exists), maps
 * it to the configurator's `Brief` shape, and calls the matching
 * `ResearchProvider` method. The returned proposals are rendered as
 * ChoiceCards on the client; the user picks N and commits via the existing
 * `PATCH /api/tenant-config` endpoint.
 *
 * Hybrid mode is honoured automatically because we go through
 * `getResearchProvider()` (mock in dev/CI, live when env keys are set).
 */
type Section = "audience" | "brand" | "seo" | "schema" | "tool-fit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const start = Date.now();
  const tenant = (await readTenantConfig()) ?? null;
  const seed = seedTenantConfig();
  const tenantOrSeed = tenant ?? seed;
  const brief = tenantConfigToBrief(tenantOrSeed);
  const provider = getResearchProvider();

  let payload: unknown;
  try {
    switch (section as Section) {
      case "audience":
        payload = { kind: "icps", items: await provider.proposeIcps(brief) };
        break;
      case "brand":
        payload = { kind: "dbas", items: await provider.proposeDbas(brief) };
        break;
      case "seo":
        payload = { kind: "pillars", items: await provider.proposePillars(brief) };
        break;
      case "schema":
        payload = { kind: "schema", items: [await provider.selectPrimarySchema(brief)] };
        break;
      case "tool-fit":
        payload = { kind: "tool-fit", items: [await provider.scoreToolFit(brief)] };
        break;
      default:
        return NextResponse.json({ error: `Unknown section: ${section}` }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }

  return NextResponse.json({
    section,
    durationMs: Date.now() - start,
    payload,
  });
}

/**
 * Map a (possibly partial) tenant config back into the Brief shape the
 * configurator's ResearchProvider expects. We only need enough fields for
 * each propose method to produce sensible suggestions; missing fields fall
 * back to the seed so the live provider always sees a complete brief.
 */
function tenantConfigToBrief(t: ReturnType<typeof seedTenantConfig>): Brief {
  const persona = t.audience.personas?.[0];
  const dba = t.brand.distinctiveAssets?.[0];
  return {
    identity: {
      name: t.identity.name,
      slug: t.identity.slug,
      domain: t.identity.domain,
      industry: t.identity.industry,
      businessModel:
        t.identity.businessModel === "b2c" ||
        t.identity.businessModel === "b2b" ||
        t.identity.businessModel === "marketplace"
          ? t.identity.businessModel
          : "b2c",
    },
    audience: {
      primaryPersona: persona
        ? { name: persona.name, pain: persona.pain, value: persona.value }
        : { name: "Primary persona", pain: "TBD", value: "TBD" },
    },
    conversion: {
      primary:
        t.conversion.primary === "newsletter" ||
        t.conversion.primary === "lead_form" ||
        t.conversion.primary === "demo_booking" ||
        t.conversion.primary === "sql" ||
        t.conversion.primary === "purchase" ||
        t.conversion.primary === "app_install"
          ? t.conversion.primary
          : "newsletter",
      ctaPattern: t.conversion.ctaPattern,
    },
    brand: {
      primaryDistinctiveAsset: dba?.value ?? "Brand asset",
      voiceTone: t.brand.voice.tone,
      readingLevel: coerceReadingLevel(t.brand.voice.readingLevel),
      pov: t.brand.voice.pov,
    },
    seo: {
      primarySchemaType: t.seo.primarySchemaType,
      pillars: t.seo.pillars.map((p) => ({
        slug: p.slug,
        name: p.name,
        intent:
          p.intent === "informational" ||
          p.intent === "transactional" ||
          p.intent === "commercial" ||
          p.intent === "navigational"
            ? p.intent
            : "informational",
      })),
    },
    contentStorage: { mode: "code" },
  };
}

const READING_LEVELS = [
  "6th_grade",
  "7th_grade",
  "8th_grade",
  "9th_grade",
  "10th_grade",
  "college",
] as const;
type ReadingLevel = (typeof READING_LEVELS)[number];
function coerceReadingLevel(raw: string): ReadingLevel {
  return (READING_LEVELS as readonly string[]).includes(raw) ? (raw as ReadingLevel) : "8th_grade";
}
