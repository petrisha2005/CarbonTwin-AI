export type CoachMood = "busy" | "tired" | "lazy" | "broke" | "motivated" | "travelling" | "college_day" | "at_home";
export type CoachDifficulty = "easy" | "medium" | "challenge";
export type CoachBudget = "free_only" | "low_cost" | "any";
export type CoachSource = "gemini" | "fallback";
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
  source: CoachSource;
};
