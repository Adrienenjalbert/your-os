# `examples/employer-hub`

First net-new B2B tenant scaffolded by `@your-os/configurator` from
`employer-hub.brief.json`. Phase 5 of the Multi-Tenant SEO OS plan.

## What lives here

- `employer-hub.brief.json` — Discovery answers (the configurator's input).
- `tenant.config.ts` — emitted by the configurator from the brief, then mirrored here so the integration test can validate round-trip equivalence.
- `src/strapi-schema.ts` — adds B2B content-types (`ROIScenario`, `IntegrationPage`, `ComparisonPage`) on top of the OS defaults (which already provide `CaseStudy`).
- `src/data-source.ts` — wires `StrapiContentSource` for the case-studies + ROI scenarios collections.
- `src/hubspot.ts` — demo-booking submitter.
- `src/integration.test.ts` — the Phase 5 gate.

## Bootstrap

```bash
docker compose -f ../minimal-strapi/docker-compose.yml up -d
pnpm install
pnpm exec your-os strapi:migrate --tenant employer-hub --schema ./src/strapi-schema.ts
pnpm test
```

## Conversion event

`demo_booking` → posts to HubSpot Forms API (`src/hubspot.ts`). Configure
`HUBSPOT_PORTAL_ID`, `HUBSPOT_DEMO_FORM_ID`, and `HUBSPOT_PRIVATE_APP_TOKEN`
per environment.
