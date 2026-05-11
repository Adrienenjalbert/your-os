import type { Opportunity } from "@your-os/control-plane";
import { describe, expect, it } from "vitest";
import { opportunityQueueViewModel } from "./opportunity-queue.js";

const fixture: Opportunity[] = [
  {
    page: "/a",
    query: "warehouse jobs",
    kind: "striking-distance",
    liftClicks: 300,
    effort: 0.3,
    liftPerEffort: 1000,
    reason: "pos 8",
  },
  {
    page: "/b",
    query: "warehouse jobs",
    kind: "ctr-rescue",
    liftClicks: 40,
    effort: 0.15,
    liftPerEffort: 266.7,
    reason: "low ctr",
  },
  {
    page: "/c",
    query: "forklift jobs",
    kind: "schema-fix",
    liftClicks: 50,
    effort: 0.1,
    liftPerEffort: 500,
    reason: "missing Article schema",
  },
];

describe("opportunityQueueViewModel", () => {
  it("sorts by lift_per_effort desc and assigns stable ranks", () => {
    const vm = opportunityQueueViewModel(fixture);
    expect(vm.rows[0]?.rank).toBe(0);
    expect(vm.rows[0]?.kind).toBe("striking-distance");
    expect(vm.rows[1]?.kind).toBe("schema-fix");
    expect(vm.rows[2]?.kind).toBe("ctr-rescue");
  });

  it("filters by kinds", () => {
    const vm = opportunityQueueViewModel(fixture, { kinds: ["schema-fix"] });
    expect(vm.shownCount).toBe(1);
    expect(vm.rows[0]?.kind).toBe("schema-fix");
  });

  it("filters by free-text query", () => {
    const vm = opportunityQueueViewModel(fixture, { queryFilter: "warehouse" });
    expect(vm.shownCount).toBe(2);
    expect(vm.rows.every((r) => r.query.includes("warehouse"))).toBe(true);
  });

  it("returns groupCounts per kind", () => {
    const vm = opportunityQueueViewModel(fixture);
    expect(vm.groupCounts["striking-distance"]).toBe(1);
    expect(vm.groupCounts["schema-fix"]).toBe(1);
    expect(vm.groupCounts["ctr-rescue"]).toBe(1);
  });

  it("respects limit", () => {
    const vm = opportunityQueueViewModel(fixture, { limit: 1 });
    expect(vm.shownCount).toBe(1);
    expect(vm.rows).toHaveLength(1);
  });
});
