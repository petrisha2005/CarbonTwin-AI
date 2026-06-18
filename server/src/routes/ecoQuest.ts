import express from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { store } from "../services/store.js";
import { missionService } from "../services/missionService.js";
import { onboardingService } from "../services/onboardingService.js";
import { bossService } from "../services/bossService.js";
import { battleProgressService } from "../services/battleProgressService.js";
import { calculateQuickTotal, dailyEcoActions } from "../utils/dailyCarbonCalculator.js";
import { avatarMoodMessage, moodSuggestion, quickLogToDetailed } from "../utils/gamification.js";

export const ecoQuestRouter = express.Router();
ecoQuestRouter.use(requireAuth);

const todayKey = () => new Date().toISOString().slice(0, 10);
const yesterdayKey = () => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
};

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => new Date(`${value}T00:00:00.000Z`) <= new Date(`${todayKey()}T00:00:00.000Z`), "Date cannot be in the future");

const detailedSchema = z.object({
  date: dateSchema.default(todayKey()),
  moodSelected: z.string().optional(),
  transport: z.object({
    mode: z.enum(["walking", "bicycle", "bus", "metro", "train", "two_wheeler_petrol", "car_petrol", "car_diesel", "ev"]),
    distanceKm: z.coerce.number().min(0),
    numberOfTrips: z.coerce.number().min(0)
  }),
  electricity: z.object({
    electricityKwhToday: z.coerce.number().min(0),
    acHours: z.coerce.number().min(0).max(24),
    fanHours: z.coerce.number().min(0).max(24)
  }),
  food: z.object({
    dietToday: z.enum(["vegan", "vegetarian", "mixed", "non_vegetarian"]),
    foodDeliveryToday: z.boolean(),
    packagedFoodToday: z.boolean()
  }),
  shoppingWaste: z.object({
    onlineOrderToday: z.boolean(),
    clothingPurchaseToday: z.boolean(),
    plasticUsage: z.enum(["low", "medium", "high"]),
    recycledToday: z.boolean()
  }),
  ecoActionIds: z.array(z.string()).default([])
});

const quickSchema = z.object({
  date: dateSchema.default(todayKey()),
  moodSelected: z.string().optional(),
  travelLevel: z.enum(["no_travel", "low", "medium", "high"]),
  energyLevel: z.enum(["low", "medium", "high"]),
  foodChoice: z.enum(["vegan", "vegetarian", "mixed", "non_vegetarian"]),
  shoppingToday: z.enum(["none", "small", "high"]),
  ecoActionDone: z.boolean()
});

function responseFor(log: any, user: any, summary: any) {
  return {
    log,
    user,
    summary,
    rewards: {
      xpEarned: log.xpEarned,
      leafCoinsEarned: log.leafCoinsEarned,
      levelAfterLog: log.levelAfterLog,
      treeStage: log.treeStage,
      message: `Eco Quest Complete! You earned +${log.xpEarned} XP and +${log.leafCoinsEarned} LeafCoins.`
    },
    avatar: {
      mood: log.avatarMood,
      message: avatarMoodMessage(log.avatarMood)
    }
  };
}

function inputFromSerializedLog(log: any) {
  return {
    date: log.date,
    transport: {
      mode: log.transport.mode === "quick" ? "walking" : log.transport.mode,
      distanceKm: log.transport.distanceKm ?? 0,
      numberOfTrips: log.transport.numberOfTrips ?? 0
    },
    electricity: {
      electricityKwhToday: log.electricity.electricityKwhToday ?? 0,
      acHours: log.electricity.acHours ?? 0,
      fanHours: log.electricity.fanHours ?? 0
    },
    food: {
      dietToday: log.food.dietToday,
      foodDeliveryToday: log.food.foodDeliveryToday ?? false,
      packagedFoodToday: log.food.packagedFoodToday ?? false
    },
    shoppingWaste: {
      onlineOrderToday: log.shoppingWaste.onlineOrderToday ?? false,
      clothingPurchaseToday: log.shoppingWaste.clothingPurchaseToday ?? false,
      plasticUsage: log.shoppingWaste.plasticUsage ?? "low",
      recycledToday: log.shoppingWaste.recycledToday ?? false
    },
    ecoActionIds: (log.ecoActions ?? []).map((action: any) => action.actionId).filter((id: string) => id !== "quick-eco-action")
  };
}

