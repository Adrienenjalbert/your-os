export interface PreviewHandlerOptions {
  /** Shared secret expected as `?secret=...`. */
  previewSecret: string;
  /** Optional allow-list of slugs/paths the preview link can target. */
  allowedPathPrefixes?: string[];
}

export interface PreviewActions {
  enableDraftMode: () => Promise<void> | void;
  disableDraftMode: () => Promise<void> | void;
  redirect: (path: string) => unknown;
  json: (body: unknown, status: number) => unknown;
}

/**
 * Returns a framework-agnostic preview handler. In Next.js App Router:
 *
 *   import { draftMode } from "next/headers";
 *   import { redirect } from "next/navigation";
 *   const handler = createPreviewHandler({ previewSecret });
 *   export async function GET(req: Request) {
 *     const url = new URL(req.url);
 *     return handler({
 *       secret: url.searchParams.get("secret"),
 *       slug: url.searchParams.get("slug"),
 *     }, {
 *       enableDraftMode: async () => (await draftMode()).enable(),
 *       disableDraftMode: async () => (await draftMode()).disable(),
 *       redirect: (p) => redirect(p),
 *       json: (b, s) => Response.json(b, { status: s }),
 *     });
 *   }
 */
export function createPreviewHandler(opts: PreviewHandlerOptions) {
  return async (
    params: { secret: string | null; slug: string | null },
    actions: PreviewActions,
  ) => {
    if (params.secret !== opts.previewSecret) {
      return actions.json({ error: "invalid preview secret" }, 401);
    }
    const slug = params.slug ?? "/";
    if (opts.allowedPathPrefixes?.length) {
      const ok = opts.allowedPathPrefixes.some((p) => slug.startsWith(p));
      if (!ok) return actions.json({ error: "path not allowed in preview" }, 403);
    }
    await actions.enableDraftMode();
    return actions.redirect(slug);
  };
}

export function createExitPreviewHandler() {
  return async (actions: PreviewActions) => {
    await actions.disableDraftMode();
    return actions.redirect("/");
  };
}
