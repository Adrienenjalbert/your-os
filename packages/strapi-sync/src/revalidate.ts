import {
  type StrapiWebhookEvent,
  buildCollectionTag,
  buildEntryTag,
  parseStrapiWebhookEvent,
  verifyWebhookSignature,
} from "./webhook.js";

export interface RevalidateResult {
  status: 200 | 400 | 401;
  body: { revalidated?: string[]; error?: string };
  /** Tags that were (or would be) invalidated. Useful for tests + audit logs. */
  tags: string[];
}

export interface RevalidateHandlerOptions {
  /** Tenant slug used to namespace tags (matches `tenant.config.ts` slug). */
  tenantSlug: string;
  /** Shared HMAC secret with the Strapi webhook config. */
  webhookSecret: string;
  /** Function that performs the actual cache invalidation. Inject `revalidateTag` from `next/cache`. */
  invalidate: (tag: string) => Promise<void> | void;
  /**
   * Optional hook for emitting an audit log (Datadog, console, etc.).
   * Called once per request after invalidation succeeds.
   */
  onRevalidate?: (event: StrapiWebhookEvent, tags: string[]) => void;
}

/**
 * Returns a framework-agnostic handler. In Next.js, wrap it like:
 *
 *   import { revalidateTag } from "next/cache";
 *   const handler = createRevalidateHandler({ tenantSlug, webhookSecret, invalidate: revalidateTag });
 *   export async function POST(req: Request) {
 *     const body = await req.text();
 *     const sig = req.headers.get("x-strapi-signature");
 *     const r = await handler(body, sig);
 *     return Response.json(r.body, { status: r.status });
 *   }
 */
export function createRevalidateHandler(opts: RevalidateHandlerOptions) {
  return async (
    rawBody: string,
    signature: string | null | undefined,
  ): Promise<RevalidateResult> => {
    if (!verifyWebhookSignature(rawBody, signature, opts.webhookSecret)) {
      return { status: 401, body: { error: "invalid signature" }, tags: [] };
    }

    let event: StrapiWebhookEvent;
    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
      event = parseStrapiWebhookEvent(payload);
    } catch (err) {
      return {
        status: 400,
        body: { error: err instanceof Error ? err.message : "invalid payload" },
        tags: [],
      };
    }

    const tags: string[] = [];
    const slug = (event.entry?.slug as string | undefined) ?? String(event.entry.id);
    tags.push(buildEntryTag(opts.tenantSlug, event.model, slug));
    tags.push(buildCollectionTag(opts.tenantSlug, event.model));

    for (const tag of tags) {
      await opts.invalidate(tag);
    }
    opts.onRevalidate?.(event, tags);
    return { status: 200, body: { revalidated: tags }, tags };
  };
}
