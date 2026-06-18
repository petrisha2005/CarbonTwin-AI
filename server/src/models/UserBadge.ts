import mongoose, { Schema } from "mongoose";

const userBadgeSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    badgeId: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now },
    rewardsClaimed: { type: Boolean, default: true },
    xpBonus: { type: Number, default: 0 },
    leafCoinBonus: { type: Number, default: 0 }
  },
  { timestamps: true }
);

userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export const UserBadge = mongoose.model("UserBadge", userBadgeSchema);
