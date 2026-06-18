import mongoose, { Schema } from "mongoose";

const missionSchema = new Schema(
  {
    missionId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ["transport", "electricity", "food", "shopping_waste", "habit", "community"], required: true },
    type: { type: String, enum: ["daily", "weekly", "special"], default: "daily" },
    difficulty: { type: String, enum: ["easy", "medium", "challenge"], default: "easy" },
    estimatedCO2Saving: { type: Number, required: true },
    xpReward: { type: Number, required: true },
    leafCoinReward: { type: Number, required: true },
    targetCount: { type: Number, default: 1 },
    active: { type: Boolean, default: true },
    icon: { type: String, default: "Leaf" },
    verificationType: {
      type: String,
      enum: ["self_check", "eco_quest_match", "photo_proof", "bill_or_receipt", "qr_code", "friend_verification", "location_optional"],
      default: "self_check"
    },
    verificationRequired: { type: Boolean, default: false },
    minimumTrustScore: { type: Number, default: 40 },
    proofInstructions: { type: String, default: "" },
    allowSelfCheckFallback: { type: Boolean, default: true },
    rewardPolicy: {
      type: String,
      enum: ["full_reward_on_self_check", "partial_reward_until_verified", "full_reward_only_after_verified"],
      default: "full_reward_on_self_check"
    },
    estimatedSaving: Number,
    points: Number,
    isActive: Boolean
  },
  { timestamps: true }
);

export const Mission = mongoose.model("Mission", missionSchema);