ecoQuestRouter.post("/save", async (req: AuthedRequest, res) => {
  try {
    const trackingMode = z.enum(["quick", "detailed", "same_as_yesterday"]).parse(req.body.trackingMode);
    const moodSelected = z.string().optional().parse(req.body.moodSelected);
    if (trackingMode === "quick") {
      const quickLog = quickSchema.parse(req.body.quickLog ?? req.body);
      const calculated = calculateQuickTotal(quickLog);
      const detailed = quickLogToDetailed(quickLog);
      const result = await store.upsertDailyLog(req.user!.id, detailed, { trackingMode, moodSelected, quickLog, calculated });
      await missionService.handleEcoQuest(req.user!.id, result.log);
      if (!result.updated) await onboardingService.patch(req.user!.id, { hasCompletedFirstEcoQuest: true });
      if (!result.updated) await battleProgressService.updateActiveBattlesForUser(req.user!.id, "eco_quest", { sourceId: result.log.id, co2Saved: result.log.co2Saved, netCO2: result.log.netCO2, date: result.log.date });
      if (!result.updated) await bossService.applyAction(req.user!.id, { source: "eco_quest", sourceId: result.log.id, title: "Completed Eco Quest", damage: 10 });
      const summary = await store.dailySummary(req.user!.id);
      const user = await store.findUser(req.user!.id);
      return res.status(result.updated ? 200 : 201).json({ ...responseFor(result.log, user, summary), updated: result.updated });
    }

    const input = detailedSchema.parse({ ...(req.body.detailedLog ?? req.body), moodSelected: undefined });
    const result = await store.upsertDailyLog(req.user!.id, input, { trackingMode, moodSelected });
    await missionService.handleEcoQuest(req.user!.id, result.log);
    if (!result.updated) await onboardingService.patch(req.user!.id, { hasCompletedFirstEcoQuest: true });
    if (!result.updated) await battleProgressService.updateActiveBattlesForUser(req.user!.id, "eco_quest", { sourceId: result.log.id, co2Saved: result.log.co2Saved, netCO2: result.log.netCO2, date: result.log.date });
    if (!result.updated) await bossService.applyAction(req.user!.id, { source: "eco_quest", sourceId: result.log.id, title: "Completed Eco Quest", damage: 10 });
    const summary = await store.dailySummary(req.user!.id);
    const user = await store.findUser(req.user!.id);
    return res.status(result.updated ? 200 : 201).json({ ...responseFor(result.log, user, summary), updated: result.updated });
  } catch {
    return res.status(400).json({ message: "Eco Quest save failed" });
  }
});

ecoQuestRouter.post("/quick-log", async (req: AuthedRequest, res) => {
  try {
    const input = quickSchema.parse(req.body);
    const detailed = quickLogToDetailed(input);
    const result = await store.upsertDailyLog(req.user!.id, detailed, { trackingMode: "quick", moodSelected: input.moodSelected, quickLog: input, calculated: calculateQuickTotal(input) });
    await missionService.handleEcoQuest(req.user!.id, result.log);
    if (!result.updated) await onboardingService.patch(req.user!.id, { hasCompletedFirstEcoQuest: true });
    if (!result.updated) await battleProgressService.updateActiveBattlesForUser(req.user!.id, "eco_quest", { sourceId: result.log.id, co2Saved: result.log.co2Saved, netCO2: result.log.netCO2, date: result.log.date });
    if (!result.updated) await bossService.applyAction(req.user!.id, { source: "eco_quest", sourceId: result.log.id, title: "Completed Eco Quest", damage: 10 });
    const summary = await store.dailySummary(req.user!.id);
    const user = await store.findUser(req.user!.id);
    res.status(result.updated ? 200 : 201).json({ ...responseFor(result.log, user, summary), updated: result.updated });
  } catch {
    res.status(400).json({ message: "Quick log failed" });
  }
});

