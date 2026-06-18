import { store } from "./store.js";
import { getTwinProfile } from "./twinService.js";
import type { CoachCategory } from "./coachTypes.js";

const categoryLabels: Record<CoachCategory, string> = {
  transport: "Transport",
  electricity: "Electricity",
  food: "Food",
  shoppingWaste: "Shopping/Waste"
};

function startOfDay(value = new Date()) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function startOfMonth(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function parseDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function categoryValue(log: any, category: CoachCategory) {
  const totalKey = category === "shoppingWaste" ? "shoppingWasteCO2" : `${category}CO2`;
  return Number(log?.totals?.[totalKey] ?? log?.[category]?.co2 ?? 0);
}

function strongestHabitFrom(logs: any[]) {
  const actions = logs.flatMap((log) => log.ecoActions ?? []);
  if (actions.length) {
    const top = actions.reduce((best: any, action: any) => ((action.co2Saved ?? 0) > (best.co2Saved ?? 0) ? action : best), actions[0]);
    return top?.title ?? "logging eco actions";
  }
  const saved = logs.reduce((total, log) => total + Number(log.co2Saved ?? 0), 0);
  return saved > 0 ? "saving carbon through daily choices" : "showing up and logging your footprint";
}

export async function buildCoachAnalysis(userId: string) {
  const [user, logs, twinProfile] = await Promise.all([store.findUser(userId), store.dailyLogs(userId), getTwinProfile(userId)]);
  if (!user) throw new Error("User not found");

  const sortedLogs = [...logs].sort((a: any, b: any) => a.date.localeCompare(b.date));
  const latestLog = sortedLogs.at(-1) ?? null;
  const today = startOfDay();
  const sevenDaysAgo = addDays(today, -6);
  const monthStart = startOfMonth(today);
  const last7Days = sortedLogs.filter((log: any) => {
    const date = parseDate(log.date);
    return date >= sevenDaysAgo && date <= today;
  });
  const currentMonthLogs = sortedLogs.filter((log: any) => {
    const date = parseDate(log.date);
    return date >= monthStart && date <= today;
  });
  const activeLogs = currentMonthLogs.length ? currentMonthLogs : sortedLogs;

  const categoryTotals = (Object.keys(categoryLabels) as CoachCategory[]).reduce(
    (totals, category) => ({ ...totals, [category]: round(activeLogs.reduce((sum, log: any) => sum + categoryValue(log, category), 0)) }),
    {} as Record<CoachCategory, number>
  );
  const categoryEntries = (Object.keys(categoryTotals) as CoachCategory[]).map((category) => ({ category, value: categoryTotals[category] }));
  const latestLogHadNoTravel = latestLog?.quickLog?.travelLevel === "no_travel";
  const rankedCategories = [...categoryEntries].sort((a, b) => b.value - a.value);
  const highestAvailableCategory = rankedCategories[0]?.category ?? "transport";
  const highestImpactCategory = latestLogHadNoTravel && highestAvailableCategory === "transport"
    ? rankedCategories.find((entry) => entry.category !== "transport")?.category ?? "electricity"
    : highestAvailableCategory;
  const lowestImpactCategory = [...categoryEntries].sort((a, b) => a.value - b.value)[0]?.category ?? "shoppingWaste";
  const totalCO2 = round(activeLogs.reduce((sum, log: any) => sum + Number(log.netCO2 ?? log.totalCO2 ?? 0), 0));
  const averageDailyCO2 = activeLogs.length ? round(totalCO2 / activeLogs.length) : 0;
  const weeklyCO2 = round(last7Days.reduce((sum, log: any) => sum + Number(log.netCO2 ?? log.totalCO2 ?? 0), 0));
  const weeklySaved = round(last7Days.reduce((sum, log: any) => sum + Number(log.co2Saved ?? 0), 0));
  const loggingConsistency = Math.min(100, Math.round((last7Days.length / 7) * 100));

  return {
    user,
    latestLog,
    last7Days,
    currentMonthLogs,
    categoryTotals,
    categoryLabels,
    highestImpactCategory,
    averageDailyCO2,
    weeklyCO2,
    weeklySaved,
    loggingConsistency,
    strongestHabit: strongestHabitFrom(last7Days.length ? last7Days : sortedLogs),
    latestLogHadNoTravel,
    zeroTravelMessage: latestLogHadNoTravel ? "You had zero travel impact today. Nice low-carbon day." : "",
    improvementOpportunity: latestLogHadNoTravel
      ? `You had zero travel impact today. Nice low-carbon day. ${categoryLabels[highestImpactCategory]} is the next practical opportunity.`
      : `${categoryLabels[highestImpactCategory]} is your biggest current opportunity.`,
    lowImpactCategory: lowestImpactCategory,
    twin: {
      avatarMood: twinProfile.twin.avatarMood,
      personalityType: twinProfile.twin.personalityType,
      mainImpactCategory: twinProfile.stats.highestImpactCategory,
      treeStage: twinProfile.twin.treeStage,
      ecoTitle: twinProfile.twin.ecoTitle
    },
    hasLogs: sortedLogs.length > 0
  };
}
