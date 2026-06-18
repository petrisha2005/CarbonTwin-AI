import express from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { store } from "../services/store.js";
import { carbonEquivalents } from "../utils/gamification.js";

export const carbonWrappedRouter = express.Router();
carbonWrappedRouter.use(requireAuth);

async function weeklyWrapped(req: AuthedRequest, res: express.Response) {
  const summary = await store.dailySummary(req.user!.id);
  const logs = await store.dailyLogs(req.user!.id);
  const weekKeys = new Set(summary.weeklyTrend.map((item: any) => item.date));
  const weekLogs = logs.filter((log: any) => weekKeys.has(log.date));
  const best = [...weekLogs].sort((a: any, b: any) => a.netCO2 - b.netCO2)[0] ?? null;
  const highestCategory = [...summary.categoryBreakdown].sort((a: any, b: any) => b.value - a.value)[0]?.name ?? "Balanced";
  const user = await store.findUser(req.user!.id);
  res.json({
    totalCO2ThisWeek: summary.weeklyCO2,
    totalCO2SavedThisWeek: summary.weeklyTrend.reduce((total: number, item: any) => total + item.saved, 0),
    bestLowCarbonDay: best?.date ?? null,
    highestImpactCategory: highestCategory,
    missionsCompleted: weekLogs.length,
    xpEarned: weekLogs.reduce((total: number, log: any) => total + log.xpEarned, 0),
    leafCoinsEarned: weekLogs.reduce((total: number, log: any) => total + log.leafCoinsEarned, 0),
    streakProgress: user?.currentStreak ?? 0,
    personalityEvolution: highestCategory === "Balanced" ? "Eco Balancer" : `${highestCategory} Improver`,
    beatCommunityPercent: Math.min(95, 50 + (user?.level ?? 1) * 3),
    equivalents: carbonEquivalents(summary.weeklyTrend.reduce((total: number, item: any) => total + item.saved, 0))
  });
}

carbonWrappedRouter.get("/week", weeklyWrapped);
carbonWrappedRouter.get("/weekly", weeklyWrapped);
