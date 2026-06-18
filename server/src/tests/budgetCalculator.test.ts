import assert from "node:assert/strict";
import test from "node:test";
import { autoSplitBudget, categoryUsageFromLogs, statusForPercent } from "../utils/budgetCalculator.js";

test("monthly budget split uses the default carbon category proportions", () => {
  assert.deepEqual(autoSplitBudget(200), {
    transport: 60,
    electricity: 60,
    food: 50,
    shoppingWaste: 30
  });
});

test("category usage calculation supports totals and detailed log shapes", () => {
  const usage = categoryUsageFromLogs([
    { totals: { transportCO2: 2, electricityCO2: 3, foodCO2: 4, shoppingWasteCO2: 1, netCO2: 9 } },
    {
      detailedLog: {
        transport: { co2: 1.5 },
        electricity: { co2: 2.5 },
        food: { co2: 1 },
        shoppingWaste: { co2: 0.5 }
      },
      totalCO2: 5.5
    }
  ]);

  assert.deepEqual(usage, { transport: 3.5, electricity: 5.5, food: 5, shoppingWaste: 1.5, total: 14.5 });
});

test("budget status flags over-budget and close states", () => {
  assert.equal(statusForPercent(101), "over");
  assert.equal(statusForPercent(75), "close");
  assert.equal(statusForPercent(0), "safe");
});

test("zero usage returns an empty-state friendly summary", () => {
  assert.deepEqual(categoryUsageFromLogs([]), {
    transport: 0,
    electricity: 0,
    food: 0,
    shoppingWaste: 0,
    total: 0
  });
});
