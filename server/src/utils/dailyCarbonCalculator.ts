export type DailyTransportMode =
  | "walking"
  | "bicycle"
  | "bus"
  | "metro"
  | "train"
  | "two_wheeler_petrol"
  | "car_petrol"
  | "car_diesel"
  | "ev";

export type DailyInput = {
  date: string;
  transport: {
    mode: DailyTransportMode;
    distanceKm: number;
    numberOfTrips: number;
  };
  electricity: {
    electricityKwhToday: number;
    acHours: number;
    fanHours: number;
  };
  food: {
    dietToday: "vegan" | "vegetarian" | "mixed" | "non_vegetarian";
    foodDeliveryToday: boolean;
    packagedFoodToday: boolean;
  };
  shoppingWaste: {
    onlineOrderToday: boolean;
    clothingPurchaseToday: boolean;
    plasticUsage: "low" | "medium" | "high";
    recycledToday: boolean;
  };
  ecoActionIds: string[];
};

export type QuickLogInput = {
  travelLevel: "no_travel" | "low" | "medium" | "high";
  energyLevel: "low" | "medium" | "high";
  foodChoice: "vegan" | "vegetarian" | "mixed" | "non_vegetarian";
  shoppingToday: "none" | "small" | "high";
  ecoActionDone: boolean;
};

export const dailyEcoActions = [
  { actionId: "public-transport", title: "Used public transport", co2Saved: 2, points: 40, xp: 40, leafCoins: 20 },
  { actionId: "walked-short-distance", title: "Walked short distance", co2Saved: 1.5, points: 30, xp: 30, leafCoins: 15 },
  { actionId: "avoided-plastic-bottle", title: "Avoided plastic bottle", co2Saved: 0.3, points: 10, xp: 10, leafCoins: 5 },
  { actionId: "switched-off-appliances", title: "Switched off unused appliances", co2Saved: 0.8, points: 20, xp: 20, leafCoins: 10 },
  { actionId: "plant-based-meal", title: "Ate plant-based meal", co2Saved: 1.5, points: 30, xp: 30, leafCoins: 15 },
  { actionId: "avoided-online-shopping", title: "Avoided online shopping", co2Saved: 1.8, points: 35, xp: 35, leafCoins: 18 },
  { actionId: "recycled-waste", title: "Recycled waste", co2Saved: 0.4, points: 15, xp: 15, leafCoins: 8 },
  { actionId: "reusable-bag", title: "Used reusable bag", co2Saved: 0.2, points: 10, xp: 10, leafCoins: 5 }
];

