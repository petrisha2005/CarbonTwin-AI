import express from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { shopService } from "../services/shopService.js";

export const shopRouter = express.Router();
shopRouter.use(requireAuth);

shopRouter.get("/items", async (req: AuthedRequest, res, next) => {
  try {
    res.json(await shopService.items(req.user!.id));
  } catch (error) {
    next(error);
  }
});

shopRouter.get("/inventory", async (req: AuthedRequest, res, next) => {
  try {
    res.json(await shopService.inventory(req.user!.id));
  } catch (error) {
    next(error);
  }
});

shopRouter.get("/equipped", async (req: AuthedRequest, res, next) => {
  try {
    res.json(await shopService.equipped(req.user!.id));
  } catch (error) {
    next(error);
  }
});

shopRouter.post("/purchase/:itemId", async (req: AuthedRequest, res, next) => {
  try {
    res.json(await shopService.purchase(req.user!.id, String(req.params.itemId)));
  } catch {
    res.status(400).json({ message: "Could not purchase item" });
  }
});

shopRouter.post("/equip/:itemId", async (req: AuthedRequest, res, next) => {
  try {
    res.json(await shopService.equip(req.user!.id, String(req.params.itemId)));
  } catch {
    res.status(400).json({ message: "Could not equip item" });
  }
});

shopRouter.post("/unequip/:itemId", async (req: AuthedRequest, res, next) => {
  try {
    res.json(await shopService.unequip(req.user!.id, String(req.params.itemId)));
  } catch {
    res.status(400).json({ message: "Could not unequip item" });
  }
});
