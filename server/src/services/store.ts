import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { CarbonLog } from "../models/CarbonLog.js";
import { DailyLog } from "../models/DailyLog.js";
import { User } from "../models/User.js";
import { UserMission } from "../models/UserMission.js";
import { missions } from "../data/missions.js";
import { calculateDailyTotal, type DailyInput, type QuickLogInput } from "../utils/dailyCarbonCalculator.js";
import { avatarMoodFor, avatarMoodMessage, carbonEquivalents, levelFromXp, treeStageForLevel, type TrackingMode } from "../utils/gamification.js";

export type PublicUser = {
  id: string;
  name: string;
  displayName: string;
  avatarColor: string;
  email: string;
  city: string;
  country: string;
  bio: string;
  ecoPoints: number;
  xp: number;
  level: number;
  leafCoins: number;
  currentStreak: number;
  longestStreak: number;
  streakFreezeCount: number;
  totalCO2Saved: number;
  baselineFootprint?: {
    totalCO2: number;
    transportCO2: number;
    electricityCO2: number;
    foodCO2: number;
    shoppingWasteCO2: number;
    calculatedAt?: Date;
  };
  totalLoggedDays: number;
  lastLogDate?: Date;
  badges: string[];
  carbonGoal: number;
  climateGoal: string;
  co2Saved: number;
  collegeName: string;
  department: string;
  batch: string;
  goals: Record<string, any>;
  preferences: Record<string, any>;
  privacy: Record<string, any>;
  onboarding: Record<string, any>;
  lastLoginAt?: Date;
  lastActiveAt?: Date;
  createdAt?: Date;
};

type MemoryUser = PublicUser & { passwordHash: string };
type AnyLog = Record<string, any>;
type AnyMission = Record<string, any>;

class MemoryStore {
  users: MemoryUser[] = [];
  logs: AnyLog[] = [];
  dailyLogs: AnyLog[] = [];
  userMissions: AnyMission[] = [];
}

const memory = new MemoryStore();
let mongoEnabled = false;

export function setMongoEnabled(value: boolean) {
  mongoEnabled = value;
}

export function isMongoEnabled() {
  return mongoEnabled;
}

function publicUser(user: any): PublicUser {
  return {
    id: String(user._id ?? user.id),
    name: user.name,
    displayName: user.displayName ?? "",
    avatarColor: user.avatarColor ?? "#22c55e",
    email: user.email,
    city: user.city ?? "",
    country: user.country ?? "",
    bio: user.bio ?? "",
    ecoPoints: user.ecoPoints ?? 0,
    xp: user.xp ?? 0,
    level: user.level ?? 1,
    leafCoins: user.leafCoins ?? 0,
    currentStreak: user.currentStreak ?? 0,
    longestStreak: user.longestStreak ?? 0,
    streakFreezeCount: user.streakFreezeCount ?? 0,
    totalCO2Saved: user.totalCO2Saved ?? user.co2Saved ?? 0,
    baselineFootprint: user.baselineFootprint,
    totalLoggedDays: user.totalLoggedDays ?? 0,
    lastLogDate: user.lastLogDate,
    badges: user.badges ?? [],
    carbonGoal: user.carbonGoal ?? 160,
    climateGoal: user.climateGoal ?? "",
    co2Saved: user.co2Saved ?? 0,
    collegeName: user.collegeName ?? "",
    department: user.department ?? "",
    batch: user.batch ?? "",
    goals: user.goals ?? { carbonGoalType: "", monthlyCarbonBudget: user.carbonGoal ?? 160 },
    preferences: user.preferences ?? {
      preferredTrackingMode: "",
      aiCoachTone: "",
      budgetPreference: "",
      difficultyPreference: "",
      categoryBudgetSplit: { transport: 0, electricity: 0, food: 0, shoppingWaste: 0 }
    },
    privacy: user.privacy ?? { showOnLeaderboards: true, shareCollegeStats: true },
    onboarding: {
      hasSeenWelcome: user.onboarding?.hasSeenWelcome ?? false,
      hasCompletedOnboarding: user.onboarding?.hasCompletedOnboarding ?? false,
      hasCompletedProfileSetup: user.onboarding?.hasCompletedProfileSetup ?? false,
      hasCompletedBaselineCalculator: user.onboarding?.hasCompletedBaselineCalculator ?? Boolean(user.baselineFootprint?.calculatedAt),
      hasSelectedGoal: user.onboarding?.hasSelectedGoal ?? false,
      hasSetBudget: user.onboarding?.hasSetBudget ?? false,
      hasCompletedFirstEcoQuest: user.onboarding?.hasCompletedFirstEcoQuest ?? false,
      skipped: user.onboarding?.skipped ?? false,
      onboardingCompletedAt: user.onboarding?.onboardingCompletedAt
    },
    lastLoginAt: user.lastLoginAt,
    lastActiveAt: user.lastActiveAt,
    createdAt: user.createdAt
  };
}

