import { store } from "./store.js";
import { avatarMoodMessage, carbonEquivalents } from "../utils/gamification.js";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function startOfDay(value = new Date()) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function dateKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(`${value}T00:00:00.000Z`) : value;
  return startOfDay(date).toISOString().slice(0, 10);
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

function endOfMonth(today = new Date()) {
  return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0));
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function sum(values: number[]) {
  return round(values.reduce((total, value) => total + value, 0));
}

function categoryValue(log: any, key: "transport" | "electricity" | "food" | "shoppingWaste") {
  return log?.totals?.[`${key}CO2`] ?? log?.[key]?.co2 ?? 0;
}

function insight(type: string, title: string, message: string, severity: "positive" | "warning" | "info") {
  return { type, title, message, severity };
}

export async function getDashboardSummary(userId: string) {
  const [user, logs] = await Promise.all([store.findUser(userId), store.dailyLogs(userId)]);
  const today = startOfDay(new Date());
  const todayString = dateKey(today);
  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 6);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const todayLog = logs.find((log: any) => dateKey(log.date) === todayString) ?? null;
  const weekLogs = logs.filter((log: any) => {
    const date = startOfDay(new Date(`${log.date}T00:00:00.000Z`));
    return date >= weekStart && date <= weekEnd;
  });
  const monthLogs = logs.filter((log: any) => {
    const date = startOfDay(new Date(`${log.date}T00:00:00.000Z`));
    return date >= monthStart && date <= monthEnd;
  });

  const weeklyTrend = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const key = dateKey(date);
    const log = weekLogs.find((item: any) => dateKey(item.date) === key);
    return {
      day: dayNames[date.getUTCDay()],
      date: key,
      netCO2: log?.netCO2 ?? 0,
      co2Saved: log?.co2Saved ?? 0,
      completed: Boolean(log)
    };
  });

  const monthlyTrend = Array.from({ length: monthEnd.getUTCDate() }, (_, index) => {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), index + 1));
    const key = dateKey(date);
    const log = monthLogs.find((item: any) => dateKey(item.date) === key);
    return {
      date: `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}`,
      isoDate: key,
      netCO2: log?.netCO2 ?? 0,
      co2Saved: log?.co2Saved ?? 0,
      completed: Boolean(log)
    };
  });

  const weekTotal = sum(weekLogs.map((log: any) => log.netCO2 ?? 0));
  const weekSaved = sum(weekLogs.map((log: any) => log.co2Saved ?? 0));
  const monthTotal = sum(monthLogs.map((log: any) => log.netCO2 ?? 0));
  const monthSaved = sum(monthLogs.map((log: any) => log.co2Saved ?? 0));
  const lifetimeSaved = sum(logs.map((log: any) => log.co2Saved ?? 0));
  const bestDay = weekLogs.length ? [...weekLogs].sort((a: any, b: any) => a.netCO2 - b.netCO2)[0] : null;
  const worstDay = weekLogs.length ? [...weekLogs].sort((a: any, b: any) => b.netCO2 - a.netCO2)[0] : null;
  const categoryBreakdown = [
    { name: "Transport", value: sum(monthLogs.map((log: any) => categoryValue(log, "transport"))), color: "#22C55E" },
    { name: "Electricity", value: sum(monthLogs.map((log: any) => categoryValue(log, "electricity"))), color: "#EAB308" },
    { name: "Food", value: sum(monthLogs.map((log: any) => categoryValue(log, "food"))), color: "#F97316" },
    { name: "Shopping & Waste", value: sum(monthLogs.map((log: any) => categoryValue(log, "shoppingWaste"))), color: "#A78BFA" }
  ];
  const highestCategory = [...categoryBreakdown].sort((a, b) => b.value - a.value)[0];
  const previousMonthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
  const previousMonthEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0));
  const previousMonthLogs = logs.filter((log: any) => {
    const date = startOfDay(new Date(`${log.date}T00:00:00.000Z`));
    return date >= previousMonthStart && date <= previousMonthEnd;
  });
  const currentAverage = monthLogs.length ? monthTotal / monthLogs.length : 0;
  const previousAverage = previousMonthLogs.length ? sum(previousMonthLogs.map((log: any) => log.netCO2 ?? 0)) / previousMonthLogs.length : 0;
  const insights = [];

  if (!todayLog) insights.push(insight("today", "Your CarbonTwin is waiting", "Complete today's Eco Quest to keep your streak alive.", "info"));
  if (highestCategory?.value > 0 && highestCategory.name === "Transport") insights.push(insight("transport", "Transport is your biggest impact", "Try replacing one short trip with walking, cycling, or public transport this week.", "warning"));
  if (highestCategory?.value > 0 && highestCategory.name === "Electricity") insights.push(insight("electricity", "Energy use is leading your footprint", "Reducing AC use by even 1 hour can make a visible difference.", "warning"));
  if ((user?.currentStreak ?? 0) >= 3) insights.push(insight("streak", "Streak momentum", "You're building a strong eco habit. Keep your streak going today.", "positive"));
  if (weekSaved > 5) insights.push(insight("saved", "Great progress", "You saved more than 5 kg CO2 this week through small actions.", "positive"));
  if (previousAverage > 0 && currentAverage < previousAverage) insights.push(insight("improvement", "Carbon improvement detected", "Your average daily footprint is lower than last month.", "positive"));
  if (insights.length === 0) insights.push(insight("start", "Tiny action, real impact", "Log a few Eco Quests to unlock sharper personal insights.", "info"));

  return {
    user,
    hasBaseline: Boolean(user?.baselineFootprint?.calculatedAt),
    baselineFootprint: user?.baselineFootprint,
    today: {
      date: todayString,
      totalCO2: todayLog?.totalCO2 ?? 0,
      co2Saved: todayLog?.co2Saved ?? 0,
      netCO2: todayLog?.netCO2 ?? 0,
      avatarMood: todayLog?.avatarMood ?? "tired",
      moodMessage: todayLog?.moodMessage ?? avatarMoodMessage(todayLog?.avatarMood ?? "tired"),
      completed: Boolean(todayLog)
    },
    week: {
      totalCO2: sum(weekLogs.map((log: any) => log.totalCO2 ?? 0)),
      co2Saved: weekSaved,
      netCO2: weekTotal,
      averageDailyCO2: round(weekLogs.length ? weekTotal / weekLogs.length : 0),
      logsCount: weekLogs.length,
      bestDay: bestDay ? { date: bestDay.date, netCO2: bestDay.netCO2 } : null,
      worstDay: worstDay ? { date: worstDay.date, netCO2: worstDay.netCO2 } : null,
      weeklyTrend
    },
    month: {
      totalCO2: sum(monthLogs.map((log: any) => log.totalCO2 ?? 0)),
      co2Saved: monthSaved,
      netCO2: monthTotal,
      averageDailyCO2: round(monthLogs.length ? monthTotal / monthLogs.length : 0),
      logsCount: monthLogs.length,
      monthlyTrend
    },
    lifetime: {
      totalCO2: sum(logs.map((log: any) => log.totalCO2 ?? 0)),
      totalCO2Saved: lifetimeSaved,
      totalLoggedDays: logs.length
    },
    rewards: {
      xp: user?.xp ?? 0,
      level: user?.level ?? 1,
      leafCoins: user?.leafCoins ?? 0,
      ecoPoints: user?.ecoPoints ?? 0,
      currentStreak: user?.currentStreak ?? 0,
      longestStreak: user?.longestStreak ?? 0
    },
    categoryBreakdown,
    insights: insights.slice(0, 5),
    carbonEquivalents: carbonEquivalents(lifetimeSaved),
    hasLogs: logs.length > 0
  };
}
