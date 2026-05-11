---
"@your-os/tenant-config": minor
"@your-os/brand-lint": minor
"@your-os/measurement": minor
---

v2 strategic upgrade — funnel discipline + measurement layer.

- `@your-os/tenant-config`: adds optional `funnel` (intentMap, microConversions, domainAuthorityThreshold) and `email` (provider, sequences, defaults) fields. Existing tenants are unaffected (defaults applied at parse time). Adds `TenantConfigInput` type and changes `defineTenant`'s constraint to use the input shape so newly-added defaulted fields don't break existing literal configs.
- `@your-os/brand-lint`: adds funnel-discipline structured rules `INTENT_CTA_MISMATCH`, `TOOL_GATE_WITHOUT_SERP_CHECK`, `NURTURE_ORPHAN_SIGNUP`, `BOFU_HEAVY_NEW_HUB`. Each is bypassable with a documented `serpOverride`. The existing pure-text `lintFile()` is unchanged.
- `@your-os/measurement` (new): ROOS forecast band at brief time (`forecastRoos`), 30/60/90 reconciliation against actuals (`reconcileActuals`), Strapi-shaped variance write-back (`briefVarianceWriteBack`), per-session lead scoring from micro-conversion events (`scoreLead`).
