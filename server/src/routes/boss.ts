import express from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { bossService } from "../services/bossService.js";

export const bossRouter = express.Router();
bossRouter.use(requireAuth);

bossRouter.get("/current", async (req: AuthedRequest, res, next) => {
  try {
    res.json({ boss: await bossService.current(req.user!.id) });
  } catch (error) {
    next(error);
  }
});

bossRouter.post("/apply-action", async (req: AuthedRequest, res, next) => {
  try {
    const parsed = z.object({ source: z.string(), title: z.string(), damage: z.coerce.number().min(0).max(100) }).safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ message: "Invalid boss action" });
    const input = parsed.data;
    res.json({ boss: await bossService.applyAction(req.user!.id, input) });
  } catch (error) {
    next(error);
  }
});

bossRouter.post("/claim-reward", async (req: AuthedRequest, res, next) => {
  try {
    res.json(await bossService.claimReward(req.user!.id));
  } catch (error) {
    next(error);
  }
});
