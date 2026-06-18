import express from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { store } from "../services/store.js";
import { dailyEcoActions } from "../utils/dailyCarbonCalculator.js";

export const dailyLogsRouter = express.Router();
dailyLogsRouter.use(requireAuth);

const todayKey = () => new Date().toISOString().slice(0, 10);
const normalizeDate = (value: string) => new Date(`${value}T00:00:00.000Z`);

const dailyLogSchema = z.object({
  date: z
    .string({ required_error: "Date is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format")
    .refine((value) => normalizeDate(value) <= normalizeDate(todayKey()), "Date cannot be in the future"),
  transport: z.object({
    mode: z.enum(["walking", "bicycle", "bus", "metro", "train", "two_wheeler_petrol", "car_petrol", "car_diesel", "ev"]),
    distanceKm: z.coerce.number().min(0, "Distance cannot be negative"),
    numberOfTrips: z.coerce.number().min(0, "Number of trips cannot be negative")
  }),
  electricity: z.object({
    electricityKwhToday: z.coerce.number().min(0, "Electricity usage cannot be negative"),
    acHours: z.coerce.number().min(0, "AC hours cannot be negative").max(24, "AC hours cannot be greater than 24"),
    fanHours: z.coerce.number().min(0, "Fan hours cannot be negative").max(24, "Fan hours cannot be greater than 24")
  }),
  food: z.object({
    dietToday: z.enum(["vegan", "vegetarian", "mixed", "non_vegetarian"]),
    foodDeliveryToday: z.boolean(),
    packagedFoodToday: z.boolean()
  }),
  shoppingWaste: z.object({
    onlineOrderToday: z.boolean(),
    clothingPurchaseToday: z.boolean(),
    plasticUsage: z.enum(["low", "medium", "high"]),
    recycledToday: z.boolean()
  }),
  ecoActionIds: z.array(z.string()).default([])
});

function validationMessage(error: unknown) {
  if (error instanceof z.ZodError) return error.errors.map((item) => item.message).join(". ");
  if (error instanceof Error) return error.message;
  return "Daily log request failed";
}

dailyLogsRouter.get("/actions", (_req, res) => {
  res.json({ actions: dailyEcoActions });
});

dailyLogsRouter.post("/", async (req: AuthedRequest, res) => {
  try {
    const input = dailyLogSchema.parse(req.body);
    const result = await store.upsertDailyLog(req.user!.id, input);
    const summary = await store.dailySummary(req.user!.id);
    const user = await store.findUser(req.user!.id);
    res.status(result.updated ? 200 : 201).json({ ...result, summary, user });
  } catch (error) {
    res.status(400).json({ message: validationMessage(error) });
  }
});

dailyLogsRouter.get("/today", async (req: AuthedRequest, res) => {
  res.json({ log: await store.dailyLogByDate(req.user!.id, todayKey()) });
});

dailyLogsRouter.get("/date/:date", async (req: AuthedRequest, res) => {
  const date = String(req.params.date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ message: "Date must use YYYY-MM-DD format" });
  res.json({ log: await store.dailyLogByDate(req.user!.id, date) });
});

dailyLogsRouter.get("/week", async (req: AuthedRequest, res) => {
  const today = normalizeDate(todayKey());
  const weekday = today.getUTCDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const start = new Date(today);
  start.setUTCDate(today.getUTCDate() + mondayOffset);
  res.json({ logs: await store.dailyLogsBetween(req.user!.id, start, today) });
});

dailyLogsRouter.get("/month", async (req: AuthedRequest, res) => {
  const today = normalizeDate(todayKey());
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  res.json({ logs: await store.dailyLogsBetween(req.user!.id, start, today) });
});

dailyLogsRouter.get("/history", async (req: AuthedRequest, res) => {
  res.json({ logs: await store.dailyLogs(req.user!.id) });
});

dailyLogsRouter.get("/summary", async (req: AuthedRequest, res) => {
  const summary = await store.dailySummary(req.user!.id);
  const user = await store.findUser(req.user!.id);
  res.json({ summary, user });
});

dailyLogsRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const deleted = await store.deleteDailyLog(req.user!.id, String(req.params.id));
  if (!deleted) return res.status(404).json({ message: "Daily log not found" });
  const summary = await store.dailySummary(req.user!.id);
  const user = await store.findUser(req.user!.id);
  res.json({ deleted, summary, user });
});
