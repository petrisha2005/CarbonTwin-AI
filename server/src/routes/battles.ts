import express from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { battleService } from "../services/battleService.js";

export const battlesRouter = express.Router();
battlesRouter.use(requireAuth);

const createSchema = z.object({
  title: z.string().min(1, "Battle title is required."),
  description: z.string().optional(),
  battleType: z.enum(["one_v_one", "group", "campus"]),
  goalType: z.enum(["most_co2_saved", "most_eco_quests", "most_missions_completed", "highest_eco_score"]),
  duration: z.enum(["1_day", "3_days", "7_days", "custom"]).optional(),
  durationDays: z.coerce.number().min(1).max(30).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxParticipants: z.coerce.number().min(2).optional(),
  collegeName: z.string().optional(),
  department: z.string().optional()
});

battlesRouter.post("/create", async (req: AuthedRequest, res) => {
  try {
    res.status(201).json(await battleService.create(req.user!.id, createSchema.parse(req.body ?? {})));
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? "Could not create battle." });
  }
});

battlesRouter.post("/join", async (req: AuthedRequest, res) => {
  try {
    const { battleCode } = z.object({ battleCode: z.string().min(1, "Battle code is required.") }).parse(req.body ?? {});
    res.json(await battleService.join(req.user!.id, battleCode));
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? "Could not join battle." });
  }
});

battlesRouter.get("/my", async (req: AuthedRequest, res) => {
  try {
    res.json(await battleService.my(req.user!.id));
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? "Could not load battles." });
  }
});

battlesRouter.get("/code/:battleCode", async (req: AuthedRequest, res) => {
  try {
    res.json({ battle: await battleService.get(String(req.params.battleCode), req.user!.id) });
  } catch (error: any) {
    res.status(404).json({ message: error.message ?? "Battle not found." });
  }
});

battlesRouter.get("/:battleId/leaderboard", async (req: AuthedRequest, res) => {
  try {
    res.json(await battleService.leaderboard(String(req.params.battleId), req.user!.id));
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? "Could not load leaderboard." });
  }
});

battlesRouter.get("/:battleId/activity", async (req: AuthedRequest, res) => {
  try {
    res.json(await battleService.activity(String(req.params.battleId), req.user!.id));
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? "Could not load activity." });
  }
});

battlesRouter.post("/:battleId/leave", async (req: AuthedRequest, res) => {
  try {
    res.json(await battleService.leave(req.user!.id, String(req.params.battleId)));
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? "Could not leave battle." });
  }
});

battlesRouter.post("/:battleId/cancel", async (req: AuthedRequest, res) => {
  try {
    res.json(await battleService.cancel(req.user!.id, String(req.params.battleId)));
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? "Could not cancel battle." });
  }
});

battlesRouter.post("/:battleId/finalize", async (req: AuthedRequest, res) => {
  try {
    res.json(await battleService.finalize(String(req.params.battleId), req.user!.id));
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? "Could not finalize battle." });
  }
});

battlesRouter.get("/:battleId", async (req: AuthedRequest, res) => {
  try {
    res.json({ battle: await battleService.get(String(req.params.battleId), req.user!.id) });
  } catch (error: any) {
    res.status(404).json({ message: error.message ?? "Battle not found." });
  }
});
