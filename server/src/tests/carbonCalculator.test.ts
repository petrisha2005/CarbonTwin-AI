import assert from "node:assert/strict";
import test from "node:test";
import { calculateCarbon } from "../utils/carbon.js";
import { calculateDailyTotal, calculateElectricityCO2, calculateQuickTotal } from "../utils/dailyCarbonCalculator.js";
import { quickLogToDetailed } from "../utils/gamification.js";

test("quick log no travel records zero transport CO2", () => {
  const result = calculateQuickTotal({
    travelLevel: "no_travel",
    energyLevel: "low",
    foodChoice: "vegetarian",
    shoppingToday: "none",
    ecoActionDone: false
  });

  assert.equal(result.transportCO2, 0);
  assert.equal(result.transport.co2, 0);
});

test("manual electricity units use the India grid emission factor", () => {
  assert.equal(calculateElectricityCO2({ electricityKwhToday: 10, acHours: 0, fanHours: 0 }), 8.2);

  const baseline = calculateCarbon({
    dailyDistanceKm: 0,
    transportMode: "walking",
    weeklyTravelDays: 0,
    monthlyElectricityKwh: 100,
    acHoursPerDay: 0,
    fanHoursPerDay: 0,
    applianceUsageLevel: undefined,
    dietType: "vegan",
    foodDeliveryPerWeek: 0,
    packagedFoodLevel: "low",
    onlineOrdersPerMonth: 0,
    clothingPurchasesPerMonth: 0,
    plasticUsageLevel: "low",
    recyclingHabit: "often"
  });

  assert.equal(baseline.electricityCO2, 82);
});

test("public transport produces lower CO2 than petrol car for same distance", () => {
  const sharedInputs = {
    dailyDistanceKm: 12,
    weeklyTravelDays: 5,
    monthlyElectricityKwh: 0,
    acHoursPerDay: 0,
    fanHoursPerDay: 0,
    applianceUsageLevel: undefined,
    dietType: "vegetarian" as const,
    foodDeliveryPerWeek: 0,
    packagedFoodLevel: "low" as const,
    onlineOrdersPerMonth: 0,
    clothingPurchasesPerMonth: 0,
    plasticUsageLevel: "low" as const,
    recyclingHabit: "often" as const
  };

  const bus = calculateCarbon({ ...sharedInputs, transportMode: "bus" });
  const metro = calculateCarbon({ ...sharedInputs, transportMode: "metro" });
  const car = calculateCarbon({ ...sharedInputs, transportMode: "car_petrol" });

  assert.ok(bus.transportCO2 < car.transportCO2);
  assert.ok(metro.transportCO2 < car.transportCO2);
});

test("smart quick estimate converts levels into a detailed daily footprint", () => {
  const detailed = quickLogToDetailed({
    date: "2026-06-18",
    travelLevel: "medium",
    energyLevel: "medium",
    foodChoice: "mixed",
    shoppingToday: "small",
    ecoActionDone: true
  });
  const result = calculateDailyTotal(detailed);

  assert.equal(detailed.transport.mode, "bus");
  assert.equal(result.transportCO2, 1.3);
  assert.equal(result.electricityCO2, 5.5);
  assert.equal(result.co2Saved, 0.8);
});

test("smart electricity estimate returns positive value when energy values are provided", () => {
  const detailed = quickLogToDetailed({
    date: "2026-06-18",
    travelLevel: "no_travel",
    energyLevel: "high",
    foodChoice: "vegan",
    shoppingToday: "none",
    ecoActionDone: false
  });

  assert.ok(calculateDailyTotal(detailed).electricityCO2 > 0);
});

test("no shopping creates zero quick shopping emissions", () => {
  const result = calculateQuickTotal({
    travelLevel: "low",
    energyLevel: "low",
    foodChoice: "vegetarian",
    shoppingToday: "none",
    ecoActionDone: false
  });

  assert.equal(result.shoppingWasteCO2, 0);
  assert.equal(result.shoppingWaste.onlineOrderToday, false);
});

test("packaged food none keeps detailed food packaging CO2 at zero", () => {
  const result = calculateDailyTotal({
    date: "2026-06-18",
    transport: { mode: "walking", distanceKm: 0, numberOfTrips: 0 },
    electricity: { electricityKwhToday: 0, acHours: 0, fanHours: 0 },
    food: { dietToday: "vegan", foodDeliveryToday: false, packagedFoodToday: false },
    shoppingWaste: { onlineOrderToday: false, clothingPurchaseToday: false, plasticUsage: "low", recycledToday: true },
    ecoActionIds: []
  });

  assert.equal(result.foodCO2, 1.5);
});
