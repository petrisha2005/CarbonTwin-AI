import type { CoachCategory, CoachDifficulty, CoachPreferences, CoachRecommendation } from "./coachTypes.js";

type CoachAnalysis = Awaited<ReturnType<typeof import("./coachAnalysisService.js").buildCoachAnalysis>>;

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const categoryActions: Record<
  CoachCategory,
  Array<{ title: string; saving: number; reason: string; swapFrom: string; swapTo: string }>
> = {
  transport: [
    {
      title: "Replace one short fuel trip with walking or cycling",
      saving: 2.4,
      reason: "Short vehicle trips are fuel-heavy, so replacing even one trims avoidable transport CO2.",
      swapFrom: "Short petrol or diesel rides",
      swapTo: "Walking, cycling, or a shared public transport ride"
    },
    {
      title: "Combine two errands into one route",
      saving: 3.2,
      reason: "Batching errands reduces repeated start-stop travel and saves fuel across the week.",
      swapFrom: "Separate errand trips",
      swapTo: "One combined route"
    },
    {
      title: "Plan one public transport day",
      saving: 4.5,
      reason: "A bus, metro, or train day can replace higher-emission private travel.",
      swapFrom: "Private vehicle commute",
      swapTo: "Bus, metro, train, or carpool"
    }
  ],
  electricity: [
    {
      title: "Reduce AC use by one hour today",
      saving: 2.1,
      reason: "Cooling is energy intensive, so one fewer hour adds up without changing your whole routine.",
      swapFrom: "Long AC sessions",
      swapTo: "Fan plus one hour less AC"
    },
    {
      title: "Switch off idle appliances before sleep",
      saving: 1.8,
      reason: "Idle devices quietly add electricity emissions every day.",
      swapFrom: "Leaving chargers and appliances on",
      swapTo: "A two-minute night switch-off"
    },
    {
      title: "Use natural light for one study or work block",
      saving: 1.4,
      reason: "Daylight blocks reduce lighting use with almost no effort.",
      swapFrom: "Daytime artificial lighting",
      swapTo: "Natural light near a window"
    }
  ],
  food: [
    {
      title: "Make one meal plant-based",
      saving: 2.6,
      reason: "Plant-forward meals usually carry lower food emissions than meat-heavy choices.",
      swapFrom: "Meat-heavy meal",
      swapTo: "Dal, beans, paneer-light, tofu, or vegetable bowl"
    },
    {
      title: "Skip one delivery order this week",
      saving: 2,
      reason: "Avoiding one delivery trims travel, packaging, and impulse food waste.",
      swapFrom: "One delivery meal",
      swapTo: "Home, hostel, or canteen meal"
    },
    {
      title: "Use leftovers before buying more food",
      saving: 1.6,
      reason: "Food waste carries hidden emissions from growing, transport, and disposal.",
      swapFrom: "Letting leftovers expire",
      swapTo: "Leftover-first meal"
    }
  ],
  shoppingWaste: [
    {
      title: "Avoid one non-essential online order",
      saving: 3,
      reason: "Skipping an order avoids packaging and delivery emissions immediately.",
      swapFrom: "Impulse online order",
      swapTo: "Wait 48 hours or borrow/reuse"
    },
    {
      title: "Carry a reusable bottle and bag",
      saving: 1.2,
      reason: "Reusable basics prevent small plastic waste from repeating all week.",
      swapFrom: "Single-use bottle or bag",
      swapTo: "Reusable bottle and bag"
    },
    {
      title: "Repair or reuse one item before replacing it",
      saving: 2.8,
      reason: "Keeping an item in use avoids manufacturing and delivery emissions.",
      swapFrom: "Buying a replacement",
      swapTo: "Repairing, reusing, or borrowing"
    }
  ]
};

function moodCategory(preferences: CoachPreferences, fallback: CoachCategory): CoachCategory {
  if (preferences.mood === "travelling") return "transport";
  if (preferences.mood === "at_home") return "electricity";
  if (preferences.mood === "college_day") return fallback === "shoppingWaste" ? "food" : fallback;
  return fallback;
}

