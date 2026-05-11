import type { ContentTypeDefinition } from "./schema.js";

export interface MigrationContext {
  /** Strapi REST/admin URL. */
  baseUrl: string;
  /** Strapi admin token (NOT the public API token). */
  adminToken: string;
  /** From version, e.g. "1.0.0". null = first run. */
  fromVersion: string | null;
  /** To version (target). */
  toVersion: string;
  /** Whether to log to console. */
  verbose?: boolean;
}

export interface MigrationResult {
  applied: string[];
  skipped: string[];
  errors: Array<{ migration: string; error: string }>;
}

export interface Migration {
  /** Stable id used to record the applied migration. */
  id: string;
  /** Description shown in logs. */
  description: string;
  /** Optional minimum from-version for this migration to apply. */
  appliesAfter?: string | null;
  /** Apply against a Strapi instance. */
  up(ctx: MigrationContext): Promise<void>;
}

/**
 * Drives versioned migrations against a tenant's Strapi instance. The runner
 * itself is HTTP-driven (admin API) so it can run from any Node host (CI,
 * local CLI, configurator backend) without coupling to Strapi internals.
 *
 * Real Phase 2B build: each migration is a one-shot script committed alongside
 * the schema change. The runner records applied migrations in a Strapi
 * collection (`os-migrations`) and idempotently re-applies missing ones.
 */
export class MigrationRunner {
  constructor(
    private readonly migrations: readonly Migration[],
    private readonly contentTypes: readonly ContentTypeDefinition[],
  ) {}

  async migrate(ctx: MigrationContext): Promise<MigrationResult> {
    const result: MigrationResult = { applied: [], skipped: [], errors: [] };
    for (const migration of this.migrations) {
      if (this.shouldSkip(migration, ctx.fromVersion)) {
        result.skipped.push(migration.id);
        continue;
      }
      try {
        if (ctx.verbose) {
          console.log(`[migration:run] ${migration.id} — ${migration.description}`);
        }
        await migration.up(ctx);
        result.applied.push(migration.id);
      } catch (err) {
        result.errors.push({
          migration: migration.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    return result;
  }

  /** Pure preview: which migrations would run, no side effects. */
  plan(fromVersion: string | null): { willApply: string[]; willSkip: string[] } {
    const willApply: string[] = [];
    const willSkip: string[] = [];
    for (const migration of this.migrations) {
      if (this.shouldSkip(migration, fromVersion)) {
        willSkip.push(migration.id);
      } else {
        willApply.push(migration.id);
      }
    }
    return { willApply, willSkip };
  }

  /** Expose content-types so the schema-as-code surface stays inspectable. */
  listContentTypes(): readonly ContentTypeDefinition[] {
    return this.contentTypes;
  }

  private shouldSkip(migration: Migration, fromVersion: string | null): boolean {
    if (!migration.appliesAfter) return false;
    if (fromVersion === null) return false;
    return semverCompare(fromVersion, migration.appliesAfter) >= 0;
  }
}

/** Tiny semver comparator. -1 if a<b, 0 if eq, 1 if a>b. */
function semverCompare(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const ai = pa[i] ?? 0;
    const bi = pb[i] ?? 0;
    if (ai < bi) return -1;
    if (ai > bi) return 1;
  }
  return 0;
}
