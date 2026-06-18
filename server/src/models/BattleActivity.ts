import mongoose, { Schema } from "mongoose";

const battleActivitySchema = new Schema(
  {
    battleId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    sourceType: { type: String, enum: ["eco_quest", "mission", "manual_join", "system"], required: true },
    sourceId: { type: String, required: true },
    actionTitle: { type: String, required: true },
    co2Saved: { type: Number, default: 0 },
    ecoQuestCount: { type: Number, default: 0 },
    missionCount: { type: Number, default: 0 },
    scoreAdded: { type: Number, default: 0 }
  },
  { timestamps: true }
);

battleActivitySchema.index({ battleId: 1, userId: 1, sourceType: 1, sourceId: 1 }, { unique: true });

export const BattleActivity = mongoose.model("BattleActivity", battleActivitySchema);