ecoQuestRouter.post("/detailed-log", async (req: AuthedRequest, res) => {
  try {
    const input = detailedSchema.parse(req.body);
    const { moodSelected, ...dailyInput } = input;
    const result = await store.upsertDailyLog(req.user!.id, dailyInput, { trackingMode: "detailed", moodSelected });
    await missionService.handleEcoQuest(req.user!.id, result.log);
    if (!result.updated) await onboardingService.patch(req.user!.id, { hasCompletedFirstEcoQuest: true });
    if (!result.updated) await battleProgressService.updateActiveBattlesForUser(req.user!.id, "eco_quest", { sourceId: result.log.id, co2Saved: result.log.co2Saved, netCO2: result.log.netCO2, date: result.log.date });
    if (!result.updated) await bossService.applyAction(req.user!.id, { source: "eco_quest", sourceId: result.log.id, title: "Completed Eco Quest", damage: 10 });
    const summary = await store.dailySummary(req.user!.id);
    const user = await store.findUser(req.user!.id);
    res.status(result.updated ? 200 : 201).json({ ...responseFor(result.log, user, summary), updated: result.updated });
  } catch {
    res.status(400).json({ message: "Detailed log failed" });
  }
});

ecoQuestRouter.post("/same-as-yesterday", async (req: AuthedRequest, res) => {
  const yesterday = await store.dailyLogByDate(req.user!.id, yesterdayKey());
  if (!yesterday) return res.status(404).json({ message: "No quest found for yesterday." });
  const detailed = {
    date: todayKey(),
    transport: yesterday.transport,
    electricity: yesterday.electricity,
    food: yesterday.food,
    shoppingWaste: yesterday.shoppingWaste,
    ecoActionIds: yesterday.ecoActions.map((action: any) => action.actionId)
  };
  const result = await store.upsertDailyLog(req.user!.id, detailed, { trackingMode: "same_as_yesterday", moodSelected: req.body?.moodSelected });
  await missionService.handleEcoQuest(req.user!.id, result.log);
  if (!result.updated) await onboardingService.patch(req.user!.id, { hasCompletedFirstEcoQuest: true });
  if (!result.updated) await battleProgressService.updateActiveBattlesForUser(req.user!.id, "eco_quest", { sourceId: result.log.id, co2Saved: result.log.co2Saved, netCO2: result.log.netCO2, date: result.log.date });
  if (!result.updated) await bossService.applyAction(req.user!.id, { source: "eco_quest", sourceId: result.log.id, title: "Completed Eco Quest", damage: 10 });
  const summary = await store.dailySummary(req.user!.id);
  const user = await store.findUser(req.user!.id);
  res.status(result.updated ? 200 : 201).json({ ...responseFor(result.log, user, summary), updated: result.updated });
});

ecoQuestRouter.get("/date/:date", async (req: AuthedRequest, res) => {
  const date = String(req.params.date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ message: "Date must use YYYY-MM-DD format" });
  res.json({ log: await store.dailyLogByDate(req.user!.id, date) });
});

ecoQuestRouter.get("/yesterday", async (req: AuthedRequest, res) => {
  const log = await store.dailyLogByDate(req.user!.id, yesterdayKey());
  if (!log) return res.status(404).json({ message: "No log found for yesterday. Try Quick Log instead." });
  res.json({ log, form: inputFromSerializedLog(log) });
});

ecoQuestRouter.get("/history", async (req: AuthedRequest, res) => {
  res.json({ logs: (await store.dailyLogs(req.user!.id)).sort((a: any, b: any) => b.date.localeCompare(a.date)) });
});

ecoQuestRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const deleted = await store.deleteDailyLog(req.user!.id, String(req.params.id));
  if (!deleted) return res.status(404).json({ message: "Eco Quest log not found" });
  const summary = await store.dailySummary(req.user!.id);
  const user = await store.findUser(req.user!.id);
  res.json({ deleted, summary, user });
});

ecoQuestRouter.get("/today", async (req: AuthedRequest, res) => {
  const log = await store.dailyLogByDate(req.user!.id, todayKey());
  const summary = await store.dailySummary(req.user!.id);
  res.json({
    log,
    summary,
    actions: dailyEcoActions,
    avatar: {
      mood: log?.avatarMood ?? "tired",
      message: log ? avatarMoodMessage(log.avatarMood) : avatarMoodMessage("tired")
    }
  });
});

ecoQuestRouter.get("/rewards", async (req: AuthedRequest, res) => {
  const user = await store.findUser(req.user!.id);
  const summary = await store.dailySummary(req.user!.id);
  res.json({
    user,
    summary,
    nextStreakFreezeIn: Math.max(0, 5 - ((summary.totalLoggedDays ?? 0) % 5)),
    suggestion: moodSuggestion(String(req.query.mood ?? ""))
  });
});
