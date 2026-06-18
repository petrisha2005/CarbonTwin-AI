import express from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { buildCoachAnalysis } from "../services/coachAnalysisService.js";
import { coachPlanStore } from "../services/coachPlanStore.js";
import { buildFallbackCoachRecommendations } from "../services/fallbackCoachService.js";
import { generateGeminiCoachRecommendations } from "../services/geminiCoachService.js";
import type { CoachPreferences, CoachRecommendation } from "../services/coachTypes.js";

export const coachRouter = express.Router();
coachRouter.use(requireAuth);

const preferenceSchema = z.object({
  mood: z.enum(["busy", "tired", "lazy", "broke", "motivated", "travelling", "college_day", "at_home"]).optional(),
  goal: z.string().max(180).optional(),
  goalKey: z.string().max(80).optional(),
  difficultyPreference: z.enum(["easy", "medium", "challenge"]).optional(),
  budgetPreference: z.enum(["free_only", "low_cost", "any"]).optional()
});

const savePlanSchema = preferenceSchema.extend({
  recommendations: z.any()
});

async function createRecommendations(userId: string, preferences: CoachPreferences) {
  const analysis = await buildCoachAnalysis(userId);
  if (!analysis.hasLogs) {
    return {
      needsData: true,
      message: "Your AI Coach needs a little data first",
      detail: "Complete at least one Eco Quest log so recommendations can be based on your real lifestyle data.",
      basedOnData: false
    };
  }

  try {
    const recommendations = await generateGeminiCoachRecommendations(analysis, preferences);
    return { recommendations, analysis: { ...analysis, last7Days: undefined, currentMonthLogs: undefined } };
  } catch (error) {
    console.warn("AI Eco Coach using fallback recommendations.", error);
    const recommendations = buildFallbackCoachRecommendations(analysis, preferences);
    return { recommendations, analysis: { ...analysis, last7Days: undefined, currentMonthLogs: undefined } };
  }
}

coachRouter.post("/recommendations", async (req: AuthedRequest, res, next) => {
  try {
    const preferences = preferenceSchema.parse(req.body ?? {});
    const result = await createRecommendations(req.user!.id, preferences);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

coachRouter.post("/save-plan", async (req: AuthedRequest, res, next) => {
  try {
    const body = savePlanSchema.parse(req.body ?? {});
    const saved = await coachPlanStore.save(req.user!.id, body, body.recommendations as CoachRecommendation);
    res.status(201).json({ plan: saved });
  } catch (error) {
    next(error);
  }
});

coachRouter.get("/latest-plan", async (req: AuthedRequest, res, next) => {
  try {
    const plan = await coachPlanStore.latest(req.user!.id);
    res.json({ plan });
  } catch (error) {
    next(error);
  }
});

coachRouter.get("/history", async (req: AuthedRequest, res, next) => {
  try {
    const plans = await coachPlanStore.history(req.user!.id);
    res.json({ plans });
  } catch (error) {
    next(error);
  }
});

coachRouter.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const result = await createRecommendations(req.user!.id, {});
    if ("recommendations" in result) res.json({ plan: result.recommendations });
    else res.json(result);
  } catch (error) {
    next(error);
  }
});
