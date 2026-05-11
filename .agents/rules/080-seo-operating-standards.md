# Rule 080 — SEO operating standards (binding for OS contributors)

> Always-on companion to [050-growth-lead-priorities.md](050-growth-lead-priorities.md). The substantive doctrine lives in [SEO_OPERATING_STANDARDS.md](../../SEO_OPERATING_STANDARDS.md) (top-level). This rule encodes the contributor obligations when working on `packages/seo`, `packages/brand-lint`, `packages/skills/src/skills/seo*.ts`, `packages/skills/src/skills/content.ts`, and any `your-os/*.md` doc that makes SEO claims.

## Scope

This rule binds you when you:

- Add or edit a `Skill` object in `packages/skills/src/skills/{seo,seo-extended,content}.ts`.
- Add or edit a rule in `packages/brand-lint/src/{lint,rules,funnel-rules}.ts`.
- Add or edit metadata / JSON-LD / sitemap helpers in `packages/seo/src/`.
- Add or edit refresh signals in `packages/refresh-engine/src/`.
- Add or edit pSEO uniqueness logic in `packages/pseo-engine/src/`.
- Add or edit any top-level OS doc that makes SEO claims (MISSION, VISION, COMPETITIVE, AUDIENCE, AGENTS, CLAUDE, README, SEO_OPERATING_STANDARDS).

## The 6 binding obligations

### 1. Phantom-package rule (HIGHEST severity)

No skill body, README, top-level MD, or rule may reference an `@your-os/X` package or a `pnpm <command>` unless that package or script EXISTS in this workspace at the time of merge.

**Forbidden strings** (audit-derived blocklist; reject PRs that reintroduce):

- `@your-os/render-parity`
- `@your-os/sitemap`
- `@your-os/seo-foundations`
- `@your-os/web-vitals`
- `@your-os/buildHreflangTags` claimed as an existing export of `@your-os/seo`
- `seo-health` (as a package or command)
- `pnpm seo:audit`

If you need to express a future capability, use this pattern:

> "X is not yet shipped. Today, do Y. When it lands, the skill body should be updated."

### 2. Citation policy — primary-source first

When citing in a skill body or doc:

- Prefer primary sources: `web.dev`, `developers.google.com/search` (Search Central), `schema.org`, `https://arxiv.org/...` (academic), `https://llmstxt.org/`, official bot docs (OpenAI/Anthropic/Perplexity).
- Vendor blogs (Ahrefs / Backlinko / Moz / Semrush / Search Engine Journal) are acceptable secondary citations when they own the data, the framing, or the trend observation.
- Vendor-sponsored studies must be labeled in the body. Use phrasing like "_(Ahrefs study, 2025)_".
- Avoid relying solely on a vendor blog when a primary source exists.

### 3. Brand-lint contract honesty

`@your-os/brand-lint` enforces today (in code, see `lint.ts`):

- `banned_phrase` — Block.
- `ai_slop` — Block.
- `missing_citation` per dollar amount — Block.
- `missing_component_signal` (Article paths) — Warn.
- Funnel rules (caller-integrated, in `funnel-rules.ts`): `INTENT_CTA_MISMATCH`, `TOOL_GATE_WITHOUT_SERP_CHECK`, `NURTURE_ORPHAN_SIGNUP`, `BOFU_HEAVY_NEW_HUB`.

`@your-os/brand-lint` does NOT enforce today:

- DBA prevalence ≥ N% (Romaniuk-style). Specced; see `rules.ts` deferral comment. Docs may state DBA as a target — but must NOT claim CMS-level enforcement.
- `statistic-per-H2` even though `statisticPattern` exists in `rules.ts` (it is not used by `lintFile()`).

Skills, MD docs, and rules MUST NOT claim enforcement that doesn't exist in code. To move a target → enforced, raise an ADR (the `.changeset/` directory holds the precedent for ADR-shaped notes), implement the rule in `lint.ts` or `funnel-rules.ts`, then update skill bodies in the same PR.

### 4. SEO/AEO/GEO unification

Treat SEO, AEO, GEO, LLMO as one operating system. Don't fork skill trees by acronym. The `ai-seo` skill captures the LLM-specific deltas; do not create parallel `geo-seo` / `aeo-seo` skills unless an ADR justifies the duplication.

### 5. Citation-portfolio mindset

When designing or reviewing content-strategy or AI-visibility skills, encode that AI answers cite ~10+ unique URLs (Moz AI Mode study) and that off-site authority (Reddit, YouTube, Wikipedia where eligible) is part of the playbook, not an afterthought. Skills must NOT promise "rank #1 → win AI" — that's a 12% URL overlap (Moz). Plan citation portfolios.

### 6. HITL respect

These SEO actions remain HITL gates per [060-human-in-the-loop.md](060-human-in-the-loop.md), regardless of how good the automation looks:

- Cannibalization merges (see `cannibalization` skill).
- YMYL content publication.
- Indexation-blocking changes (robots.txt, noindex, large-scale canonical changes).
- Brand-fact changes that affect entity consistency.
- AI bot policy changes that block training or retrieval crawlers.

Never auto-merge or auto-publish across these gates.

## Verification before merge

When your PR touches any file in scope (see § Scope):

- Self-grep your diff for the forbidden strings in §1. Zero hits required.
- Confirm any new claim about `@your-os/*` matches `pnpm ls --recursive` output.
- Confirm any new SEO claim has a primary citation OR is labeled "industry observation" with vendor-source attribution.
- Run `pnpm --filter @your-os/skills test` if you touched skill files.
- Run `pnpm --filter @your-os/brand-lint test` if you touched lint rules.
- Update [SEO_OPERATING_STANDARDS.md](../../SEO_OPERATING_STANDARDS.md) sources appendix if you introduced a new pinned URL.

## Why this rule exists

The 2026-05 audit found multiple high-severity tensions: VISION asserted DBA enforcement that `brand-lint` deferred; AUDIENCE referenced an SEO health audit surface the repo did not ship; multiple skills referenced phantom packages. Those tensions degrade trust in the OS narrative and break agent reasoning chains. This rule encodes the prevention so they don't regrow.

## References

- [SEO_OPERATING_STANDARDS.md](../../SEO_OPERATING_STANDARDS.md) — substantive doctrine.
- [050-growth-lead-priorities.md](050-growth-lead-priorities.md) — what counts as a growth outcome.
- [060-human-in-the-loop.md](060-human-in-the-loop.md) — the HITL gates that bind SEO actions.
- [070-funnel-discipline.md](070-funnel-discipline.md) — funnel rule taxonomy + brand-lint IDs.
- [AGENTS.md](../../AGENTS.md) — catalog of always-on rules (000–080) including this one.
- `packages/brand-lint/src/lint.ts`, `rules.ts`, `funnel-rules.ts` — actual enforced rules.
- `packages/seo/src/index.ts` — actual exports.
