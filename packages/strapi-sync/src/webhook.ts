import { createHmac, timingSafeEqual } from "node:crypto";

export type StrapiWebhookEventName =
  | "entry.create"
  | "entry.update"
  | "entry.delete"
  | "entry.publish"
  | "entry.unpublish"
  | "media.create"
  | "media.update"
  | "media.delete";

export interface StrapiWebhookEvent {
  event: StrapiWebhookEventName;
  /** Strapi UID, e.g. "api::article.article" */
  model: string;
  /** Strapi entry; we only require `id` + optionally `slug`. */
  entry: { id: number | string; slug?: string; [k: string]: unknown };
  createdAt?: string;
}

export function parseStrapiWebhookEvent(payload: unknown): StrapiWebhookEvent {
  if (!payload || typeof payload !== "object") {
    throw new Error("Webhook payload is not an object");
  }
  const p = payload as Record<string, unknown>;
  if (typeof p.event !== "string") throw new Error("Missing webhook `event`");
  if (typeof p.model !== "string") throw new Error("Missing webhook `model`");
  if (!p.entry || typeof p.entry !== "object") throw new Error("Missing webhook `entry`");
  return {
    event: p.event as StrapiWebhookEventName,
    model: p.model,
    entry: p.entry as StrapiWebhookEvent["entry"],
    createdAt: typeof p.createdAt === "string" ? p.createdAt : undefined,
  };
}

/**
 * HMAC SHA-256 verification. Strapi 5 signs the raw body with the configured
 * webhook secret; the signature is delivered in the `X-Strapi-Signature` header
 * (or `Authorization: Bearer <sig>` depending on configuration).
 *
 * Always uses constant-time comparison to defeat timing oracles.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null | undefined,
  secret: string,
): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature.replace(/^sha256=/, ""), "utf8");
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Canonical tag for a single entry. Used as the `revalidateTag` arg by
 * the Next.js page when it `fetch`es Strapi.
 */
export function buildEntryTag(
  tenantSlug: string,
  model: string,
  slugOrId: string | number,
): string {
  const contentType = model.replace(/^api::/, "").split(".")[0];
  return `${tenantSlug}:${contentType}:${slugOrId}`;
}

/** Collection-wide tag (e.g. used by index pages that paginate over a model). */
export function buildCollectionTag(tenantSlug: string, model: string): string {
  const contentType = model.replace(/^api::/, "").split(".")[0];
  return `${tenantSlug}:${contentType}`;
}