function serializeLog(log: any) {
  return {
    id: String(log._id ?? log.id),
    userId: String(log.userId),
    transportCO2: log.transportCO2,
    electricityCO2: log.electricityCO2,
    foodCO2: log.foodCO2,
    shoppingCO2: log.shoppingCO2,
    totalCO2: log.totalCO2,
    lifestyleInputs: log.lifestyleInputs,
    month: log.month,
    year: log.year,
    createdAt: log.createdAt
  };
}

function startOfDay(value: string | Date) {
  const date = typeof value === "string" ? new Date(`${value}T00:00:00.000Z`) : new Date(value);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function dateKey(value: string | Date) {
  return startOfDay(value).toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function startOfWeek(date = new Date()) {
  const day = startOfDay(date);
  const weekday = day.getUTCDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  return addDays(day, mondayOffset);
}

function startOfMonth(date = new Date()) {
  const day = startOfDay(date);
  return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1));
}

function serializeDailyLog(log: any) {
  return {
    id: String(log._id ?? log.id),
    userId: String(log.userId),
    date: dateKey(log.date),
    transport: log.transport,
    electricity: log.electricity,
    food: log.food,
    shoppingWaste: log.shoppingWaste,
    ecoActions: log.ecoActions ?? [],
    totalCO2: log.totalCO2 ?? 0,
    co2Saved: log.co2Saved ?? 0,
    netCO2: log.netCO2 ?? 0,
    pointsEarned: log.pointsEarned ?? 0,
    xpEarned: log.xpEarned ?? 0,
    leafCoinsEarned: log.leafCoinsEarned ?? 0,
    levelAfterLog: log.levelAfterLog ?? 1,
    treeStage: log.treeStage ?? "Seed",
    trackingMode: log.trackingMode ?? "detailed",
    moodSelected: log.moodSelected ?? "",
    avatarMood: log.avatarMood ?? "tired",
    carbonEquivalents: log.carbonEquivalents ?? carbonEquivalents(log.netCO2 ?? 0),
    quickLog: log.quickLog,
    detailedLog: log.detailedLog,
    totals: log.totals ?? {
      transportCO2: log.transport?.co2 ?? 0,
      electricityCO2: log.electricity?.co2 ?? 0,
      foodCO2: log.food?.co2 ?? 0,
      shoppingWasteCO2: log.shoppingWaste?.co2 ?? 0,
      totalCO2: log.totalCO2 ?? 0,
      co2Saved: log.co2Saved ?? 0,
      netCO2: log.netCO2 ?? 0
    },
    rewards: log.rewards ?? {
      xpEarned: log.xpEarned ?? 0,
      leafCoinsEarned: log.leafCoinsEarned ?? 0,
      levelAfterLog: log.levelAfterLog ?? 1
    },
    moodMessage: log.moodMessage ?? avatarMoodMessage(log.avatarMood ?? "tired"),
    createdAt: log.createdAt,
    updatedAt: log.updatedAt
  };
}

