import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  buildCollectionTag,
  buildEntryTag,
  parseStrapiWebhookEvent,
  verifyWebhookSignature,
} from "./webhook.js";

describe("verifyWebhookSignature", () => {
  it("returns true for a matching SHA-256 signature", () => {
    const body = JSON.stringify({
      event: "entry.publish",
      model: "api::article.article",
      entry: { id: 1 },
    });
    const sig = createHmac("sha256", "shh").update(body).digest("hex");
    expect(verifyWebhookSignature(body, sig, "shh")).toBe(true);
    expect(verifyWebhookSignature(body, `sha256=${sig}`, "shh")).toBe(true);
  });

  it("returns false for tampered bodies + wrong signatures", () => {
    const body = "{}";
    expect(verifyWebhookSignature(body, "deadbeef", "shh")).toBe(false);
    expect(verifyWebhookSignature(body, null, "shh")).toBe(false);
    expect(verifyWebhookSignature(body, undefined, "shh")).toBe(false);
  });
});

describe("parseStrapiWebhookEvent", () => {
  it("parses a valid payload", () => {
    const e = parseStrapiWebhookEvent({
      event: "entry.publish",
      model: "api::article.article",
      entry: { id: 12, slug: "hello-world" },
    });
    expect(e.event).toBe("entry.publish");
    expect(e.entry.slug).toBe("hello-world");
  });

  it("throws on invalid payloads", () => {
    expect(() => parseStrapiWebhookEvent(null)).toThrow();
    expect(() => parseStrapiWebhookEvent({ event: "x" })).toThrow();
    expect(() => parseStrapiWebhookEvent({ event: "x", model: "y" })).toThrow();
  });
});

describe("tag helpers", () => {
  it("strips the `api::` prefix", () => {
    expect(buildEntryTag("career-hub", "api::article.article", "x")).toBe("career-hub:article:x");
    expect(buildCollectionTag("career-hub", "api::article.article")).toBe("career-hub:article");
  });
});
