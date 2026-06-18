import express from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { worldService } from "../services/worldService.js";

export const worldRouter = express.Router();
worldRouter.use(requireAuth);

worldRouter.get("/", async (req: AuthedRequest, res, next) => {
  try {
    res.json(await worldService.get(req.user!.id));
  } catch (error) {
    next(error);
  }
});
