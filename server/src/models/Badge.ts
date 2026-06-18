import mongoose, { Schema } from "mongoose";

const badgeSchema = new Schema(
  {
    badgeId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "Award" },
    category: { type: String, enum: ["streak", "savings", "missions", "profile", "community", "level"], required: true },
    conditionType: { type: String, required: true },
    conditionValue: { type: Number, default: 1 },
    xpBonus: { type: Number, default: 0 },
    leafCoinBonus: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Badge = mongoose.model("Badge", badgeSchema);