function sum(values: number[]) {
  return Math.round(values.reduce((total, value) => total + value, 0) * 10) / 10;
}

function computeStreak(logs: any[]) {
  const keys = new Set(logs.map((log) => dateKey(log.date)));
  const today = startOfDay(new Date());
  let cursor = keys.has(dateKey(today)) ? today : addDays(today, -1);
  let currentStreak = 0;
  while (keys.has(dateKey(cursor))) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  const sorted = [...keys].sort();
  let longestStreak = 0;
  let activeRun = 0;
  let previous: Date | null = null;
  for (const key of sorted) {
    const current = startOfDay(key);
    activeRun = previous && dateKey(addDays(previous, 1)) === key ? activeRun + 1 : 1;
    longestStreak = Math.max(longestStreak, activeRun);
    previous = current;
  }
  return { currentStreak, longestStreak, totalLoggedDays: keys.size };
}

function buildDailySummary(logs: any[]) {
  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today);
  const monthStart = startOfMonth(today);
  const serialized = logs.map(serializeDailyLog).sort((a, b) => a.date.localeCompare(b.date));
  const todayLog = serialized.find((log) => log.date === dateKey(today));
  const weekLogs = serialized.filter((log) => startOfDay(log.date) >= weekStart && startOfDay(log.date) <= today);
  const monthLogs = serialized.filter((log) => startOfDay(log.date) >= monthStart && startOfDay(log.date) <= today);
  const streak = computeStreak(logs);
  const categoryBreakdown = [
    { name: "Transport", value: sum(monthLogs.map((log) => log.transport?.co2 ?? 0)), color: "#22C55E" },
    { name: "Electricity", value: sum(monthLogs.map((log) => log.electricity?.co2 ?? 0)), color: "#06B6D4" },
    { name: "Food", value: sum(monthLogs.map((log) => log.food?.co2 ?? 0)), color: "#F59E0B" },
    { name: "Shopping/Waste", value: sum(monthLogs.map((log) => log.shoppingWaste?.co2 ?? 0)), color: "#A78BFA" }
  ];

  return {
    todayCO2: todayLog?.netCO2 ?? 0,
    weeklyCO2: sum(weekLogs.map((log) => log.netCO2)),
    monthlyCO2: sum(monthLogs.map((log) => log.netCO2)),
    totalCO2Saved: sum(serialized.map((log) => log.co2Saved)),
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    totalLoggedDays: streak.totalLoggedDays,
    totalPoints: serialized.reduce((total, log) => total + log.pointsEarned, 0),
    xpEarned: serialized.reduce((total, log) => total + log.xpEarned, 0),
    leafCoinsEarned: serialized.reduce((total, log) => total + log.leafCoinsEarned, 0),
    categoryBreakdown,
    weeklyTrend: Array.from({ length: 7 }, (_, index) => {
      const day = addDays(weekStart, index);
      const log = serialized.find((item) => item.date === dateKey(day));
      return { date: dateKey(day), co2: log?.netCO2 ?? 0, saved: log?.co2Saved ?? 0 };
    }),
    monthlyTrend: monthLogs.map((log) => ({ date: log.date, co2: log.netCO2, saved: log.co2Saved })),
    savedTrend: monthLogs.map((log) => ({ date: log.date, saved: log.co2Saved })),
    latestDailyLog: serialized.at(-1) ?? null,
    todayLog,
    hasDailyLogs: serialized.length > 0
  };
}

