import type { DailyEcoAction, DailyLogInput, QuickTravelLevel } from "./types";

export const dailyEcoActions: DailyEcoAction[] = [
  { actionId: "public-transport", title: "Used public transport", co2Saved: 2, points: 40, leafCoins: 20 },
  { actionId: "walked-short-distance", title: "Walked short distance", co2Saved: 1.5, points: 30, leafCoins: 15 },
  { actionId: "avoided-plastic-bottle", title: "Avoided plastic bottle", co2Saved: 0.3, points: 10, leafCoins: 5 },
  { actionId: "switched-off-appliances", title: "Switched off unused appliances", co2Saved: 0.8, points: 20, leafCoins: 10 },
  { actionId: "plant-based-meal", title: "Ate plant-based meal", co2Saved: 1.5, points: 30, leafCoins: 15 },
  { actionId: "avoided-online-shopping", title: "Avoided online shopping", co2Saved: 1.8, points: 35, leafCoins: 18 },
  { actionId: "recycled-waste", title: "Recycled waste", co2Saved: 0.4, points: 15, leafCoins: 8 },
  { actionId: "reusable-bag", title: "Used reusable bag", co2Saved: 0.2, points: 10, leafCoins: 5 }
];

const transportFactors: Record<string, number> = {
  walking: 0,
  bicycle: 0,
  metro: 0.04,
  train: 0.04,
  bus: 0.08,
  two_wheeler_petrol: 0.08,
  car_petrol: 0.19,
  car_diesel: 0.17,
  ev: 0.05
};

const foodFactors: Record<string, number> = {
  vegan: 1.5,
  vegetarian: 2,
  mixed: 3,
  non_vegetarian: 4
};

const plasticFactors: Record<string, number> = { low: 0.2, medium: 0.5, high: 1 };
const quickFactors: {
  travelLevel: Record<string, number>;
  energyLevel: Record<string, number>;
  foodChoice: Record<string, number>;
  shoppingToday: Record<string, number>;
} = {
  travelLevel: { no_travel: 0, low: 1.5, medium: 4, high: 8 },
  energyLevel: { low: 2, medium: 5, high: 9 },
  foodChoice: foodFactors,
  shoppingToday: { none: 0, small: 1.8, high: 8 }
};

const round = (value: number) => Math.round(value * 10) / 10;

export function calculateDailyPreview(input: DailyLogInput) {
  const transportFactor = transportFactors[input.transport.mode] ?? 0;
  const foodBase = foodFactors[input.food.dietToday] ?? 0;
  const plasticBase = plasticFactors[input.shoppingWaste.plasticUsage] ?? 0;
  const transportCO2 = round(input.transport.distanceKm * input.transport.numberOfTrips * transportFactor);
  const electricityCO2 = round(input.electricity.electricityKwhToday * 0.82 + input.electricity.acHours * 1.2 * 0.82 + input.electricity.fanHours * 0.075 * 0.82);
  const foodCO2 = round(foodBase + (input.food.foodDeliveryToday ? 1.2 : 0) + (input.food.packagedFoodToday ? 0.8 : 0));
  const shoppingWasteCO2 = round(
    Math.max(
      0,
      (input.shoppingWaste.onlineOrderToday ? 1.8 : 0) +
        (input.shoppingWaste.clothingPurchaseToday ? 8 : 0) +
        plasticBase -
        (input.shoppingWaste.recycledToday ? 0.4 : 0)
    )
  );
  const selectedActions = dailyEcoActions.filter((action) => input.ecoActionIds.includes(action.actionId));
  const co2Saved = round(selectedActions.reduce((total, action) => total + action.co2Saved, 0));
  const pointsEarned = 20 + selectedActions.reduce((total, action) => total + action.points, 0);
  const leafCoinsEarned = 10 + selectedActions.reduce((total, action) => total + action.leafCoins, 0);
  const totalCO2 = round(transportCO2 + electricityCO2 + foodCO2 + shoppingWasteCO2);
  const netCO2 = round(Math.max(0, totalCO2 - co2Saved));

  return { transportCO2, electricityCO2, foodCO2, shoppingWasteCO2, totalCO2, co2Saved, netCO2, pointsEarned, leafCoinsEarned };
}

export function calculateQuickPreview(input: {
  travelLevel: QuickTravelLevel | "";
  energyLevel: "low" | "medium" | "high" | "";
  foodChoice: "vegan" | "vegetarian" | "mixed" | "non_vegetarian" | "";
  shoppingToday: "none" | "small" | "high" | "";
  ecoActionDone: boolean;
}) {
  const transportCO2 = quickFactors.travelLevel[input.travelLevel] ?? 0;
  const electricityCO2 = quickFactors.energyLevel[input.energyLevel] ?? 0;
  const foodCO2 = quickFactors.foodChoice[input.foodChoice] ?? 0;
  const shoppingWasteCO2 = quickFactors.shoppingToday[input.shoppingToday] ?? 0;
  const totalCO2 = round(transportCO2 + electricityCO2 + foodCO2 + shoppingWasteCO2);
  const co2Saved = input.ecoActionDone ? 1.5 : 0;
  const netCO2 = round(Math.max(0, totalCO2 - co2Saved));
  return {
    transportCO2,
    electricityCO2,
    foodCO2,
    shoppingWasteCO2,
    totalCO2,
    co2Saved,
    netCO2,
    pointsEarned: 20 + (input.ecoActionDone ? 30 : 0),
    leafCoinsEarned: 10 + (input.ecoActionDone ? 15 : 0)
  };
}
