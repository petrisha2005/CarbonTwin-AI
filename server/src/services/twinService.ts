import { store } from "./store.js";
import {
  allEvolutionStages,
  avatarMoodFromToday,
  avatarMoodMessage,
  ecoTitleForLevel,
  evolutionForLoggedDays,
  personalityFromCategories,
  treeDetails,
  twinMessage,
  weeklyStatus,
  xpProgress
} from "../utils/twinLogic.js";

function startOfDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function key(date: Date | string) {
  const value = typeof date === "string" ? new Date(`${date}T00:00:00.000Z`) : date;
  return startOfDay(value).toISOString().slice(0, 10);
}

function startOfWeek(today = new Date()) {
  const start = startOfDay(today);
  const weekday = start.getUTCDay();
  start.setUTCDate(start.getUTCDate() + (weekday === 0 ? -6 : 1 - weekday));
  return start;
}

function startOfMonth(today = new Date()) {
  return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function sum(values: number[]) {
  return round(values.reduce((total, value) => total + value, 0));
}

function categoryValue(log: any, field: "transport" | "electricity" | "food" | "shoppingWaste") {
  return log?.totals?.[`${field}CO2`] ?? log?.[field]?.co2 ?? 0;
}

export async function getTwinProfile(userId: string) {
  const [user, logs] = await Promise.all([store.findUser(userId), store.dailyLogs(userId)]);
  if (!user) throw new Error("User not found");

  const today = startOfDay(new Date());
  const todayLog = logs.find((log: any) => key(log.date) === key(today)) ?? null;
  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 6);
  const monthStart = startOfMonth(today);
  const weekLogs = logs.filter((log: any) => {
    const date = startOfDay(new Date(`${log.date}T00:00:00.000Z`));
    return date >= weekStart && date <= weekEnd;
  });
  const monthLogs = logs.filter((log: any) => {
    const date = startOfDay(new Date(`${log.date}T00:00:00.000Z`));
    return date >= monthStart && date <= today;
  });
  const categories = [
    { name: "Transport", value: sum(monthLogs.map((log: any) => categoryValue(log, "transport"))) },
    { name: "Electricity", value: sum(monthLogs.map((log: any) => categoryValue(log, "electricity"))) },
    { name: "Food", value: sum(monthLogs.map((log: any) => categoryValue(log, "food"))) },
    { name: "Shopping/Waste", value: sum(monthLogs.map((log: any) => categoryValue(log, "shoppingWaste"))) }
  ];
  const personality = personalityFromCategories(categories);
  const avatarMood = avatarMoodFromToday(todayLog);
  const xp = user.xp ?? 0;
  const xpData = xpProgress(xp);
  const tree = treeDetails(user.level ?? xpData.level);
  const evolution = evolutionForLoggedDays(user.totalLoggedDays ?? logs.length);
  const weeklySaved = sum(weekLogs.map((log: any) => log.co2Saved ?? 0));
  const monthlySaved = sum(monthLogs.map((log: any) => log.co2Saved ?? 0));
  const week = weeklyStatus(weekLogs.length, weeklySaved);
  const bestLowCarbonDay = weekLogs.length ? [...weekLogs].sort((a: any, b: any) => a.netCO2 - b.netCO2)[0] : null;
  const highestCategory = [...categories].sort((a, b) => b.value - a.value)[0];

  return {
    user: {
      name: user.name,
      city: user.city,
      xp,
      level: user.level ?? xpData.level,
      leafCoins: user.leafCoins ?? 0,
      ecoPoints: user.ecoPoints ?? 0,
      currentStreak: user.currentStreak ?? 0,
      longestStreak: user.longestStreak ?? 0,
      totalCO2Saved: user.totalCO2Saved ?? user.co2Saved ?? 0,
      totalLoggedDays: user.totalLoggedDays ?? logs.length
    },
    twin: {
      avatarMood,
      moodMessage: todayLog?.moodMessage ?? avatarMoodMessage(avatarMood),
      ...personality,
      ecoTitle: ecoTitleForLevel(user.level ?? xpData.level),
      ...tree,
      ...xpData,
      ...evolution,
      evolutionStages: allEvolutionStages(),
      weeklyStatus: week.status,
      weeklyStatusMessage: week.message,
      twinMessage: twinMessage({
        name: user.name,
        todayLog,
        currentStreak: user.currentStreak ?? 0,
        personalityType: personality.personalityType,
        avatarMood,
        weeklySaved
      }),
      nextEvolutionGoal: evolution.nextEvolutionGoal
    },
    stats: {
      todayNetCO2: todayLog?.netCO2 ?? 0,
      weeklyNetCO2: sum(weekLogs.map((log: any) => log.netCO2 ?? 0)),
      monthlyNetCO2: sum(monthLogs.map((log: any) => log.netCO2 ?? 0)),
      weeklyCO2Saved: weeklySaved,
      monthlyCO2Saved: monthlySaved,
      bestLowCarbonDay: bestLowCarbonDay?.date ?? null,
      highestImpactCategory: highestCategory?.value > 0 ? highestCategory.name : "No data yet"
    },
    recentLogs: [...logs].sort((a: any, b: any) => b.date.localeCompare(a.date)).slice(0, 6)
  };
}
