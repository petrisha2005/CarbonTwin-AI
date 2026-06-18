import express from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { getTwinProfile } from "../services/twinService.js";

export const twinRouter = express.Router();
twinRouter.use(requireAuth);

twinRouter.get("/profile", async (req: AuthedRequest, res) => {
  res.json(await getTwinProfile(req.user!.id));
});
