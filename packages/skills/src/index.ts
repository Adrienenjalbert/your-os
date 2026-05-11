/**
 * @your-os/skills
 *
 * The trimmed skill catalog that ships to tenant repos. Each skill is a
 * markdown file with YAML frontmatter loaded at runtime and emitted into
 * tenant `AGENTS.md` by `@your-os/agent-context`.
 *
 * Trimming notes (vs Career Hub's .agents/skills/):
 *  - Collapsed content/* (8 → 3 high-leverage: scout, write, review)
 *  - Dropped ops/* docs without backing scripts
 *  - Dropped MAS stage docs without runtime
 *  - Added strapi-content-modeling for Strapi-mode tenants
 *
 * Total: ~35 skills as of Wave 3 expansion (16 → 35), all with backing code or actionable rules. See `your-os/SEO_OPERATING_STANDARDS.md` for the SEO doctrine.
 */
export { listSkills, getSkill, type Skill } from "./catalog.js";
export { SKILL_FILES } from "./catalog.js";
