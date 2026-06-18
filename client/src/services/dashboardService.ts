import { api } from "../lib/api";
import type { User } from "../lib/types";

export type DashboardSummary = {
  user: User;
  hasBaseline: boolean;
  baselineFootprint?: User["baselineFootprint"];
  today: {
    date: string;
    totalCO2: number;
    co2Saved: number;
    netCO2: number;
    avatarMood: "glowing" | "happy" | "calm" | "tired" | "polluted";
    moodMessage: string;
    completed: boolean;
  };
  week: {
    totalCO2: number;
    co2Saved: number;
    netCO2: number;
    averageDailyCO2: number;
    logsCount: number;
    bestDay: { date: string; netCO2: number } | null;
    worstDay: { date: string; netCO2: number } | null;
    weeklyTrend: { day: string; date: string; netCO2: number; co2Saved: number; completed: boolean }[];
  };
  month: {
    totalCO2: number;
    co2Saved: number;
    netCO2: number;
    averageDailyCO2: number;
    logsCount: number;
    monthlyTrend: { date: string; isoDate: string; netCO2: number; co2Saved: number; completed: boolean }[];
  };
  lifetime: {
    totalCO2: number;
    totalCO2Saved: number;
    totalLoggedDays: number;
  };
  rewards: {
    xp: number;
    level: number;
    leafCoins: number;
    ecoPoints: number;
    currentStreak: number;
    longestStreak: number;
  };
  categoryBreakdown: { name: string; value: number; color: string }[];
  insights: { type: string; title: string; message: string; severity: "positive" | "warning" | "info" }[];
  carbonEquivalents: {
    phoneCharges: number;
    petrolKm: number;
    treeDays: number;
  };
  hasLogs: boolean;
};

export function getDashboardSummary() {
  return api<DashboardSummary>("/dashboard/summary");
}