function nonTransportFallback(analysis: CoachAnalysis): CoachCategory {
  const entries = (Object.entries(analysis.categoryTotals) as Array<[CoachCategory, number]>)
    .filter(([category]) => category !== "transport")
    .sort(([, a], [, b]) => b - a);
  return entries[0]?.[0] ?? "electricity";
}

function difficulty(preferences: CoachPreferences): CoachDifficulty {
  if (preferences.mood === "lazy" || preferences.mood === "tired" || preferences.mood === "busy") return "easy";
  if (preferences.mood === "motivated") return "challenge";
  return preferences.difficultyPreference ?? "easy";
}

function timeRequired(preferences: CoachPreferences) {
  if (preferences.mood === "busy") return "5 minutes";
  if (preferences.mood === "lazy" || preferences.mood === "tired") return "2 minutes";
  if (preferences.mood === "motivated") return "30 minutes";
  return "10-15 minutes";
}

function cost(preferences: CoachPreferences): "free" | "low_cost" | "paid" {
  if (preferences.budgetPreference === "free_only" || preferences.mood === "broke") return "free";
  if (preferences.budgetPreference === "low_cost") return "low_cost";
  return "free";
}

function rotateCategories(primary: CoachCategory, omitTransport = false): CoachCategory[] {
  const categories: CoachCategory[] = ["transport", "electricity", "food", "shoppingWaste"];
  const available = omitTransport ? categories.filter((category) => category !== "transport") : categories;
  return [primary, ...available.filter((category) => category !== primary)];
}

export function buildFallbackCoachRecommendations(analysis: CoachAnalysis, preferences: CoachPreferences): CoachRecommendation {
  const requestedPrimary = moodCategory(preferences, analysis.highestImpactCategory);
  const primary = analysis.latestLogHadNoTravel && requestedPrimary === "transport" ? nonTransportFallback(analysis) : requestedPrimary;
  const selectedDifficulty = difficulty(preferences);
  const categoryList = rotateCategories(primary, analysis.latestLogHadNoTravel);
  const quickActions = categoryList.flatMap((category) =>
    categoryActions[category].slice(0, category === primary ? 2 : 1).map((action) => ({
      title: preferences.mood === "busy" ? action.title.replace(" this week", "") : action.title,
      category,
      estimatedCO2Saving: action.saving,
      difficulty: selectedDifficulty,
      timeRequired: timeRequired(preferences),
      cost: cost(preferences),
      whyThisHelps: action.reason
    }))
  ).slice(0, 5);
  const weeklyPlan = dayNames.map((day, index) => {
    const category = categoryList[index % categoryList.length];
    const action = categoryActions[category][index % categoryActions[category].length];
    return {
      day,
      action: preferences.mood === "busy" ? `Do a 5-minute version: ${action.title.toLowerCase()}` : action.title,
      category,
      estimatedCO2Saving: action.saving,
      difficulty: index < 3 ? selectedDifficulty : preferences.difficultyPreference ?? "medium",
      reason: action.reason
    };
  });
  const habit = categoryActions[primary][0];
  const target = Math.max(2, Math.min(12, Math.round((analysis.weeklyCO2 * 0.08 + quickActions[0].estimatedCO2Saving) * 10) / 10));

  return {
    coachMessage: `Your CarbonTwin is reading ${analysis.user.name}'s real Eco Quest pattern. ${analysis.improvementOpportunity}`,
    summary: `Average daily footprint: ${analysis.averageDailyCO2} kg. This week: ${analysis.weeklyCO2} kg emitted and ${analysis.weeklySaved} kg saved. Logging consistency is ${analysis.loggingConsistency}%.`,
    highestImpactCategory: primary,
    weeklyPlan,
    quickActions,
    habitSwap: {
      from: habit.swapFrom,
      to: habit.swapTo,
      estimatedCO2Saving: habit.saving,
      reason: habit.reason
    },
    carbonReductionTarget: {
      targetKg: target,
      timeframe: "next 7 days",
      baselineKg: analysis.weeklyCO2
    },
    motivationalLine: preferences.mood === "broke" ? "Free changes still count, and your data shows exactly where they can work." : "Small repeatable shifts are enough to evolve your CarbonTwin.",
    basedOnData: true,
    source: "fallback"
  };
}
