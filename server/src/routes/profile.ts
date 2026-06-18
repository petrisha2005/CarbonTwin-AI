import express from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { missionService } from "../services/missionService.js";
import { store } from "../services/store.js";

export const profileRouter = express.Router();
profileRouter.use(requireAuth);

const profileSchema = z.object({
  city: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().max(400).optional(),
  displayName: z.string().max(80).optional(),
  avatarColor: z.string().max(30).optional(),
  collegeName: z.string().optional(),
  department: z.string().optional(),
  batch: z.string().optional(),
  climateGoal: z.string().max(120).optional(),
  goals: z.record(z.any()).optional(),
  preferences: z.record(z.any()).optional(),
  privacy: z.record(z.any()).optional()
});

function profilePayload(user: any) {
  return { success: true, user, data: { user } };
}

profileRouter.get("/", async (req: AuthedRequest, res) => {
  res.json(profilePayload(await store.findUser(req.user!.id)));
});

profileRouter.patch("/", async (req: AuthedRequest, res, next) => {
  try {
    const input = profileSchema.parse(req.body);
    const user = await store.updateUser(req.user!.id, input);
    if (user) await missionService.handleProfileUpdate(req.user!.id, user);
    res.json(profilePayload(await store.findUser(req.user!.id)));
  } catch (error) {
    next(error);
  }
});
