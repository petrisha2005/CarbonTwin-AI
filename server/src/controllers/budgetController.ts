import type { Response } from "express";
import { z } from "zod";
import type { AuthedRequest } from "../middleware/auth.js";
import { budgetService } from "../services/budgetService.js";
import { onboardingService } from "../services/onboardingService.js";

const categorySplitSchema = z.object({
  transport: z.coerce.number().min(0),
  electricity: z.coerce.number().min(0),
  food: z.coerce.number().min(0),
  shoppingWaste: z.coerce.number().min(0)
});

export const budgetController = {
  async current(req: AuthedRequest, res: Response) {
    res.json(await budgetService.current(req.user!.id));
  },

  async save(req: AuthedRequest, res: Response) {
    const input = z.object({
      monthlyBudget: z.coerce.number().min(1).max(5000),
      categoryBudgets: categorySplitSchema.optional()
    }).parse(req.body ?? {});
    const result = await budgetService.save(req.user!.id, input);
    const onboarding = await onboardingService.patch(req.user!.id, { hasSetBudget: true });
    res.json({ ...result, onboarding });
  },

  async categorySplit(req: AuthedRequest, res: Response) {
    res.json(await budgetService.updateCategorySplit(req.user!.id, categorySplitSchema.parse(req.body ?? {})));
  },

  async summary(req: AuthedRequest, res: Response) {
    res.json(await budgetService.summary(req.user!.id));
  }
};
