export type TransportMode =
  | "walking"
  | "bicycle"
  | "bus"
  | "metro"
  | "train"
  | "two_wheeler_petrol"
  | "car_petrol"
  | "car_diesel"
  | "ev";

export type LifestyleInputs = {
  dailyDistanceKm: number;
  transportMode: TransportMode;
  weeklyTravelDays: number;
  monthlyElectricityKwh: number;
  acHoursPerDay: number;
  fanHoursPerDay: number;
  applianceUsageLevel?: "low" | "medium" | "high";
  dietType: "vegetarian" | "mixed" | "non_vegetarian" | "vegan";
  foodDeliveryPerWeek: number;
  packagedFoodLevel: "low" | "medium" | "high";
  onlineOrdersPerMonth: number;
  clothingPurchasesPerMonth: number;
  plasticUsageLevel: "low" | "medium" | "high";
  recyclingHabit: "never" | "sometimes" | "often";
};

export type CarbonBreakdown = {
  transportCO2: number;
  electricityCO2: number;
  foodCO2: number;
  shoppingCO2: number;
  totalCO2: number;
};

const transportFactors: Record<TransportMode, number> = {
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

const foodBase = {
  vegan: 45,
  vegetarian: 60,
  mixed: 90,
  non_vegetarian: 120
};

const levelKg = {
  packaged: { low: 5, medium: 12, high: 22 },
  plastic: { low: 4, medium: 10, high: 18 },
  appliance: { low: 4, medium: 9, high: 16 }
};

const recyclingReduction = { never: 0, sometimes: 5, often: 12 };

export function round(value: number) {
  return Math.round(value * 10) / 10;
}

export function calculateCarbon(inputs: LifestyleInputs): CarbonBreakdown {
  const transportCO2 = inputs.dailyDistanceKm * inputs.weeklyTravelDays * 4.33 * transportFactors[inputs.transportMode];
  const electricityCO2 =
    inputs.monthlyElectricityKwh * 0.82 +
    inputs.acHoursPerDay * 1.2 * 30 * 0.82 +
    inputs.fanHoursPerDay * 0.075 * 30 * 0.82 +
    (inputs.applianceUsageLevel ? levelKg.appliance[inputs.applianceUsageLevel] : 0);
  const foodCO2 =
    foodBase[inputs.dietType] +
    inputs.foodDeliveryPerWeek * 4 * 1.2 +
    levelKg.packaged[inputs.packagedFoodLevel];
  const shoppingCO2 =
    inputs.onlineOrdersPerMonth * 1.8 +
    inputs.clothingPurchasesPerMonth * 8 +
    levelKg.plastic[inputs.plasticUsageLevel] -
    recyclingReduction[inputs.recyclingHabit];

  const safeShopping = Math.max(0, shoppingCO2);
  const totalCO2 = transportCO2 + electricityCO2 + foodCO2 + safeShopping;

  return {
    transportCO2: round(transportCO2),
    electricityCO2: round(electricityCO2),
    foodCO2: round(foodCO2),
    shoppingCO2: round(safeShopping),
    totalCO2: round(totalCO2)
  };
}

export function ecoScore(totalCO2: number) {
  if (totalCO2 <= 80) return Math.max(90, Math.round(100 - totalCO2 * 0.12));
  if (totalCO2 <= 140) return Math.round(89 - (totalCO2 - 80) * 0.32);
  if (totalCO2 <= 220) return Math.round(69 - (totalCO2 - 140) * 0.25);
  return Math.max(18, Math.round(49 - (totalCO2 - 220) * 0.08));
}

export function ecoStatus(score: number) {
  if (score >= 80) return "Eco Champion";
  if (score >= 60) return "Conscious User";
  if (score >= 40) return "Improving";
  return "High Impact Lifestyle";
}

export function carbonPersonality(log?: CarbonBreakdown) {
  if (!log) {
    return {
      type: "Eco Explorer",
      description: "Your twin is waiting for its first lifestyle scan.",
      mainProblem: "No footprint data yet",
      strategy: "Complete your first carbon calculation.",
      weeklyAction: "Log your travel, energy, food, and shopping habits."
    };
  }

  const categories = [
    ["Travel Burner", log.transportCO2, "daily travel", "Replace short petrol trips with walking, cycling, or public transport.", "Choose one public transport or walking day this week."],
    ["Energy Drainer", log.electricityCO2, "home electricity", "Cut cooling hours, switch off idle appliances, and smooth out peak use.", "Reduce AC use by one hour on three days."],
    ["Food Impacter", log.foodCO2, "food choices", "Add low-impact meals and reduce delivery packaging.", "Try two plant-forward meals this week."],
    ["Fast Fashioner", log.shoppingCO2, "shopping and waste", "Buy less frequently, recycle more, and avoid single-use plastic.", "Skip one non-essential order this week."]
  ] as const;

  const values = categories.map((category) => category[1]);
  const max = Math.max(...values);
  const min = Math.min(...values);
  if (max - min <= Math.max(12, log.totalCO2 * 0.08)) {
    return {
      type: "Eco Balancer",
      description: "Your emissions are spread fairly evenly across daily habits.",
      mainProblem: "No single category dominates",
      strategy: "Make small reductions across every lifestyle area.",
      weeklyAction: "Pick one habit from travel, energy, food, and shopping."
    };
  }

  const winner = categories.find((category) => category[1] === max)!;
  return {
    type: winner[0],
    description: `You are a ${winner[0]}. Your lifestyle impact is mainly caused by ${winner[2]}.`,
    mainProblem: winner[2],
    strategy: winner[3],
    weeklyAction: winner[4]
  };
}
