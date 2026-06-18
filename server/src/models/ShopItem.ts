import mongoose, { Schema } from "mongoose";

const shopItemSchema = new Schema(
  {
    itemId: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["avatar_aura", "outfit", "tree_style", "pet", "profile_frame", "background", "badge_effect"],
      required: true
    },
    description: { type: String, required: true },
    priceLeafCoins: { type: Number, required: true },
    unlockLevelRequired: { type: Number, default: 1 },
    rarity: { type: String, enum: ["common", "rare", "epic", "legendary"], default: "common" },
    icon: { type: String, default: "Sparkles" },
    previewStyle: {
      color: String,
      gradient: String,
      glow: String,
      emoji: String,
      cssClass: String,
      effect: String
    },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const ShopItem = mongoose.model("ShopItem", shopItemSchema);
