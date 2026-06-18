import { randomUUID } from "node:crypto";
import { CarbonBudget } from "../models/CarbonBudget.js";
import { autoSplitBudget, categoryUsageFromLogs, round1, statusForPercent, type CategoryBudgets } from "../utils/budgetCalculator.js";
import { isMongoEnabled, store } from "./store.js";

const memoryBudgets: any[] = [];

function monthYear(date = new Date()) {
  return { month: date.getUTCMonth() + 1, year: date.getUTCFullYear() };
}

function startOfMonth(month: number, year: number) {
  return new Date(Date.UTC(year, month - 1, 1));
}

function endOfMonth(month: number, year: number) {
  return new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
}

function serialize(row: any) {
  return {
    id: String(row._id ?? row.id),
    userId: String(row.userId),
    monthlyBudget: round1(row.monthlyBudget ?? row.totalBudgetCO2 ?? 144),
    month: row.month,
    year: row.year,
    categoryBudgets: {
      transport: round1(row.categoryBudgets?.transport ?? 0),
      electricity: round1(row.categoryBudgets?.electricity ?? 0),
      food: round1(row.categoryBudgets?.food ?? 0),
      shoppingWaste: round1(row.categoryBudgets?.shoppingWaste ?? 0)
    },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

async function findBudget(userId: string, month: number, year: number) {
  const row = isMongoEnabled()
    ? await CarbonBudget.findOne({ userId, month, year })
    : memoryBudgets.find((budget) => budget.userId === userId && budget.month === month && budget.year === year);
  return row ? serialize(row) : null;
}

async function saveBudgetRow(row: any) {
  if (isMongoEnabled()) {
    const saved = await CarbonBudget.findOneAndUpdate(
      { userId: row.userId, month: row.month, year: row.year },
      row,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return serialize(saved);
  }
  const index = memoryBudgets.findIndex((budget) => budget.userId === row.userId && budget.month === row.month && budget.year === row.year);
  if (index >= 0) memoryBudgets[index] = { ...memoryBudgets[index], ...row, updatedAt: new Date() };
  else memoryBudgets.push({ id: randomUUID(), ...row, createdAt: new Date(), updatedAt: new Date() });
  return serialize(index >= 0 ? memoryBudgets[index] : memoryBudgets.at(-1));
}

async function suggestedBudget(userId: string) {
  const user = await store.findUser(userId);
  const baseline = Number(user?.baselineFootprint?.totalCO2 ?? 0);
  if (baseline > 0) return Math.max(1, round1(baseline * 0.9));
  const now = new Date();
  const previousStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const previousEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999));
  const previousLogs = await store.dailyLogsBetween(userId, previousStart, previousEnd);
  const previousUsed = categoryUsageFromLogs(previousLogs).total;
  return previousUsed > 0 ? Math.max(1, round1(previousUsed * 0.9)) : 144;
}

async function categorySplit(userId: string, monthlyBudget: number) {
  const user = await store.findUser(userId);
  const baseline = user?.baselineFootprint;
  const baselineTotal = Number(baseline?.totalCO2 ?? 0);
  if (baselineTotal > 0) {
    return autoSplitBudget(monthlyBudget, {
      transport: Number(baseline?.transportCO2 ?? 0) / baselineTotal,
      electricity: Number(baseline?.electricityCO2 ?? 0) / baselineTotal,
      food: Number(baseline?.foodCO2 ?? 0) / baselineTotal,
      shoppingWaste: Number(baseline?.shoppingWasteCO2 ?? 0) / baselineTotal
    });
  }
  const now = new Date();
  const previousStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const previousEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999));
  const previousUsage = categoryUsageFromLogs(await store.dailyLogsBetween(userId, previousStart, previousEnd));
  const categoryTotal = previousUsage.transport + previousUsage.electricity + previousUsage.food + previousUsage.shoppingWaste;
  if (categoryTotal <= 0) return autoSplitBudget(monthlyBudget);
  return autoSplitBudget(monthlyBudget, {
    transport: previousUsage.transport / categoryTotal,
    electricity: previousUsage.electricity / categoryTotal,
    food: previousUsage.food / categoryTotal,
    shoppingWaste: previousUsage.shoppingWaste / categoryTotal
  });
}

