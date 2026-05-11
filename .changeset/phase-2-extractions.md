---
"@your-os/content-types": minor
"@your-os/core": minor
"@your-os/analytics": minor
"@your-os/pseo-engine": minor
"@your-os/tools-engine": minor
"@your-os/cli": minor
"@your-os/agent-context": minor
"@your-os/skills": minor
---

Phase 2 heavy extractions.

- `@your-os/content-types`: 11 Zod-validated entity schemas (Article, Guide, Tool, Pillar, Cluster, Persona, ICP, CaseStudy, RoleGuide, Location, OpportunityBrief) with universal SEO field bundle.
- `@your-os/core`: CMS-agnostic page shells (StandardPageLayout, ContentPageShell, ToolPageShell, RolePageShell, PageContainer, PageSection, FAQSection, CTASection, InternalLinkHub, Breadcrumbs) + tenant theming bridge.
- `@your-os/analytics`: provider-agnostic dispatcher (gtag, posthog, noop transports) reading conversion event from tenant config + UTM extraction helper.
- `@your-os/pseo-engine`: N-dimensional cell generator (cartesian product with skip + dedupe), template renderer, uniqueness ratio (5-gram fingerprinting).
- `@your-os/tools-engine`: defineTool/runTool framework with input validation + tool registry.
- `@your-os/cli`: `your-os init|sync|lint|add` commands + Strapi command stubs (Phase 2B). Programmatic API exposed for the configurator (Phase 3).
- `@your-os/agent-context`: tenant-aware AGENTS.md + .cursor/rules generators (filters skills by business model + Strapi mode).
- `@your-os/skills`: 15 trimmed skills across code/seo/content/ops/strapi families. Strapi family auto-filtered for non-Strapi tenants.

Phase 2 gate: `examples/minimal` builds + 8 integration tests pass + every package consumed end-to-end. Total workspace: 25 build tasks, 37 lint+typecheck+test tasks, all green.
