import { api } from "../lib/api";
import type { DailyLog } from "../lib/types";

export type TwinProfile = {
  user: {
    name: string;
    city: string;
    xp: number;
    level: number;
    leafCoins: number;
    ecoPoints: number;
    currentStreak: number;
    longestStreak: number;
    totalCO2Saved: number;
    totalLoggedDays: number;
  };
  twin: {
    avatarMood: "glowing" | "happy" | "calm" | "tired" | "polluted";
    moodMessage: string;
    personalityType: string;
    personalityDescription: string;
    mainImpactCategory: string;
    ecoTitle: string;
    treeStage: string;
    treeStageDescription: string;
    nextTreeStage: string;
    xpForCurrentLevel: number;
    xpForNextLevel: number;
    xpProgressPercent: number;
    evolutionStage: string;
    nextEvolutionGoal: string;
    evolutionStages: string[];
    weeklyStatus: "excellent" | "good" | "needs_attention" | "inactive";
    weeklyStatusMessage: string;
    twinMessage: string;
  };
  stats: {
    todayNetCO2: number;
    weeklyNetCO2: number;
    monthlyNetCO2: number;
    weeklyCO2Saved: number;
    monthlyCO2Saved: number;
    bestLowCarbonDay: string | null;
    highestImpactCategory: string;
  };
  recentLogs: DailyLog[];
};

export function getTwinProfile() {
  return api<TwinProfile>("/twin/profile");
}
