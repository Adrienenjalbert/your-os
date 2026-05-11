/**
 * @your-os/strapi-sync
 *
 * Next.js side of Strapi: HMAC-verified webhook → revalidateTag, preview/exit-preview
 * route handlers, and the canonical tag-naming scheme used everywhere.
 *
 * Tag convention: `{tenant}:{contentType}:{slug}` and `{tenant}:{contentType}` (collection-wide).
 */
export {
  buildEntryTag,
  buildCollectionTag,
  parseStrapiWebhookEvent,
  verifyWebhookSignature,
  type StrapiWebhookEvent,
  type StrapiWebhookEventName,
} from "./webhook.js";
export {
  createRevalidateHandler,
  type RevalidateHandlerOptions,
  type RevalidateResult,
} from "./revalidate.js";
export {
  createPreviewHandler,
  createExitPreviewHandler,
  type PreviewHandlerOptions,
} from "./preview.js";
export {
  StrapiContentSource,
  type StrapiContentSourceOptions,
} from "./strapi-source.js";
