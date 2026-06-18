import express from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { getDashboardSummary } from "../services/dashboardService.js";

export const dashboardRouter = express.Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get("/summary", async (req: AuthedRequest, res) => {
  res.json(await getDashboardSummary(req.user!.id));
});
