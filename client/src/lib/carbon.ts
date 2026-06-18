import type { CarbonLog } from "./types";

export const categoryData = (log?: CarbonLog | null) =>
  log
    ? [
        { name: "Transport", value: log.transportCO2, color: "#22C55E" },
        { name: "Electricity", value: log.electricityCO2, color: "#06B6D4" },
        { name: "Food", value: log.foodCO2, color: "#F59E0B" },
        { name: "Shopping", value: log.shoppingCO2, color: "#A78BFA" }
      ]
    : [];

export function biggestCategory(log?: CarbonLog | null) {
  if (!log) return "No scan yet";
  return categoryData(log).sort((a, b) => b.value - a.value)[0].name;
}

export function recommendedBudget(total = 160) {
  return Math.round(total > 200 ? total * 0.8 : total * 0.9);
}

export function treesNeeded(yearlyKg: number) {
  return Math.ceil(yearlyKg / 21);
}
