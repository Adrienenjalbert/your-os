import {
  type LintIssue,
  buildRulesFromTenantConfig,
  defaultRules,
  lintFile,
} from "@your-os/brand-lint";
import type { TenantConfig } from "@your-os/tenant-config";

export interface BrandLintHookOptions {
  /** The tenant's parsed `TenantConfig`. Optional — defaults applied if absent. */
  tenantConfig?: TenantConfig;
  /** Names of attributes (richtext / text) to concatenate and lint. */
  bodyFields: string[];
  /** Severity threshold that blocks publish. Defaults to "block". */
  blockingSeverity?: "block" | "warn";
  /** Override the synthetic filename used in lint messages. Defaults to `<contentType>:<id|new>`. */
  filenameForEntry?: (event: StrapiLifecycleEvent) => string;
}

export interface LintEntryResult {
  blocking: LintIssue[];
  nonBlocking: LintIssue[];
}

/** Subset of Strapi 5's lifecycle event we rely on (typed loosely on purpose). */
interface StrapiLifecycleEvent {
  action: string;
  model: { uid: string; singularName?: string };
  params: { data?: Record<string, unknown>; where?: Record<string, unknown> };
}

/** Strapi-injected ApplicationError class. Loosely typed to keep us framework-agnostic. */
type ApplicationErrorCtor = new (message: string, details?: Record<string, unknown>) => Error;

declare const strapi:
  | {
      errors?: { ApplicationError?: ApplicationErrorCtor };
      log?: { warn: (msg: string) => void };
    }
  | undefined;

/**
 * Lints the publish payload of a Strapi entry. Pure — does not touch Strapi
 * internals; safe to unit-test outside Strapi.
 */
export function lintEntry(
  event: StrapiLifecycleEvent,
  opts: BrandLintHookOptions,
): LintEntryResult {
  const data = event.params?.data ?? {};
  const blob = opts.bodyFields
    .map((field) => {
      const v = data[field];
      return typeof v === "string" ? v : "";
    })
    .filter(Boolean)
    .join("\n\n");
  if (!blob) return { blocking: [], nonBlocking: [] };

  const rules = opts.tenantConfig ? buildRulesFromTenantConfig(opts.tenantConfig) : defaultRules;
  const filename = opts.filenameForEntry?.(event) ?? `${event.model.uid}:${data.id ?? "new"}`;
  const issues = lintFile(blob, filename, rules);

  const block = opts.blockingSeverity ?? "block";
  const blocking: LintIssue[] = [];
  const nonBlocking: LintIssue[] = [];
  for (const issue of issues) {
    if (issue.severity === block || (block === "warn" && issue.severity === "block")) {
      blocking.push(issue);
    } else {
      nonBlocking.push(issue);
    }
  }
  return { blocking, nonBlocking };
}

/**
 * Returns Strapi 5 lifecycles to drop into `lifecycles.ts` of any
 * content-type. Block on `beforePublish` and `beforeUpdate` (when Strapi
 * sets `publishedAt` from null → non-null in the same call).
 */
export function createBrandLintLifecycles(opts: BrandLintHookOptions) {
  const guard = (event: StrapiLifecycleEvent, requirePublishingSemantics: boolean) => {
    if (requirePublishingSemantics) {
      const publishing = (event.params?.data as { publishedAt?: unknown } | undefined)?.publishedAt;
      if (publishing === undefined) return;
    }
    const result = lintEntry(event, opts);
    if (result.nonBlocking.length > 0 && typeof strapi !== "undefined" && strapi?.log?.warn) {
      for (const w of result.nonBlocking) {
        strapi.log.warn(`[brand-lint] ${w.severity} ${w.rule}: ${w.text}`);
      }
    }
    if (result.blocking.length === 0) return;

    const message = `Brand-lint blocked publish:\n${result.blocking
      .map((i) => `- [${i.severity}] ${i.rule}: ${i.text} (line ${i.line}) → ${i.fix}`)
      .join("\n")}`;

    const Err =
      typeof strapi !== "undefined" && strapi?.errors?.ApplicationError
        ? strapi.errors.ApplicationError
        : Error;
    throw new Err(message, { issues: result.blocking });
  };

  return {
    beforePublish(event: StrapiLifecycleEvent) {
      guard(event, false);
    },
    beforeUpdate(event: StrapiLifecycleEvent) {
      guard(event, true);
    },
  };
}
