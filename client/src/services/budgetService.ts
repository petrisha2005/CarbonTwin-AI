import { api } from "../lib/api";

export type CategoryBudget = {
  key: "transport" | "electricity" | "food" | "shoppingWaste";
  label: string;
  budget: number;
  used: number;
  remaining: number;
  usedPercent: number;
  status: "safe" | "close" | "over";
};

export type BudgetSummary = {
  budget: {
    monthlyBudget: number;
    categoryBudgets: Record<CategoryBudget["key"], number>;
    month: number;
    year: number;
  };
  suggested: boolean;
  message: string;
  monthlyBudget: number;
  usedCarbon: number;
  remainingCarbon: number;
  usedPercent: number;
  categoryUsage: CategoryBudget[];
  alerts: { type: string; message: string }[];
  suggestions: string[];
  hasLogs: boolean;
};

export const getCurrentBudget = () => api<any>("/budget/current");
export const saveBudget = (data: { monthlyBudget: number; categoryBudgets?: Record<string, number> }) => api<any>("/budget/save", { method: "POST", body: JSON.stringify(data) });
export const updateCategorySplit = (data: Record<string, number>) => api<any>("/budget/category-split", { method: "PUT", body: JSON.stringify(data) });
export const getBudgetSummary = () => api<BudgetSummary>("/budget/summary");
