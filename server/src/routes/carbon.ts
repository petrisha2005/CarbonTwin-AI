import express from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { store } from "../services/store.js";
import { onboardingService } from "../services/onboardingService.js";
import { calculateCarbon, carbonPersonality, ecoScore, ecoStatus, type LifestyleInputs } from "../utils/carbon.js";

export const carbonRouter = express.Router();
carbonRouter.use(requireAuth);

const emptyStringToUndefined = (value: unknown) => value === "" ? undefined : value;
const emptyNumberToZero = (value: unknown) => value === "" || value == null ? 0 : value;
const usageToApplianceLevel = (value: unknown) => value === "high" ? "high" : value === "normal" ? "medium" : value === "low" ? "low" : undefined;
const requiredMessage = "Please complete all required calculator fields.";

const enumField = <T extends [string, ...string[]]>(values: T) => z.preprocess(emptyStringToUndefined, z.enum(values).optional());
const optionalNumber = z.preprocess(emptyNumberToZero, z.coerce.number().min(0));

const lifestyleSchema = z.object({
  dailyDistanceKm: optionalNumber,
  transportMode: z.enum(["walking", "bicycle", "bus", "metro", "train", "two_wheeler_petrol", "car_petrol", "car_diesel", "ev"]),
  weeklyTravelDays: z.preprocess(emptyNumberToZero, z.coerce.number().min(0).max(7)),
  monthlyElectricityKwh: optionalNumber,
  acHoursPerDay: z.preprocess(emptyNumberToZero, z.coerce.number().min(0).max(24)),
  fanHoursPerDay: z.preprocess(emptyNumberToZero, z.coerce.number().min(0).max(24)),
  applianceUsageLevel: enumField(["low", "medium", "high"]),
  electricityEstimationMethod: z.enum(["bill_upload", "payment_screenshot", "manual_units", "smart_estimate"]),
  electricityData: z.object({
    placeType: enumField(["hostel", "small_home", "apartment", "large_house"]),
    peopleSharingElectricity: z.coerce.number().min(1).optional(),
    householdMembers: z.coerce.number().min(1).optional(),
    acUsage: enumField(["none", "lt1", "h1_3", "h3_6", "gt6"]),
    fanUsage: enumField(["none", "low", "normal", "high"]),
    appliancesUsed: z.array(z.string()).optional(),
    overallUsage: enumField(["low", "normal", "high"]),
    estimatedDailyKwh: optionalNumber.optional(),
    monthlyUnits: optionalNumber.optional(),
    extractedFromBill: z.boolean().optional(),
    amountPaid: optionalNumber.optional(),
    provider: z.string().optional().nullable(),
    estimatedUnits: optionalNumber.optional(),
    estimatedCO2: optionalNumber.optional(),
    personalCO2: optionalNumber.optional().nullable(),
    confidence: z.string().optional(),
    sourceType: z.string().optional(),
    confirmedByUser: z.boolean().optional()
  }).passthrough().default({}),
  dietType: z.enum(["vegetarian", "mixed", "non_vegetarian", "vegan"]),
  foodDeliveryPerWeek: optionalNumber,
  packagedFoodLevel: z.enum(["low", "medium", "high"]),
  onlineOrdersPerMonth: optionalNumber,
  clothingPurchasesPerMonth: optionalNumber,
  plasticUsageLevel: z.enum(["low", "medium", "high"]),
  recyclingHabit: z.enum(["never", "sometimes", "often"])
}).passthrough().superRefine((input, ctx) => {
  const data = input.electricityData ?? {};
  if (input.transportMode !== "walking" && input.transportMode !== "bicycle" && input.dailyDistanceKm <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["dailyDistanceKm"], message: "Please enter how far you traveled, or choose no travel." });
  }
  if (input.electricityEstimationMethod === "manual_units" && input.monthlyElectricityKwh <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["monthlyElectricityKwh"], message: "Please enter your monthly electricity units." });
  }
  if (input.electricityEstimationMethod === "bill_upload" && input.monthlyElectricityKwh <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["electricityData.monthlyUnits"], message: "Please confirm the units from your electricity bill." });
  }
  if (input.electricityEstimationMethod === "payment_screenshot" && input.monthlyElectricityKwh <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["electricityData.estimatedUnits"], message: "Please confirm the estimate from your payment screenshot." });
  }
  if (input.electricityEstimationMethod === "smart_estimate") {
    if (!data.placeType) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["electricityData.placeType"], message: "Please choose your place type." });
    if (!data.peopleSharingElectricity && !data.householdMembers) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["electricityData.peopleSharingElectricity"], message: "Please enter how many people share electricity." });
    if (!data.acUsage) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["electricityData.acUsage"], message: "Please choose your AC usage." });
    if (!data.fanUsage) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["electricityData.fanUsage"], message: "Please choose your fan usage." });
    if (!data.appliancesUsed?.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["electricityData.appliancesUsed"], message: "Please select at least one appliance or choose None." });
    if (!data.overallUsage) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["electricityData.overallUsage"], message: "Please choose your overall electricity usage." });
  }
});

