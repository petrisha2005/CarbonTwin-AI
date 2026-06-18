import { randomUUID } from "node:crypto";
import { CoachPlan } from "../models/CoachPlan.js";
import { isMongoEnabled } from "./store.js";
import type { CoachPreferences, CoachRecommendation, CoachSource } from "./coachTypes.js";

type SavedCoachPlan = CoachPreferences & {
  id: string;
  userId: string;
  generatedAt: Date;
  recommendations: CoachRecommendation;
  source: CoachSource;
};

const memoryPlans: SavedCoachPlan[] = [];

function serialize(plan: any): SavedCoachPlan {
  return {
    id: String(plan._id ?? plan.id),
    userId: String(plan.userId),
    generatedAt: plan.generatedAt ?? plan.createdAt ?? new Date(),
    mood: plan.mood,
    goal: plan.goal,
    difficultyPreference: plan.difficultyPreference,
    budgetPreference: plan.budgetPreference,
    recommendations: plan.recommendations,
    source: plan.source ?? plan.recommendations?.source ?? "fallback"
  };
}

export const coachPlanStore = {
  async save(userId: string, preferences: CoachPreferences, recommendations: CoachRecommendation) {
    const payload = {
      userId,
      generatedAt: new Date(),
      ...preferences,
      recommendations,
      source: recommendations.source
    };
    if (isMongoEnabled()) {
      const created = await CoachPlan.create(payload);
      return serialize(created);
    }
    const created = { id: randomUUID(), ...payload };
    memoryPlans.push(created);
    return serialize(created);
  },

  async latest(userId: string) {
    if (isMongoEnabled()) {
      const plan = await CoachPlan.findOne({ userId }).sort({ generatedAt: -1 });
      return plan ? serialize(plan) : null;
    }
    const plan = memoryPlans.filter((item) => item.userId === userId).sort((a, b) => +b.generatedAt - +a.generatedAt)[0];
    return plan ? serialize(plan) : null;
  },

  async history(userId: string) {
    if (isMongoEnabled()) {
      const plans = await CoachPlan.find({ userId }).sort({ generatedAt: -1 }).limit(20);
      return plans.map(serialize);
    }
    return memoryPlans
      .filter((item) => item.userId === userId)
      .sort((a, b) => +b.generatedAt - +a.generatedAt)
      .slice(0, 20)
      .map(serialize);
  }
};
