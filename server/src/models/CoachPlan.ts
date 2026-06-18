import mongoose, { Schema } from "mongoose";

const coachPlanSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    generatedAt: { type: Date, default: Date.now },
    mood: String,
    goal: String,
    difficultyPreference: String,
    budgetPreference: String,
    recommendations: { type: Schema.Types.Mixed, required: true },
    source: { type: String, enum: ["gemini", "fallback"], default: "fallback" }
  },
  { timestamps: true }
);

coachPlanSchema.index({ userId: 1, generatedAt: -1 });
coachPlanSchema.index({ userId: 1, createdAt: -1 });

export const CoachPlan = mongoose.model("CoachPlan", coachPlanSchema);