function normalizeLifestylePayload(body: any) {
  const electricityData = body?.electricityData ?? {};
  const overallUsage = electricityData.overallUsage;
  const applianceUsageLevel = body?.applianceUsageLevel || usageToApplianceLevel(overallUsage);
  return {
    ...body,
    applianceUsageLevel,
    electricityData: {
      ...electricityData,
      peopleSharingElectricity: electricityData.peopleSharingElectricity ?? electricityData.householdMembers,
      acUsage: electricityData.acUsage ?? electricityData.acUsageLevel,
      fanUsage: electricityData.fanUsage ?? electricityData.fanUsageLevel
    }
  };
}

function validationErrors(error: z.ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message
  }));
}

carbonRouter.post("/calculate", async (req: AuthedRequest, res) => {
  try {
    const parsed = lifestyleSchema.safeParse(normalizeLifestylePayload(req.body));
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: requiredMessage,
        errors: validationErrors(parsed.error)
      });
    }
    const lifestyleInputs = parsed.data as LifestyleInputs;
    const breakdown = calculateCarbon(lifestyleInputs);
    const log = await store.addCarbonLog(req.user!.id, { ...breakdown, lifestyleInputs });
    await store.updateUser(req.user!.id, {
      baselineFootprint: {
        totalCO2: breakdown.totalCO2,
        transportCO2: breakdown.transportCO2,
        electricityCO2: breakdown.electricityCO2,
        foodCO2: breakdown.foodCO2,
        shoppingWasteCO2: breakdown.shoppingCO2,
        calculatedAt: new Date()
      }
    } as any);
    const onboarding = await onboardingService.patch(req.user!.id, { hasCompletedBaselineCalculator: true });
    const user = await store.findUser(req.user!.id);
    res.status(201).json({ log, user, onboarding, score: ecoScore(log.totalCO2), status: ecoStatus(ecoScore(log.totalCO2)), personality: carbonPersonality(log) });
  } catch (error: any) {
    res.status(400).json({ success: false, message: "Could not calculate footprint. Please review your calculator answers." });
  }
});

carbonRouter.get("/summary", async (req: AuthedRequest, res) => {
  const logs = await store.userLogs(req.user!.id);
  const latestLog = logs[0] ?? null;
  const user = await store.findUser(req.user!.id);
  const score = latestLog ? ecoScore(latestLog.totalCO2) : 0;
  res.json({
    user,
    latestLog,
    logs,
    score,
    status: latestLog ? ecoStatus(score) : "Awaiting first scan",
    personality: carbonPersonality(latestLog)
  });
});

carbonRouter.patch("/budget", async (req: AuthedRequest, res) => {
  const { carbonGoal } = z.object({ carbonGoal: z.coerce.number().min(1) }).parse(req.body);
  const user = await store.updateUser(req.user!.id, { carbonGoal });
  res.json({ user });
});
