import assert from "node:assert/strict";
import test from "node:test";
import { autoSplitBudget, categoryUsageFromLogs, statusForPercent } from "../utils/budgetCalculator.js";
import { calculateCarbon, ecoScore } from "../utils/carbon.js";
import { periodScore, publicLeaderboardUser } from "../utils/leaderboardScore.js";
import { extractPaymentDetails } from "../services/electricityPaymentExtractionService.js";
import { validateElectricityPaymentProof } from "../services/electricityPaymentValidationService.js";
import { expectedProofForMission } from "../services/missionProofValidationService.js";

test("carbon calculator returns rounded category and total estimates", () => {
  const result = calculateCarbon({
    dailyDistanceKm: 10,
    transportMode: "bus",
    weeklyTravelDays: 5,
    monthlyElectricityKwh: 120,
    acHoursPerDay: 1,
    fanHoursPerDay: 6,
    applianceUsageLevel: "medium",
    dietType: "vegetarian",
    foodDeliveryPerWeek: 1,
    packagedFoodLevel: "low",
    onlineOrdersPerMonth: 0,
    clothingPurchasesPerMonth: 0,
    plasticUsageLevel: "low",
    recyclingHabit: "often"
  });

  assert.equal(result.transportCO2, 17.3);
  assert.equal(result.totalCO2, Math.round((result.transportCO2 + result.electricityCO2 + result.foodCO2 + result.shoppingCO2) * 10) / 10);
  assert.ok(ecoScore(result.totalCO2) >= 0);
});

test("budget utilities split and summarize category usage", () => {
  assert.deepEqual(autoSplitBudget(100), { transport: 30, electricity: 30, food: 25, shoppingWaste: 15 });
  assert.equal(statusForPercent(80), "close");
  assert.deepEqual(categoryUsageFromLogs([{ totals: { transportCO2: 1, electricityCO2: 2, foodCO2: 3, shoppingWasteCO2: 4, netCO2: 10 } }]), {
    transport: 1,
    electricity: 2,
    food: 3,
    shoppingWaste: 4,
    total: 10
  });
});

test("electricity payment extraction validates amount plus electricity and payment evidence", () => {
  const text = "BESCOM electricity bill payment successful Amount Paid Rs. 840 UPI transaction";
  const validation = validateElectricityPaymentProof(text);
  assert.equal(validation.isValid, true);
  const valid = extractPaymentDetails(text, 2);
  assert.ok(valid);
  assert.equal(valid.amountPaid, 840);
  assert.equal(valid.estimatedUnits, 120);
  assert.equal(valid.estimatedCO2, 98.4);
  assert.equal(valid.personalCO2, 49.2);

  const invalid = validateElectricityPaymentProof("Coffee payment successful Amount Paid Rs. 300 UPI transaction");
  assert.equal(invalid.isValid, false);
});

test("mission proof guidance is mission-specific", () => {
  assert.match(expectedProofForMission({ missionId: "plant-based-meal" }), /meal photo/);
  assert.match(expectedProofForMission({ missionId: "public-transport-choice" }), /bus\/metro\/train/);
  assert.match(expectedProofForMission({ missionId: "no-online-shopping-today" }), /File upload is not required/);
});

test("leaderboard scoring exposes only public user fields", () => {
  const score = periodScore({ co2Saved: 5, logsCount: 3, xpEarned: 20, period: "weekly" });
  assert.equal(score, 120);
  const publicUser = publicLeaderboardUser({ id: "u1", name: "Patricia Example", passwordHash: "secret", xp: 10, level: 2 }, 1);
  assert.equal(publicUser.displayName, "Patricia");
  assert.equal(Object.hasOwn(publicUser, "passwordHash"), false);
});
