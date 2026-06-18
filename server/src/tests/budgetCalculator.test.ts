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

test("category remaining carbon and used percentage can be derived from usage", () => {
  const monthlyBudget = autoSplitBudget(100);
  const usage = categoryUsageFromLogs([{ totals: { transportCO2: 15, electricityCO2: 30, foodCO2: 5, shoppingWasteCO2: 0, netCO2: 50 } }]);
  const remainingTransport = monthlyBudget.transport - usage.transport;
  const usedPercent = Math.round((usage.total / 100) * 100);

  assert.equal(remainingTransport, 15);
  assert.equal(usedPercent, 50);
});

test("over-budget category reports over when usage exceeds category budget", () => {
  const budget = autoSplitBudget(100);
  const usage = categoryUsageFromLogs([{ totals: { transportCO2: 35, netCO2: 35 } }]);
  const transportPercent = Math.round((usage.transport / budget.transport) * 100);

  assert.equal(statusForPercent(transportPercent), "over");
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
