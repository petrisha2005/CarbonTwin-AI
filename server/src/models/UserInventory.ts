import mongoose, { Schema } from "mongoose";

const userInventorySchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    itemId: { type: String, required: true },
    purchasedAt: { type: Date, default: Date.now },
    equipped: { type: Boolean, default: false },
    category: { type: String, required: true }
  },
  { timestamps: true }
);

userInventorySchema.index({ userId: 1, itemId: 1 }, { unique: true });
userInventorySchema.index({ userId: 1, category: 1, equipped: 1 });

export const UserInventory = mongoose.model("UserInventory", userInventorySchema);
