import mongoose, { Schema } from "mongoose";

const carbonLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    transportCO2: Number,
    electricityCO2: Number,
    foodCO2: Number,
    shoppingCO2: Number,
    totalCO2: Number,
    lifestyleInputs: { type: Schema.Types.Mixed, required: true },
    month: Number,
    year: Number
  },
  { timestamps: true }
);

carbonLogSchema.index({ userId: 1, createdAt: -1 });
carbonLogSchema.index({ userId: 1, month: 1, year: 1 });

export const CarbonLog = mongoose.model("CarbonLog", carbonLogSchema);