function enrichQuestPayload(input: {
  userId: string;
  date: Date;
  calculated: ReturnType<typeof calculateDailyTotal>;
  logsForSummary: any[];
  previousXp: number;
  trackingMode?: TrackingMode;
  moodSelected?: string;
}) {
  const xpEarned = 20 + (input.calculated.actionXpEarned ?? input.calculated.pointsEarned);
  const leafCoinsEarned = 10 + (input.calculated.actionLeafCoinsEarned ?? Math.round(input.calculated.pointsEarned / 2));
  const levelAfterLog = levelFromXp(input.previousXp + xpEarned);
  const avatarMood = avatarMoodFor({
    loggedToday: true,
    netCO2: input.calculated.netCO2,
    co2Saved: input.calculated.co2Saved
  });

  return {
    trackingMode: input.trackingMode ?? "detailed",
    moodSelected: input.moodSelected ?? "",
    avatarMood,
    moodMessage: avatarMoodMessage(avatarMood),
    xpEarned,
    leafCoinsEarned,
    levelAfterLog,
    treeStage: treeStageForLevel(levelAfterLog),
    carbonEquivalents: carbonEquivalents(input.calculated.netCO2),
    totals: {
      transportCO2: input.calculated.transportCO2,
      electricityCO2: input.calculated.electricityCO2,
      foodCO2: input.calculated.foodCO2,
      shoppingWasteCO2: input.calculated.shoppingWasteCO2,
      totalCO2: input.calculated.totalCO2,
      co2Saved: input.calculated.co2Saved,
      netCO2: input.calculated.netCO2
    },
    rewards: {
      xpEarned,
      leafCoinsEarned,
      levelAfterLog
    }
  };
}

function computeBadges(user: PublicUser, completedCount: number) {
  const badges = new Set(user.badges);
  if (completedCount >= 3) badges.add("Eco Starter");
  if (completedCount >= 10) badges.add("Green Warrior");
  if (user.co2Saved >= 50) badges.add("Carbon Cutter");
  if (user.currentStreak >= 7) badges.add("Streak Master");
  return [...badges];
}