const transportFactors: Record<DailyTransportMode, number> = {
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

const foodDaily = {
  vegan: 1.5,
  vegetarian: 2,
  mixed: 3,
  non_vegetarian: 4
};

const plasticDaily = {
  low: 0.2,
  medium: 0.5,
  high: 1
};

const quickFactors = {
  travelLevel: { no_travel: 0, low: 1.5, medium: 4, high: 8 },
  energyLevel: { low: 2, medium: 5, high: 9 },
  foodChoice: foodDaily,
  shoppingToday: { none: 0, small: 1.8, high: 8 }
};

export function round(value: number) {
  return Math.round(value * 10) / 10;
}

export function calculateTransportCO2(input: DailyInput["transport"]) {
  return round(input.distanceKm * input.numberOfTrips * transportFactors[input.mode]);
}

export function calculateElectricityCO2(input: DailyInput["electricity"]) {
  return round(input.electricityKwhToday * 0.82 + input.acHours * 1.2 * 0.82 + input.fanHours * 0.075 * 0.82);
}

export function calculateFoodCO2(input: DailyInput["food"]) {
  return round(foodDaily[input.dietToday] + (input.foodDeliveryToday ? 1.2 : 0) + (input.packagedFoodToday ? 0.8 : 0));
}

export function calculateShoppingWasteCO2(input: DailyInput["shoppingWaste"]) {
  const total =
    (input.onlineOrderToday ? 1.8 : 0) +
    (input.clothingPurchaseToday ? 8 : 0) +
    plasticDaily[input.plasticUsage] -
    (input.recycledToday ? 0.4 : 0);
  return round(Math.max(0, total));
}

export function calculateEcoActionSavings(actionIds: string[]) {
  const uniqueIds = [...new Set(actionIds)];
  const actions = uniqueIds.flatMap((id) => {
    const action = dailyEcoActions.find((item) => item.actionId === id);
    return action ? [action] : [];
  });
  return {
    actions,
    co2Saved: round(actions.reduce((sum, action) => sum + action.co2Saved, 0)),
    pointsEarned: actions.reduce((sum, action) => sum + action.points, 0),
    xpEarned: actions.reduce((sum, action) => sum + action.xp, 0),
    leafCoinsEarned: actions.reduce((sum, action) => sum + action.leafCoins, 0)
  };
}

export function calculateQuickTotal(input: QuickLogInput) {
  const transportCO2 = quickFactors.travelLevel[input.travelLevel];
  const electricityCO2 = quickFactors.energyLevel[input.energyLevel];
  const foodCO2 = quickFactors.foodChoice[input.foodChoice];
  const shoppingWasteCO2 = quickFactors.shoppingToday[input.shoppingToday];
  const totalCO2 = round(transportCO2 + electricityCO2 + foodCO2 + shoppingWasteCO2);
  const ecoActions = input.ecoActionDone ? [{ actionId: "quick-eco-action", title: "Eco action completed", co2Saved: 1.5, points: 30, xp: 30, leafCoins: 15 }] : [];
  const co2Saved = input.ecoActionDone ? 1.5 : 0;
  const netCO2 = round(Math.max(0, totalCO2 - co2Saved));

  return {
    transport: { mode: "quick", distanceKm: 0, numberOfTrips: 0, co2: transportCO2 },
    electricity: { electricityKwhToday: 0, acHours: 0, fanHours: 0, co2: electricityCO2 },
    food: { dietToday: input.foodChoice, foodDeliveryToday: false, packagedFoodToday: false, co2: foodCO2 },
    shoppingWaste: { onlineOrderToday: input.shoppingToday !== "none", clothingPurchaseToday: input.shoppingToday === "high", plasticUsage: "low", recycledToday: false, co2: shoppingWasteCO2 },
    ecoActions,
    totalCO2,
    co2Saved,
    netCO2,
    pointsEarned: ecoActions.reduce((sum, action) => sum + action.points, 0),
    actionXpEarned: ecoActions.reduce((sum, action) => sum + action.xp, 0),
    actionLeafCoinsEarned: ecoActions.reduce((sum, action) => sum + action.leafCoins, 0),
    transportCO2,
    electricityCO2,
    foodCO2,
    shoppingWasteCO2
  };
}

export function calculateDailyTotal(input: DailyInput) {
  const transportCO2 = calculateTransportCO2(input.transport);
  const electricityCO2 = calculateElectricityCO2(input.electricity);
  const foodCO2 = calculateFoodCO2(input.food);
  const shoppingWasteCO2 = calculateShoppingWasteCO2(input.shoppingWaste);
  const totalCO2 = round(transportCO2 + electricityCO2 + foodCO2 + shoppingWasteCO2);
  const savings = calculateEcoActionSavings(input.ecoActionIds);
  const netCO2 = round(Math.max(0, totalCO2 - savings.co2Saved));

  return {
    transport: { ...input.transport, co2: transportCO2 },
    electricity: { ...input.electricity, co2: electricityCO2 },
    food: { ...input.food, co2: foodCO2 },
    shoppingWaste: { ...input.shoppingWaste, co2: shoppingWasteCO2 },
    ecoActions: savings.actions,
    totalCO2,
    co2Saved: savings.co2Saved,
    netCO2,
    pointsEarned: savings.pointsEarned,
    actionXpEarned: savings.xpEarned,
    actionLeafCoinsEarned: savings.leafCoinsEarned,
    transportCO2,
    electricityCO2,
    foodCO2,
    shoppingWasteCO2
  };
}
