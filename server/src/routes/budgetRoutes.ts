import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { budgetController } from "../controllers/budgetController.js";

export const budgetRoutes = express.Router();
budgetRoutes.use(requireAuth);

budgetRoutes.get("/current", async (req, res, next) => {
  try {
    await budgetController.current(req, res);
  } catch (error) {
    next(error);
  }
});

budgetRoutes.post("/save", async (req, res) => {
  try {
    await budgetController.save(req, res);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? "Could not save budget." });
  }
});

budgetRoutes.put("/category-split", async (req, res) => {
  try {
    await budgetController.categorySplit(req, res);
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? "Could not save category split." });
  }
});

budgetRoutes.get("/summary", async (req, res, next) => {
  try {
    await budgetController.summary(req, res);
  } catch (error) {
    next(error);
  }
});
