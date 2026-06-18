import mongoose, { Schema } from "mongoose";

const carbonBudgetSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    monthlyBudget: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    categoryBudgets: {
      transport: { type: Number, default: 0 },
      electricity: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      shoppingWaste: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

carbonBudgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

export const CarbonBudget = mongoose.model("CarbonBudget", carbonBudgetSchema);
