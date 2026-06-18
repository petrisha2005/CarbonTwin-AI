import mongoose, { Schema } from "mongoose";

const weeklyBossFightSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    weekKey: { type: String, required: true, index: true },
    monsterName: { type: String, required: true },
    maxHP: { type: Number, default: 100 },
    currentHP: { type: Number, default: 100 },
    damageDealt: { type: Number, default: 0 },
    defeated: { type: Boolean, default: false },
    rewardsClaimed: { type: Boolean, default: false },
    actions: [
      {
        source: String,
        sourceId: String,
        title: String,
        damage: Number,
        date: Date
      }
    ]
  },
  { timestamps: true }
);

weeklyBossFightSchema.index({ userId: 1, weekKey: 1 }, { unique: true });

export const WeeklyBossFight = mongoose.model("WeeklyBossFight", weeklyBossFightSchema);
