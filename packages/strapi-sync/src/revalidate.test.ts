import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { createRevalidateHandler } from "./revalidate.js";

const SECRET = "super-secret";
const TENANT = "career-hub";

function sign(body: string): string {
  return createHmac("sha256", SECRET).update(body).digest("hex");
}

describe("createRevalidateHandler", () => {
  it("rejects missing or invalid signatures", async () => {
    const invalidate = vi.fn();
    const handler = createRevalidateHandler({
      tenantSlug: TENANT,
      webhookSecret: SECRET,
      invalidate,
    });
    const r = await handler("{}", "wrong");
    expect(r.status).toBe(401);
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("rejects malformed payloads", async () => {
    const handler = createRevalidateHandler({
      tenantSlug: TENANT,
      webhookSecret: SECRET,
      invalidate: () => undefined,
    });
    const body = "not-json";
    const r = await handler(body, sign(body));
    expect(r.status).toBe(400);
  });

  it("invalidates entry + collection tags on entry.publish", async () => {
    const calls: string[] = [];
    const onRevalidate = vi.fn();
    const handler = createRevalidateHandler({
      tenantSlug: TENANT,
      webhookSecret: SECRET,
      invalidate: (t) => {
        calls.push(t);
      },
      onRevalidate,
    });
    const body = JSON.stringify({
      event: "entry.publish",
      model: "api::article.article",
      entry: { id: 7, slug: "remote-work-vs-office" },
    });
    const r = await handler(body, sign(body));
    expect(r.status).toBe(200);
    expect(calls).toEqual(["career-hub:article:remote-work-vs-office", "career-hub:article"]);
    expect(onRevalidate).toHaveBeenCalledOnce();
  });

  it("falls back to entry id when no slug is present", async () => {
    const calls: string[] = [];
    const handler = createRevalidateHandler({
      tenantSlug: TENANT,
      webhookSecret: SECRET,
      invalidate: (t) => {
        calls.push(t);
      },
    });
    const body = JSON.stringify({
      event: "entry.update",
      model: "api::pillar.pillar",
      entry: { id: 99 },
    });
    const r = await handler(body, sign(body));
    expect(r.status).toBe(200);
    expect(calls[0]).toBe("career-hub:pillar:99");
  });
});
