import { describe, expect, it } from "vitest";
import type { RoosForecast } from "./forecast.js";
import { briefVarianceWriteBack, reconcileActuals } from "./reconcile.js";

const baseForecast: RoosForecast = {
  briefId: "br-1",
  d30: { low: 5, mid: 10, high: 15 },
  d60: { low: 9, mid: 18, high: 27 },
  d90: { low: 14, mid: 28, high: 42 },
  effectiveConversionRate: 0.04,
  microConversionUplift: 0,
};

describe("reconcileActuals", () => {
  it("flags 'in-band' when all windows hit between low and high", () => {
    const r = reconcileActuals({
      forecast: baseForecast,
      actuals: [
        { window: "d30", actualClicks: 250, actualConversions: 10 },
        { window: "d60", actualClicks: 450, actualConversions: 18 },
        { window: "d90", actualClicks: 700, actualConversions: 28 },
      ],
    });
    expect(r.overallCalibration).toBe("in-band");
    expect(r.windows.every((w) => w.insideBand)).toBe(true);
  });

  it("flags 'underforecast' when all windows beat the high band", () => {
    const r = reconcileActuals({
      forecast: baseForecast,
      actuals: [
        { window: "d30", actualClicks: 500, actualConversions: 30 },
        { window: "d60", actualClicks: 900, actualConversions: 60 },
        { window: "d90", actualClicks: 1400, actualConversions: 90 },
      ],
    });
    expect(r.overallCalibration).toBe("underforecast");
  });

  it("flags 'overforecast' when all windows fall below the low band", () => {
    const r = reconcileActuals({
      forecast: baseForecast,
      actuals: [
        { window: "d30", actualClicks: 50, actualConversions: 1 },
        { window: "d60", actualClicks: 90, actualConversions: 3 },
        { window: "d90", actualClicks: 140, actualConversions: 5 },
      ],
    });
    expect(r.overallCalibration).toBe("overforecast");
  });

  it("flags 'mixed' when windows disagree", () => {
    const r = reconcileActuals({
      forecast: baseForecast,
      actuals: [
        { window: "d30", actualClicks: 50, actualConversions: 1 },
        { window: "d60", actualClicks: 450, actualConversions: 18 },
        { window: "d90", actualClicks: 1400, actualConversions: 90 },
      ],
    });
    expect(r.overallCalibration).toBe("mixed");
  });

  it("computes signed variance vs mid", () => {
    const r = reconcileActuals({
      forecast: baseForecast,
      actuals: [{ window: "d30", actualClicks: 250, actualConversions: 15 }],
    });
    expect(r.windows[0]?.variancePctVsMid).toBeCloseTo(0.5, 2);
  });
});

describe("briefVarianceWriteBack", () => {
  it("emits a Strapi-shaped patch with status=shipped", () => {
    const r = reconcileActuals({
      forecast: baseForecast,
      actuals: [{ window: "d30", actualClicks: 250, actualConversions: 10 }],
    });
    const patch = briefVarianceWriteBack(r, () => new Date("2026-05-08T00:00:00Z"));
    expect(patch.briefId).toBe("br-1");
    expect(patch.data.status).toBe("shipped");
    expect(patch.data.performanceSnapshot.reconciledAt).toBe("2026-05-08T00:00:00.000Z");
    expect(patch.data.performanceSnapshot.windows).toHaveLength(1);
  });
});
