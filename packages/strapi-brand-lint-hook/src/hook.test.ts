import { describe, expect, it } from "vitest";
import { createBrandLintLifecycles, lintEntry } from "./hook.js";

const event = (data: Record<string, unknown>) => ({
  action: "publish",
  model: { uid: "api::article.article", singularName: "article" },
  params: { data },
});

describe("lintEntry", () => {
  it("returns no issues for clean copy", () => {
    const r = lintEntry(event({ body: "Career Hub helps workers find shifts." }), {
      bodyFields: ["body"],
    });
    expect(r.blocking).toEqual([]);
  });

  it("returns blocking issues for banned phrases", () => {
    const r = lintEntry(
      event({
        body: "We work tirelessly to deliver world-class results in this fast-paced market.",
      }),
      { bodyFields: ["body"] },
    );
    expect(r.blocking.length + r.nonBlocking.length).toBeGreaterThan(0);
  });

  it("ignores non-string fields silently", () => {
    const r = lintEntry(event({ body: 123 as unknown as string }), { bodyFields: ["body"] });
    expect(r.blocking).toEqual([]);
  });

  it("concatenates multiple body fields", () => {
    const r = lintEntry(
      event({ intro: "We work tirelessly", body: "to deliver world-class results." }),
      { bodyFields: ["intro", "body"] },
    );
    expect(r.blocking.length + r.nonBlocking.length).toBeGreaterThan(0);
  });
});

describe("createBrandLintLifecycles", () => {
  it("does not throw on clean publish", () => {
    const lc = createBrandLintLifecycles({ bodyFields: ["body"] });
    expect(() =>
      lc.beforePublish(event({ body: "Clean copy that cites SSA in 2024." })),
    ).not.toThrow();
  });

  it("throws on dirty publish", () => {
    const lc = createBrandLintLifecycles({ bodyFields: ["body"] });
    expect(() =>
      lc.beforePublish(event({ body: "We work tirelessly to deliver world-class results." })),
    ).toThrow(/Brand-lint blocked publish/);
  });

  it("only enforces beforeUpdate when transitioning to published", () => {
    const lc = createBrandLintLifecycles({ bodyFields: ["body"] });
    expect(() =>
      lc.beforeUpdate(event({ body: "We work tirelessly to deliver world-class results." })),
    ).not.toThrow();
    expect(() =>
      lc.beforeUpdate(
        event({
          publishedAt: "2026-01-01T00:00:00Z",
          body: "We work tirelessly to deliver world-class results.",
        }),
      ),
    ).toThrow();
  });
});
