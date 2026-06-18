const defaultSplit = { transport: 0.3, electricity: 0.3, food: 0.25, shoppingWaste: 0.15 };

export type CategoryBudgets = {
  transport: number;
  electricity: number;
  food: number;
  shoppingWaste: number;
};

export function round1(value: number) {
  return Math.round(Number(value || 0) * 10) / 10;
}

export function autoSplitBudget(monthlyBudget: number, proportions = defaultSplit): CategoryBudgets {
  return {
    transport: round1(monthlyBudget * proportions.transport),
    electricity: round1(monthlyBudget * proportions.electricity),
    food: round1(monthlyBudget * proportions.food),
    shoppingWaste: round1(monthlyBudget * proportions.shoppingWaste)
  };
}

export function categoryUsageFromLogs(logs: any[]) {
  return logs.reduce<CategoryBudgets & { total: number }>(
    (totals, log) => ({
      transport: round1(totals.transport + Number(log.totals?.transportCO2 ?? log.transport?.co2 ?? log.detailedLog?.transport?.co2 ?? 0)),
      electricity: round1(totals.electricity + Number(log.totals?.electricityCO2 ?? log.electricity?.co2 ?? log.detailedLog?.electricity?.co2 ?? 0)),
      food: round1(totals.food + Number(log.totals?.foodCO2 ?? log.food?.co2 ?? log.detailedLog?.food?.co2 ?? 0)),
      shoppingWaste: round1(totals.shoppingWaste + Number(log.totals?.shoppingWasteCO2 ?? log.shoppingWaste?.co2 ?? log.detailedLog?.shoppingWaste?.co2 ?? 0)),
      total: round1(totals.total + Number(log.totals?.netCO2 ?? log.netCO2 ?? log.totals?.totalCO2 ?? log.totalCO2 ?? 0))
    }),
    { transport: 0, electricity: 0, food: 0, shoppingWaste: 0, total: 0 }
  );
}

export function statusForPercent(usedPercent: number) {
  if (usedPercent > 100) return "over";
  if (usedPercent >= 75) return "close";
  return "safe";
}
