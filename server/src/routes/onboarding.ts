import express from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { onboardingService } from "../services/onboardingService.js";

export const onboardingRouter = express.Router();
onboardingRouter.use(requireAuth);

function payload(data: any) {
  return { success: true, data };
}

onboardingRouter.get("/status", async (req: AuthedRequest, res, next) => {
  try {
    res.json(payload(await onboardingService.status(req.user!.id)));
  } catch (error) {
    next(error);
  }
});

onboardingRouter.post("/complete-welcome", async (req: AuthedRequest, res, next) => {
  try {
    res.json(payload(await onboardingService.patch(req.user!.id, { hasSeenWelcome: true, skipped: false })));
  } catch (error) {
    next(error);
  }
});

onboardingRouter.post("/complete-profile", async (req: AuthedRequest, res, next) => {
  try {
    res.json(payload(await onboardingService.patch(req.user!.id, { hasCompletedProfileSetup: true })));
  } catch (error) {
    next(error);
  }
});

onboardingRouter.post("/complete-goal", async (req: AuthedRequest, res, next) => {
  try {
    res.json(payload(await onboardingService.patch(req.user!.id, { hasSelectedGoal: true })));
  } catch (error) {
    next(error);
  }
});

onboardingRouter.post("/complete-baseline-calculator", async (req: AuthedRequest, res, next) => {
  try {
    res.json(payload(await onboardingService.patch(req.user!.id, { hasCompletedBaselineCalculator: true })));
  } catch (error) {
    next(error);
  }
});

onboardingRouter.post("/complete-budget", async (req: AuthedRequest, res, next) => {
  try {
    res.json(payload(await onboardingService.patch(req.user!.id, { hasSetBudget: true })));
  } catch (error) {
    next(error);
  }
});

onboardingRouter.post("/complete-first-quest", async (req: AuthedRequest, res, next) => {
  try {
    res.json(payload(await onboardingService.patch(req.user!.id, { hasCompletedFirstEcoQuest: true })));
  } catch (error) {
    next(error);
  }
});

onboardingRouter.post("/skip", async (req: AuthedRequest, res, next) => {
  try {
    res.json(payload(await onboardingService.patch(req.user!.id, { hasSeenWelcome: true, skipped: true })));
  } catch (error) {
    next(error);
  }
});
