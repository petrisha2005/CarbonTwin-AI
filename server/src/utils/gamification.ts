import type { DailyInput } from "./dailyCarbonCalculator.js";

export type AvatarMood = "glowing" | "happy" | "calm" | "tired" | "polluted";
export type TrackingMode = "quick" | "detailed" | "same_as_yesterday";

export function carbonEquivalents(co2Kg: number) {
  return {
    phoneCharges: Math.round(co2Kg * 120),
    petrolKm: Math.round((co2Kg / 0.19) * 10) / 10,
    treeDays: Math.round(((co2Kg / 21) * 365) * 10) / 10
  };
}

export function levelFromXp(xp: number) {
  return Math.floor(xp / 100) + 1;
}

export function treeStageForLevel(level: number) {
  if (level >= 10) return "Forest Guardian Tree";
  if (level >= 8) return "Big Tree";
  if (level >= 6) return "Young Tree";
  if (level >= 4) return "Small Plant";
  if (level >= 2) return "Sprout";
  return "Seed";
}

export function avatarMoodFor(input: { loggedToday: boolean; netCO2: number; co2Saved: number; dailyBudget?: number }) {
  const dailyBudget = input.dailyBudget ?? 8;
  if (!input.loggedToday) return "tired" satisfies AvatarMood;
  if (input.co2Saved > 0 && input.netCO2 <= dailyBudget) return "glowing" satisfies AvatarMood;
  if (input.netCO2 <= dailyBudget * 0.65) return "calm" satisfies AvatarMood;
  if (input.netCO2 > dailyBudget * 1.7) return "polluted" satisfies AvatarMood;
  return "happy" satisfies AvatarMood;
}

export function avatarMoodMessage(mood: AvatarMood) {
  return {
    glowing: "Your CarbonTwin is glowing today because you made a planet-friendly choice.",
    happy: "Your CarbonTwin feels balanced today.",
    calm: "Low-impact day! Your CarbonTwin is peaceful.",
    tired: "Your CarbonTwin is waiting for today's Eco Quest.",
    polluted: "High-impact day, but no guilt. Let's balance it with one small action."
  }[mood];
}

export function moodSuggestion(moodSelected?: string) {
  return {
    Busy: "Just switch off unused appliances today. Small action, real impact.",
    Lazy: "Keep it tiny: avoid one plastic bottle and call it a win.",
    Broke: "Save money and carbon: avoid one food delivery today.",
    Motivated: "Go for a full low-carbon day challenge.",
    Travelling: "Pick public transport for one leg if it fits your route.",
    "College Day": "Try walking one short distance on campus today.",
    "At Home": "Switch off idle devices and let your CarbonTwin chill."
  }[moodSelected ?? ""] ?? "No guilt. Just one better choice.";
}

export function quickLogToDetailed(input: {
  date: string;
  travelLevel: "no_travel" | "low" | "medium" | "high";
  energyLevel: "low" | "medium" | "high";
  foodChoice: DailyInput["food"]["dietToday"];
  shoppingToday: "none" | "small" | "high";
  ecoActionDone: boolean;
  moodSelected?: string;
}): DailyInput {
  const travel = {
    no_travel: { mode: "walking", distanceKm: 0, numberOfTrips: 0 },
    low: { mode: "walking", distanceKm: 1.5, numberOfTrips: 1 },
    medium: { mode: "bus", distanceKm: 8, numberOfTrips: 2 },
    high: { mode: "car_petrol", distanceKm: 16, numberOfTrips: 2 }
  } as const;
  const energy = {
    low: { electricityKwhToday: 2, acHours: 0, fanHours: 3 },
    medium: { electricityKwhToday: 5, acHours: 1, fanHours: 6 },
    high: { electricityKwhToday: 9, acHours: 4, fanHours: 8 }
  } as const;
  const shopping = {
    none: { onlineOrderToday: false, clothingPurchaseToday: false, plasticUsage: "low", recycledToday: false },
    small: { onlineOrderToday: true, clothingPurchaseToday: false, plasticUsage: "medium", recycledToday: false },
    high: { onlineOrderToday: true, clothingPurchaseToday: true, plasticUsage: "high", recycledToday: false }
  } as const;

  return {
    date: input.date,
    transport: travel[input.travelLevel],
    electricity: energy[input.energyLevel],
    food: {
      dietToday: input.foodChoice,
      foodDeliveryToday: input.shoppingToday !== "none",
      packagedFoodToday: input.shoppingToday === "high"
    },
    shoppingWaste: shopping[input.shoppingToday],
    ecoActionIds: input.ecoActionDone ? ["switched-off-appliances"] : []
  };
}
