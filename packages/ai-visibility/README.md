# @your-os/ai-visibility

AI-search citation tracking. **v1 = manual CSV import** from Profound / Peec / Otterly exports. In-house scraping is deferred to v2.

## Why CSV import in v1

The plan ([VISION.md](../../VISION.md)) defers in-house scraping until design partners confirm AI citation share is decision-relevant for them. Vendors (Profound, Peec) already do this well; we re-use their data and own the **enforcement** (brand-lint citation density at publish time) and the **integration** (citation share reuses our pillar/persona taxonomy).

## What this package does

- `parseProfoundExport(csv)` → `Citation[]`
- `parsePeecExport(csv)` → `Citation[]`
- `aggregateByPillar(citations, pillarMap)` → per-pillar share-of-citation
- `aggregateByPersona(citations, personaTags)` → per-persona share-of-citation
- `wowDelta(thisWeek, lastWeek)` → comparison numbers ready for the console KPI

Pure. No SDK calls.

## Usage

```ts
import {
  parseProfoundExport,
  aggregateByPillar,
  wowDelta,
} from "@your-os/ai-visibility";

const csv = await fs.readFile("profound-2026-w20.csv", "utf-8");
const citations = parseProfoundExport(csv);
const byPillar = aggregateByPillar(citations, pillarMap);
```

## Stability

`alpha`. v2 will ship an in-house scraper with prompt-set management once we know what design partners actually want to track.
