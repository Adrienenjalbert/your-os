import { describe, expect, it } from "vitest";
import { type Migration, MigrationRunner } from "./migration-runner.js";
import { CONTENT_TYPES } from "./schema.js";

const m1: Migration = {
  id: "001-initial-schema",
  description: "create initial content-types",
  up: async () => {
    /* noop */
  },
};
const m2: Migration = {
  id: "002-add-funnel-stage",
  description: "add funnelStage enum to article",
  appliesAfter: "1.0.0",
  up: async () => {
    /* noop */
  },
};

describe("MigrationRunner", () => {
  const runner = new MigrationRunner([m1, m2], CONTENT_TYPES);
  const ctx = {
    baseUrl: "http://localhost:1337",
    adminToken: "x",
    fromVersion: null,
    toVersion: "1.1.0",
  };

  it("plan() lists migrations to apply in order on first run", () => {
    const plan = runner.plan(null);
    expect(plan.willApply).toEqual(["001-initial-schema", "002-add-funnel-stage"]);
  });

  it("plan() skips migrations with appliesAfter <= fromVersion", () => {
    const plan = runner.plan("1.0.5");
    expect(plan.willApply).toEqual(["001-initial-schema"]);
    expect(plan.willSkip).toEqual(["002-add-funnel-stage"]);
  });

  it("migrate() applies pending and records errors", async () => {
    const failing: Migration = {
      id: "999-broken",
      description: "broken on purpose",
      up: async () => {
        throw new Error("nope");
      },
    };
    const r = new MigrationRunner([m1, failing], CONTENT_TYPES);
    const result = await r.migrate(ctx);
    expect(result.applied).toEqual(["001-initial-schema"]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.error).toBe("nope");
  });

  it("listContentTypes exposes the schema-as-code surface", () => {
    expect(runner.listContentTypes()).toBe(CONTENT_TYPES);
  });
});
