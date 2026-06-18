import express from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { leaderboardService } from "../services/leaderboardService.js";

export const leaderboardRouter = express.Router();
leaderboardRouter.use(requireAuth);

for (const type of ["global", "city", "college", "department", "weekly", "monthly"] as const) {
  leaderboardRouter.get(`/${type}`, async (req: AuthedRequest, res, next) => {
    try {
      res.json(await leaderboardService.get(type, req.user!.id, req.query.limit));
    } catch (error) {
      next(error);
    }
  });
}

leaderboardRouter.get("/me", async (req: AuthedRequest, res, next) => {
  try {
    res.json(await leaderboardService.me(req.user!.id));
  } catch (error) {
    next(error);
  }
});

leaderboardRouter.get("/community-impact", async (req: AuthedRequest, res, next) => {
  try {
    res.json(await leaderboardService.communityImpact(req.user!.id));
  } catch (error) {
    next(error);
  }
});

leaderboardRouter.get("/", async (req: AuthedRequest, res, next) => {
  try {
    res.json(await leaderboardService.get("global", req.user!.id, req.query.limit));
  } catch (error) {
    next(error);
  }
});