export const store = {
  async createUser(input: { name: string; email: string; password: string; city?: string; collegeName?: string; department?: string; batch?: string }) {
    const existing = mongoEnabled
      ? await User.findOne({ email: input.email.toLowerCase() })
      : memory.users.find((user) => user.email === input.email.toLowerCase());
    if (existing) throw new Error("Email already registered");
    const passwordHash = await bcrypt.hash(input.password, 10);
    if (mongoEnabled) {
      const user = await User.create({ ...input, displayName: input.name, email: input.email.toLowerCase(), passwordHash });
      return publicUser(user);
    }
    const user: MemoryUser = {
      id: randomUUID(),
      name: input.name,
      displayName: input.name,
      avatarColor: "#22c55e",
      email: input.email.toLowerCase(),
      passwordHash,
      city: input.city ?? "",
      country: "",
      bio: "",
      ecoPoints: 0,
      xp: 0,
      level: 1,
      leafCoins: 0,
      currentStreak: 0,
      longestStreak: 0,
      streakFreezeCount: 0,
      totalLoggedDays: 0,
      badges: [],
      carbonGoal: 160,
      climateGoal: "",
      co2Saved: 0,
      totalCO2Saved: 0,
      baselineFootprint: undefined,
      lastLogDate: undefined,
      collegeName: input.collegeName ?? "",
      department: input.department ?? "",
      batch: input.batch ?? "",
      goals: { carbonGoalType: "", monthlyCarbonBudget: 160 },
      preferences: {
        preferredTrackingMode: "",
        aiCoachTone: "",
        budgetPreference: "",
        difficultyPreference: "",
        categoryBudgetSplit: { transport: 0, electricity: 0, food: 0, shoppingWaste: 0 }
      },
      privacy: { showOnLeaderboards: true, shareCollegeStats: true },
      onboarding: {
        hasSeenWelcome: false,
        hasCompletedOnboarding: false,
        hasCompletedProfileSetup: false,
        hasCompletedBaselineCalculator: false,
        hasSelectedGoal: false,
        hasSetBudget: false,
        hasCompletedFirstEcoQuest: false,
        skipped: false
      },
      lastLoginAt: undefined,
      lastActiveAt: undefined,
      createdAt: new Date()
    };
    memory.users.push(user);
    return publicUser(user);
  },

  async validateUser(email: string, password: string) {
    const user = mongoEnabled
      ? await User.findOne({ email: email.toLowerCase() })
      : memory.users.find((item) => item.email === email.toLowerCase());
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;
    if (mongoEnabled) {
      const updated = await User.findByIdAndUpdate((user as any)._id, { lastLoginAt: new Date(), lastActiveAt: new Date() }, { new: true });
      return publicUser(updated);
    }
    user.lastLoginAt = new Date();
    user.lastActiveAt = new Date();
    return publicUser(user);
  },

  async findUser(id: string) {
    const user = mongoEnabled ? await User.findById(id) : memory.users.find((item) => item.id === id);
    return user ? publicUser(user) : null;
  },

  async updateUser(id: string, patch: Partial<PublicUser>) {
    if (mongoEnabled) {
      const user = await User.findByIdAndUpdate(id, patch, { new: true });
      return user ? publicUser(user) : null;
    }
    const user = memory.users.find((item) => item.id === id);
    if (!user) return null;
    Object.assign(user, patch);
    return publicUser(user);
  },

  async addCarbonLog(userId: string, log: AnyLog) {
    const now = new Date();
    const payload = { ...log, userId, month: now.getMonth() + 1, year: now.getFullYear(), createdAt: now };
    if (mongoEnabled) {
      const created = await CarbonLog.create(payload);
      const user = await User.findById(userId);
      if (user && !user.badges.includes("First Step")) {
        user.badges.push("First Step");
        if (!user.carbonGoal) user.carbonGoal = log.totalCO2 > 200 ? Math.round(log.totalCO2 * 0.8) : Math.round(log.totalCO2 * 0.9);
        await user.save();
      }
      return serializeLog(created);
    }
    const created = { id: randomUUID(), ...payload };
    memory.logs.push(created);
    const user = memory.users.find((item) => item.id === userId);
    if (user && !user.badges.includes("First Step")) {
      user.badges.push("First Step");
      user.carbonGoal = log.totalCO2 > 200 ? Math.round(log.totalCO2 * 0.8) : Math.round(log.totalCO2 * 0.9);
    }
    return serializeLog(created);
  },

  async userLogs(userId: string) {
    const logs = mongoEnabled
      ? await CarbonLog.find({ userId }).sort({ createdAt: -1 })
      : memory.logs.filter((log) => log.userId === userId).sort((a, b) => +b.createdAt - +a.createdAt);
    return logs.map(serializeLog);
  },

  async latestLog(userId: string) {
    const logs = await this.userLogs(userId);
    return logs[0] ?? null;
  },

  async userMissions(userId: string) {
    const rows = mongoEnabled ? await UserMission.find({ userId }) : memory.userMissions.filter((mission) => mission.userId === userId);
    return rows.map((row: any) => ({
      id: String(row._id ?? row.id),
      userId: String(row.userId),
      missionId: row.missionId,
      status: row.status,
      completedAt: row.completedAt,
      createdAt: row.createdAt
    }));
  },

  async startMission(userId: string, missionId: string) {
    const mission = missions.find((item) => item.id === missionId);
    if (!mission) throw new Error("Mission not found");
    if (mongoEnabled) {
      const row = await UserMission.findOneAndUpdate(
        { userId, missionId },
        { $setOnInsert: { userId, missionId, status: "started" } },
        { new: true, upsert: true }
      );
      return row;
    }
    let row = memory.userMissions.find((item) => item.userId === userId && item.missionId === missionId);
    if (!row) {
      row = { id: randomUUID(), userId, missionId, status: "started", createdAt: new Date() };
      memory.userMissions.push(row);
    }
    return row;
  },

  async completeMission(userId: string, missionId: string) {
    const mission = missions.find((item) => item.id === missionId);
    if (!mission) throw new Error("Mission not found");

    if (mongoEnabled) {
      const existing = await UserMission.findOne({ userId, missionId });
      if (existing?.status === "completed") return { alreadyCompleted: true, mission };
      await UserMission.findOneAndUpdate(
        { userId, missionId },
        { userId, missionId, status: "completed", completedAt: new Date() },
        { upsert: true }
      );
      const completedCount = await UserMission.countDocuments({ userId, status: "completed" });
      const user = await User.findById(userId);
      if (user) {
        user.ecoPoints += mission.points;
        user.currentStreak += 1;
        user.co2Saved += mission.estimatedSaving;
        user.badges = computeBadges(publicUser(user), completedCount);
        const latest = await CarbonLog.findOne({ userId }).sort({ createdAt: -1 });
        if (latest?.totalCO2 != null && latest.totalCO2 <= user.carbonGoal) user.badges = [...new Set([...user.badges, "Budget Hero"])];
        await user.save();
      }
      return { alreadyCompleted: false, mission };
    }

    let row = memory.userMissions.find((item) => item.userId === userId && item.missionId === missionId);
    if (row?.status === "completed") return { alreadyCompleted: true, mission };
    if (!row) {
      row = { id: randomUUID(), userId, missionId, createdAt: new Date() };
      memory.userMissions.push(row);
    }
    row.status = "completed";
    row.completedAt = new Date();
    const user = memory.users.find((item) => item.id === userId);
    if (user) {
      user.ecoPoints += mission.points;
      user.currentStreak += 1;
      user.co2Saved += mission.estimatedSaving;
      const completedCount = memory.userMissions.filter((item) => item.userId === userId && item.status === "completed").length;
      user.badges = computeBadges(publicUser(user), completedCount);
      const latest = memory.logs.filter((log) => log.userId === userId).sort((a, b) => +b.createdAt - +a.createdAt)[0];
      if (latest && latest.totalCO2 <= user.carbonGoal && !user.badges.includes("Budget Hero")) user.badges.push("Budget Hero");
    }
    return { alreadyCompleted: false, mission };
  },

  async upsertDailyLog(
    userId: string,
    input: DailyInput,
    meta: {
      trackingMode?: TrackingMode;
      moodSelected?: string;
      quickLog?: QuickLogInput;
      calculated?: ReturnType<typeof calculateDailyTotal> | any;
    } = {}
  ) {
    const normalizedDate = startOfDay(input.date);
    const calculated = meta.calculated ?? calculateDailyTotal(input);
    const existingLogs = await this.rawDailyLogs(userId);
    const logsWithoutDate = existingLogs.filter((log) => dateKey(log.date) !== dateKey(normalizedDate));
    const previousXp = logsWithoutDate.reduce((total, log: any) => total + (log.xpEarned ?? 0), 0);
    const basePayload = {
      userId,
      date: normalizedDate,
      quickLog: meta.quickLog,
      detailedLog: {
        transport: calculated.transport,
        electricity: calculated.electricity,
        food: calculated.food,
        shoppingWaste: calculated.shoppingWaste,
        ecoActions: calculated.ecoActions
      },
      ...calculated
    };
    const questPayload = enrichQuestPayload({
      userId,
      date: normalizedDate,
      calculated,
      logsForSummary: [...logsWithoutDate, basePayload],
      previousXp,
      trackingMode: meta.trackingMode,
      moodSelected: meta.moodSelected
    });
    const payload = { ...basePayload, ...questPayload };

    if (mongoEnabled) {
      const previous = await DailyLog.findOne({ userId, date: normalizedDate });
      const saved = await DailyLog.findOneAndUpdate({ userId, date: normalizedDate }, payload, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      });
      await this.recalculateDailyUserStats(userId);
      return { log: serializeDailyLog(saved), updated: Boolean(previous) };
    }

    const existing = memory.dailyLogs.find((log) => log.userId === userId && dateKey(log.date) === dateKey(normalizedDate));
    if (existing) {
      Object.assign(existing, payload, { updatedAt: new Date() });
      await this.recalculateDailyUserStats(userId);
      return { log: serializeDailyLog(existing), updated: true };
    }
    const created = { id: randomUUID(), ...payload, createdAt: new Date(), updatedAt: new Date() };
    memory.dailyLogs.push(created);
    await this.recalculateDailyUserStats(userId);
    return { log: serializeDailyLog(created), updated: false };
  },

  async dailyLogs(userId: string) {
    const logs = mongoEnabled
      ? await DailyLog.find({ userId }).sort({ date: 1 })
      : memory.dailyLogs.filter((log) => log.userId === userId).sort((a, b) => dateKey(a.date).localeCompare(dateKey(b.date)));
    return logs.map(serializeDailyLog);
  },

  async rawDailyLogs(userId: string) {
    return mongoEnabled
      ? await DailyLog.find({ userId }).sort({ date: 1 })
      : memory.dailyLogs.filter((log) => log.userId === userId).sort((a, b) => dateKey(a.date).localeCompare(dateKey(b.date)));
  },

  async dailyLogByDate(userId: string, date: string) {
    const normalizedDate = startOfDay(date);
    const log = mongoEnabled
      ? await DailyLog.findOne({ userId, date: normalizedDate })
      : memory.dailyLogs.find((item) => item.userId === userId && dateKey(item.date) === dateKey(normalizedDate));
    return log ? serializeDailyLog(log) : null;
  },

  async dailyLogsBetween(userId: string, start: Date, end: Date) {
    const logs = mongoEnabled
      ? await DailyLog.find({ userId, date: { $gte: start, $lte: end } }).sort({ date: 1 })
      : memory.dailyLogs.filter((log) => log.userId === userId && startOfDay(log.date) >= start && startOfDay(log.date) <= end);
    return logs.map(serializeDailyLog);
  },

  async allUsers() {
    const users = mongoEnabled ? await User.find({}) : memory.users;
    return users.map(publicUser);
  },

  async allDailyLogs() {
    const logs = mongoEnabled ? await DailyLog.find({}).sort({ date: 1 }) : memory.dailyLogs;
    return logs.map(serializeDailyLog);
  },

  async deleteDailyLog(userId: string, id: string) {
    if (mongoEnabled) {
      const deleted = await DailyLog.findOneAndDelete({ _id: id, userId });
      await this.recalculateDailyUserStats(userId);
      return deleted ? serializeDailyLog(deleted) : null;
    }
    const index = memory.dailyLogs.findIndex((log) => log.id === id && log.userId === userId);
    if (index === -1) return null;
    const [deleted] = memory.dailyLogs.splice(index, 1);
    await this.recalculateDailyUserStats(userId);
    return serializeDailyLog(deleted);
  },

  async dailySummary(userId: string) {
    const logs = await this.rawDailyLogs(userId);
    return buildDailySummary(logs);
  },

  async recalculateDailyUserStats(userId: string) {
    const logs = await this.rawDailyLogs(userId);
    const summary = buildDailySummary(logs);
    const completedMissionCount = mongoEnabled
      ? await UserMission.countDocuments({ userId, status: "completed" })
      : memory.userMissions.filter((mission) => mission.userId === userId && mission.status === "completed").length;
    const dailyPoints = summary.totalPoints;
    const dailySaved = summary.totalCO2Saved;
    const dailyXp = summary.xpEarned;
    const dailyLeafCoins = summary.leafCoinsEarned;

    if (mongoEnabled) {
      const user = await User.findById(userId);
      if (!user) return null;
      const missionRows = await UserMission.find({ userId, status: "completed" });
      const missionPoints = missionRows.reduce((total, row: any) => {
        const mission = missions.find((item) => item.id === row.missionId);
        return total + (mission?.points ?? 0);
      }, 0);
      const missionSaved = missionRows.reduce((total, row: any) => {
        const mission = missions.find((item) => item.id === row.missionId);
        return total + (mission?.estimatedSaving ?? 0);
      }, 0);
      user.ecoPoints = missionPoints + dailyPoints;
      user.xp = Math.max(user.xp ?? 0, dailyXp);
      user.level = levelFromXp(user.xp);
      user.leafCoins = Math.max(user.leafCoins ?? 0, dailyLeafCoins);
      user.co2Saved = Math.max(user.co2Saved ?? 0, Math.round((missionSaved + dailySaved) * 10) / 10);
      user.totalCO2Saved = Math.max(user.totalCO2Saved ?? 0, dailySaved);
      user.currentStreak = summary.currentStreak;
      user.longestStreak = summary.longestStreak;
      user.totalLoggedDays = summary.totalLoggedDays;
      user.lastLogDate = summary.latestDailyLog?.date ? startOfDay(summary.latestDailyLog.date) : undefined;
      user.streakFreezeCount = Math.floor(summary.totalLoggedDays / 5);
      user.badges = computeBadges(publicUser(user), completedMissionCount);
      if (summary.totalLoggedDays > 0 && !user.badges.includes("First Step")) user.badges.push("First Step");
      await user.save();
      return publicUser(user);
    }

    const user = memory.users.find((item) => item.id === userId);
    if (!user) return null;
    const completedMissions = memory.userMissions.filter((mission) => mission.userId === userId && mission.status === "completed");
    const missionPoints = completedMissions.reduce((total, row) => total + (missions.find((mission) => mission.id === row.missionId)?.points ?? 0), 0);
    const missionSaved = completedMissions.reduce((total, row) => total + (missions.find((mission) => mission.id === row.missionId)?.estimatedSaving ?? 0), 0);
      user.ecoPoints = missionPoints + dailyPoints;
    user.xp = Math.max(user.xp ?? 0, dailyXp);
    user.level = levelFromXp(user.xp);
    user.leafCoins = Math.max(user.leafCoins ?? 0, dailyLeafCoins);
    user.co2Saved = Math.max(user.co2Saved ?? 0, Math.round((missionSaved + dailySaved) * 10) / 10);
    user.totalCO2Saved = Math.max(user.totalCO2Saved ?? 0, dailySaved);
    user.currentStreak = summary.currentStreak;
    user.longestStreak = summary.longestStreak;
    user.totalLoggedDays = summary.totalLoggedDays;
    user.lastLogDate = summary.latestDailyLog?.date ? startOfDay(summary.latestDailyLog.date) : undefined;
    user.streakFreezeCount = Math.floor(summary.totalLoggedDays / 5);
    user.badges = computeBadges(publicUser(user), completedMissionCount);
    if (summary.totalLoggedDays > 0 && !user.badges.includes("First Step")) user.badges.push("First Step");
    return publicUser(user);
  },

  async leaderboard(filter: Partial<Pick<PublicUser, "city" | "collegeName" | "department">> = {}) {
    const activeFilter = Object.fromEntries(Object.entries(filter).filter(([, value]) => value));
    const matches = (user: any) => Object.entries(activeFilter).every(([key, value]) => user[key] === value);
    const users = mongoEnabled
      ? await User.find(activeFilter).sort({ level: -1, ecoPoints: -1 }).limit(20)
      : [...memory.users].filter(matches).sort((a, b) => b.level - a.level || b.ecoPoints - a.ecoPoints).slice(0, 20);
    const allUsers = users.map(publicUser);
    const missionRows = mongoEnabled ? await UserMission.find({ status: "completed" }) : memory.userMissions.filter((item) => item.status === "completed");
    const totalSaved = allUsers.reduce((sum, user) => sum + user.co2Saved, 0);
    return {
      users: allUsers,
      impact: {
        totalUsers: allUsers.length,
        totalCO2Saved: Math.round(totalSaved * 10) / 10,
        totalMissionsCompleted: missionRows.length,
        equivalentTrees: Math.round(totalSaved / 21),
        groupLabel: activeFilter.department ?? activeFilter.collegeName ?? activeFilter.city ?? "Global",
        groupImpact: `${activeFilter.department ?? activeFilter.collegeName ?? activeFilter.city ?? "Community"} saved ${Math.round(totalSaved * 10) / 10} kg CO2 this month.`
      }
    };
  }
};
