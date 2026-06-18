import { store } from "./store.js";
import { ecoScore, periodScore, publicLeaderboardUser } from "../utils/leaderboardScore.js";

type LeaderboardType = "global" | "city" | "college" | "department" | "weekly" | "monthly";

function startOfDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function startOfWeek(date = new Date()) {
  const day = startOfDay(date);
  const weekday = day.getUTCDay();
  return addDays(day, weekday === 0 ? -6 : 1 - weekday);
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

function limitFrom(value: unknown) {
  const parsed = Number(value ?? 20);
  return Number.isFinite(parsed) ? Math.max(1, Math.min(100, parsed)) : 20;
}

async function rankedUsers(filter: (user: any) => boolean = () => true) {
  const users = (await store.allUsers()).filter(filter);
  return users
    .map((user) => ({ user, score: ecoScore(user) }))
    .sort((a, b) => b.score - a.score || b.user.totalCO2Saved - a.user.totalCO2Saved)
    .map((entry, index) => publicLeaderboardUser(entry.user, index + 1, entry.score));
}

function missing(message: string, leaderboardType: LeaderboardType) {
  return { leaderboardType, needsProfileUpdate: true, message, currentUserRank: null, currentUser: null, topUsers: [] };
}

async function baseLeaderboard(userId: string, leaderboardType: LeaderboardType, limit: number, filter: (user: any) => boolean = () => true) {
  const all = await rankedUsers(filter);
  const currentUser = all.find((user) => user.userId === userId) ?? null;
  return {
    leaderboardType,
    currentUserRank: currentUser?.rank ?? null,
    currentUser,
    topUsers: all.slice(0, limit)
  };
}

async function periodLeaderboard(userId: string, leaderboardType: "weekly" | "monthly", limit: number) {
  const [users, logs] = await Promise.all([store.allUsers(), store.allDailyLogs()]);
  const today = startOfDay();
  const start = leaderboardType === "weekly" ? startOfWeek(today) : startOfMonth(today);
  const periodLogs = logs.filter((log: any) => {
    const date = parseDate(log.date);
    return date >= start && date <= today;
  });
  const metrics = new Map<string, { co2Saved: number; logsCount: number; xpEarned: number }>();
  for (const log of periodLogs) {
    const userLog = metrics.get(log.userId) ?? { co2Saved: 0, logsCount: 0, xpEarned: 0 };
    userLog.co2Saved += Number(log.co2Saved ?? log.totals?.co2Saved ?? 0);
    userLog.logsCount += 1;
    userLog.xpEarned += Number(log.xpEarned ?? log.rewards?.xpEarned ?? 0);
    metrics.set(log.userId, userLog);
  }
  const ranked = users
    .map((user) => {
      const metric = metrics.get(user.id) ?? { co2Saved: 0, logsCount: 0, xpEarned: 0 };
      const score = periodScore({ ...metric, period: leaderboardType });
      return {
        ...publicLeaderboardUser(user, 0, ecoScore(user)),
        rank: 0,
        [`${leaderboardType}CO2Saved`]: round(metric.co2Saved),
        [`${leaderboardType}LogsCount`]: metric.logsCount,
        [`${leaderboardType}XPEarned`]: metric.xpEarned,
        [`${leaderboardType}Score`]: score,
        ecoScore: score
      };
    })
    .sort((a: any, b: any) => b[`${leaderboardType}Score`] - a[`${leaderboardType}Score`] || b.totalCO2Saved - a.totalCO2Saved)
    .map((user, index) => ({ ...user, rank: index + 1 }));
  const currentUser = ranked.find((user) => user.userId === userId) ?? null;
  return { leaderboardType, currentUserRank: currentUser?.rank ?? null, currentUser, topUsers: ranked.slice(0, limit) };
}

function nextRankInfo(list: any[], userId: string, scoreKey = "ecoScore") {
  const index = list.findIndex((item) => item.userId === userId);
  if (index < 0) return { rank: null, usersAhead: 0, pointsToNextRank: 0, nextRankUser: null };
  const current = list[index];
  const nextRankUser = index > 0 ? list[index - 1] : null;
  const pointsToNextRank = nextRankUser ? Math.max(1, Math.round(Number(nextRankUser[scoreKey] ?? 0) - Number(current[scoreKey] ?? 0) + 1)) : 0;
  return { rank: current.rank, usersAhead: index, pointsToNextRank, nextRankUser };
}

function impactFor(users: any[], logs: any[]) {
  const userIds = new Set(users.map((user) => user.id));
  const scopedLogs = logs.filter((log: any) => userIds.has(log.userId));
  const totalCO2Saved = round(users.reduce((total, user) => total + Number(user.totalCO2Saved ?? user.co2Saved ?? 0), 0));
  return {
    totalUsers: users.length,
    totalCO2Saved,
    totalEcoQuests: scopedLogs.length,
    totalLeafCoins: users.reduce((total, user) => total + Number(user.leafCoins ?? 0), 0),
    equivalentTrees: Math.round(totalCO2Saved / 21),
    equivalentPetrolKm: Math.round(totalCO2Saved / 0.192)
  };
}

export const leaderboardService = {
  async get(type: LeaderboardType, userId: string, rawLimit?: unknown) {
    const limit = limitFrom(rawLimit);
    const user = await store.findUser(userId);
    if (!user) throw new Error("User not found");
    if (type === "global") return baseLeaderboard(userId, type, limit);
    if (type === "weekly" || type === "monthly") return periodLeaderboard(userId, type, limit);
    if (type === "city") {
      if (!user.city) return missing("Add your city to unlock your local leaderboard.", type);
      return baseLeaderboard(userId, type, limit, (item) => item.city === user.city);
    }
    if (type === "college") {
      if (!user.collegeName) return missing("Add your college to join your Campus Carbon League.", type);
      return baseLeaderboard(userId, type, limit, (item) => item.collegeName === user.collegeName);
    }
    if (!user.collegeName || !user.department) return missing("Add your department to compete with classmates.", type);
    return baseLeaderboard(userId, type, limit, (item) => item.collegeName === user.collegeName && item.department === user.department);
  },

  async me(userId: string) {
    const user = await store.findUser(userId);
    if (!user) throw new Error("User not found");
    const [global, weekly, monthly] = await Promise.all([
      rankedUsers(),
      periodLeaderboard(userId, "weekly", 100),
      periodLeaderboard(userId, "monthly", 100)
    ]);
    const city = user.city ? await rankedUsers((item) => item.city === user.city) : [];
    const college = user.collegeName ? await rankedUsers((item) => item.collegeName === user.collegeName) : [];
    const department = user.collegeName && user.department ? await rankedUsers((item) => item.collegeName === user.collegeName && item.department === user.department) : [];
    return {
      global: nextRankInfo(global, userId),
      city: user.city ? nextRankInfo(city, userId) : { message: "Add your city to unlock your local leaderboard." },
      college: user.collegeName ? nextRankInfo(college, userId) : { message: "Add your college to join your Campus Carbon League." },
      department: user.department ? nextRankInfo(department, userId) : { message: "Add your department to compete with classmates." },
      weekly: nextRankInfo(weekly.topUsers, userId, "weeklyScore"),
      monthly: nextRankInfo(monthly.topUsers, userId, "monthlyScore")
    };
  },

  async communityImpact(userId: string) {
    const [user, users, logs] = await Promise.all([store.findUser(userId), store.allUsers(), store.allDailyLogs()]);
    if (!user) throw new Error("User not found");
    return {
      global: impactFor(users, logs),
      city: user.city ? impactFor(users.filter((item) => item.city === user.city), logs) : null,
      college: user.collegeName ? impactFor(users.filter((item) => item.collegeName === user.collegeName), logs) : null,
      department: user.collegeName && user.department ? impactFor(users.filter((item) => item.collegeName === user.collegeName && item.department === user.department), logs) : null
    };
  }
};
