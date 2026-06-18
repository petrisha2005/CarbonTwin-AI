import express from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { badgeService } from "../services/badgeService.js";
import { store } from "../services/store.js";

export const badgesRouter = express.Router();
badgesRouter.use(requireAuth);

badgesRouter.get("/", async (req: AuthedRequest, res, next) => {
  try {
    res.json({ badges: await badgeService.all(req.user!.id) });
  } catch (error) {
    next(error);
  }
});

badgesRouter.get("/my", async (req: AuthedRequest, res, next) => {
  try {
    res.json({ badges: await badgeService.my(req.user!.id) });
  } catch (error) {
    next(error);
  }
});

badgesRouter.post("/check-unlocks", async (req: AuthedRequest, res, next) => {
  try {
    const newlyUnlocked = await badgeService.checkUnlocks(req.user!.id);
    res.json({ newlyUnlocked, user: await store.findUser(req.user!.id) });
  } catch (error) {
    next(error);
  }
});
