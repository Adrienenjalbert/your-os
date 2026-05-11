import { describe, expect, it } from "vitest";
import { createToolRegistry } from "./registry.js";
import { defineTool, runTool } from "./tool.js";

const earningsCalc = defineTool({
  slug: "earnings-calculator",
  name: "Earnings Calculator",
  description: "Estimate take-home weekly earnings from shifts.",
  inputs: [
    { key: "hourlyRate", label: "Hourly rate ($)", type: "number", min: 1, max: 200 },
    { key: "hoursPerWeek", label: "Hours/week", type: "number", min: 0, max: 80 },
    { key: "weeks", label: "Weeks", type: "number", min: 1, max: 52, defaultValue: 50 },
  ],
  outputs: [
    {
      key: "annualGross",
      label: "Annual gross",
      formula: ({ hourlyRate, hoursPerWeek, weeks }) =>
        Number(hourlyRate) * Number(hoursPerWeek) * Number(weeks),
    },
  ],
});

describe("runTool", () => {
  it("computes outputs from validated inputs", () => {
    const result = runTool({
      toolDefinition: earningsCalc,
      values: { hourlyRate: 20, hoursPerWeek: 30 },
    });
    expect(result.annualGross).toBe(20 * 30 * 50);
  });

  it("throws on out-of-range numeric input", () => {
    expect(() =>
      runTool({
        toolDefinition: earningsCalc,
        values: { hourlyRate: 999, hoursPerWeek: 30, weeks: 50 },
      }),
    ).toThrow(/must be ≤ 200/);
  });

  it("throws on non-numeric value", () => {
    expect(() =>
      runTool({
        toolDefinition: earningsCalc,
        values: { hourlyRate: "abc", hoursPerWeek: 30, weeks: 50 },
      }),
    ).toThrow(/finite number/);
  });
});

describe("createToolRegistry", () => {
  it("registers + retrieves + lists", () => {
    const registry = createToolRegistry([
      { definition: earningsCalc, category: "earnings", visible: true },
    ]);
    expect(registry.get("earnings-calculator")?.category).toBe("earnings");
    expect(registry.list({ visibleOnly: true })).toHaveLength(1);
    expect(registry.list({ category: "earnings" })).toHaveLength(1);
    expect(registry.list({ category: "tax" })).toHaveLength(0);
  });
});
