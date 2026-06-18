import mongoose, { Schema } from "mongoose";

const budgetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    totalBudgetCO2: { type: Number, required: true },
    categoryBudgets: {
      transport: { type: Number, default: 0 },
      electricity: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      shoppingWaste: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

export const Budget = mongoose.model("Budget", budgetSchema);
