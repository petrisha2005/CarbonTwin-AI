import { api } from "../lib/api";

export type CoachMood = "busy" | "tired" | "lazy" | "broke" | "motivated" | "travelling" | "college_day" | "at_home";
export type CoachDifficulty = "easy" | "medium" | "challenge";
export type CoachBudget = "free_only" | "low_cost" | "any";
export type CoachCategory = "transport" | "electricity" | "food" | "shoppingWaste";

export type CoachPreferences = {
  mood?: CoachMood;
  goalKey?: string;
  goal?: string;
  difficultyPreference?: CoachDifficulty;
  budgetPreference?: CoachBudget;
};

export type CoachRecommendation = {
  coachMessage: string;
  summary: string;
  highestImpactCategory: CoachCategory;
  weeklyPlan: Array<{
    day: string;
    action: string;
    category: CoachCategory;
    estimatedCO2Saving: number;
    difficulty: CoachDifficulty;
    reason: string;
  }>;
  quickActions: Array<{
    title: string;
    category: CoachCategory;
    estimatedCO2Saving: number;
    difficulty: CoachDifficulty;
    timeRequired: string;
    cost: "free" | "low_cost" | "paid";
    whyThisHelps: string;
  }>;
  habitSwap: {
    from: string;
    to: string;
    estimatedCO2Saving: number;
    reason: string;
  };
  carbonReductionTarget: {
    targetKg: number;
    timeframe: string;
    baselineKg: number;
  };
  motivationalLine: string;
  basedOnData: boolean;
  source: "gemini" | "fallback";
};

export type SavedCoachPlan = CoachPreferences & {
  id: string;
  generatedAt: string;
  recommendations: CoachRecommendation;
  source: "gemini" | "fallback";
};

export type RecommendationsResponse =
  | { recommendations: CoachRecommendation; analysis?: unknown }
  | { needsData: true; message: string; detail: string; basedOnData: false };

export function getCoachRecommendations(preferences: CoachPreferences) {
  return api<RecommendationsResponse>("/coach/recommendations", {
    method: "POST",
    body: JSON.stringify(preferences)
  });
}

export function saveCoachPlan(preferences: CoachPreferences, recommendations: CoachRecommendation) {
  return api<{ plan: SavedCoachPlan }>("/coach/save-plan", {
    method: "POST",
    body: JSON.stringify({ ...preferences, recommendations })
  });
}

export function getLatestCoachPlan() {
  return api<{ plan: SavedCoachPlan | null }>("/coach/latest-plan");
}

export function getCoachHistory() {
  return api<{ plans: SavedCoachPlan[] }>("/coach/history");
}
