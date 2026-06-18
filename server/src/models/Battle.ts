import mongoose, { Schema } from "mongoose";

const battleSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    battleCode: { type: String, required: true, unique: true, index: true },
    code: { type: String, unique: true, sparse: true },
    creatorId: { type: String, required: true },
    battleType: { type: String, enum: ["one_v_one", "group", "campus"], default: "group" },
    goalType: { type: String, enum: ["most_co2_saved", "most_eco_quests", "most_missions_completed", "highest_eco_score"], default: "highest_eco_score" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["upcoming", "active", "completed", "cancelled"], default: "active" },
    maxParticipants: { type: Number, default: 10 },
    collegeName: { type: String, default: "" },
    department: { type: String, default: "" },
    participants: [
      {
        userId: String,
        displayName: String,
        joinedAt: { type: Date, default: Date.now },
        score: { type: Number, default: 0 },
        co2Saved: { type: Number, default: 0 },
        ecoQuestsCompleted: { type: Number, default: 0 },
        missionsCompleted: { type: Number, default: 0 },
        xpEarned: { type: Number, default: 0 },
        leafCoinsEarned: { type: Number, default: 0 }
      }
    ],
    targetValue: { type: Number, default: 3 },
    winnerId: String,
    rewardsGiven: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Battle = mongoose.model("Battle", battleSchema);
