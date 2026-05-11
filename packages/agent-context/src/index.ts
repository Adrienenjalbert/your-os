/**
 * @your-os/agent-context
 *
 * Generates per-tenant `AGENTS.md` (and Cursor rules) from `tenant.config.ts`
 * and the `@your-os/skills` catalog. Filters skills by tenant business model +
 * Strapi mode so a code-mode B2C tenant doesn't see B2B Strapi guidance.
 */
export { renderAgentsMd, type RenderAgentsMdOptions } from "./render-agents-md.js";
export { renderCursorRules, type RenderCursorRulesOptions } from "./render-cursor-rules.js";