function validateMonthlyBudget(monthlyBudget: number) {
  if (!Number.isFinite(monthlyBudget) || monthlyBudget <= 0) throw new Error("Monthly budget must be greater than 0.");
  if (monthlyBudget > 5000) throw new Error("Monthly budget should be 5000 kg or less.");
}

function validateSplit(monthlyBudget: number, split: CategoryBudgets) {
  const values = Object.values(split);
  if (values.some((value) => !Number.isFinite(value) || value < 0)) throw new Error("Category budgets must be 0 or greater.");
  const total = round1(values.reduce((sum, value) => sum + value, 0));
  if (Math.abs(total - monthlyBudget) > 0.5) throw new Error("Category budgets should add up to your monthly budget.");
}

export const budgetService = {
  async current(userId: string) {
    const { month, year } = monthYear();
    const existing = await findBudget(userId, month, year);
    if (existing) return { budget: existing, suggested: false, message: "Category budgets are auto-suggested. You can adjust them anytime." };
    const monthlyBudget = await suggestedBudget(userId);
    return {
      budget: {
        id: "suggested",
        userId,
        monthlyBudget,
        month,
        year,
        categoryBudgets: await categorySplit(userId, monthlyBudget)
      },
      suggested: true,
      message: "Your budget is suggested from your baseline footprint with a 10% reduction goal."
    };
  },

  async save(userId: string, input: { monthlyBudget: number; categoryBudgets?: CategoryBudgets }) {
    const monthlyBudget = round1(Number(input.monthlyBudget));
    validateMonthlyBudget(monthlyBudget);
    const { month, year } = monthYear();
    const categoryBudgets = input.categoryBudgets ?? await categorySplit(userId, monthlyBudget);
    validateSplit(monthlyBudget, categoryBudgets);
    const budget = await saveBudgetRow({ userId, month, year, monthlyBudget, categoryBudgets });
    await store.updateUser(userId, { carbonGoal: monthlyBudget });
    return { budget, message: "Budget saved." };
  },

  async updateCategorySplit(userId: string, split: CategoryBudgets) {
    const current = await this.current(userId);
    validateSplit(current.budget.monthlyBudget, split);
    const budget = await saveBudgetRow({ ...current.budget, categoryBudgets: split });
    return { budget, message: "Category split saved." };
  },

  async summary(userId: string) {
    const current = await this.current(userId);
    const { month, year } = current.budget;
    const logs = await store.dailyLogsBetween(userId, startOfMonth(month, year), endOfMonth(month, year));
    const usage = categoryUsageFromLogs(logs);
    const monthlyBudget = current.budget.monthlyBudget;
    const usedCarbon = round1(usage.total);
    const remainingCarbon = round1(monthlyBudget - usedCarbon);
    const categoryUsage = [
      ["transport", "Transport"],
      ["electricity", "Electricity"],
      ["food", "Food"],
      ["shoppingWaste", "Shopping & Waste"]
    ].map(([key, label]) => {
      const budget = round1(current.budget.categoryBudgets[key as keyof CategoryBudgets]);
      const used = round1(usage[key as keyof CategoryBudgets]);
      const usedPercent = budget > 0 ? round1((used / budget) * 100) : 0;
      return { key, label, budget, used, remaining: round1(budget - used), usedPercent, status: statusForPercent(usedPercent) };
    });
    const alerts = categoryUsage
      .filter((item) => item.status !== "safe")
      .map((item) => ({ type: item.status === "over" ? "warning" : "info", message: `${item.label} is ${item.status === "over" ? "over" : "close to"} your monthly budget.` }));
    if (remainingCarbon >= 0) alerts.push({ type: "info", message: `You have ${remainingCarbon} kg CO2 left for this month.` });
    const suggestions = categoryUsage.filter((item) => item.status !== "safe").map((item) => suggestionFor(item.key));
    return {
      ...current,
      monthlyBudget,
      usedCarbon,
      remainingCarbon,
      usedPercent: monthlyBudget > 0 ? round1((usedCarbon / monthlyBudget) * 100) : 0,
      categoryUsage,
      alerts,
      suggestions,
      hasLogs: logs.length > 0
    };
  }
};

function suggestionFor(key: string) {
  if (key === "transport") return "Try replacing one short trip with walking, cycling, or public transport.";
  if (key === "electricity") return "Try reducing AC or appliance usage for one day.";
  if (key === "food") return "Try one lower-impact meal this week.";
  return "Avoid one unnecessary online order this week.";
}
