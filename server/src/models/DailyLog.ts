import mongoose, { Schema } from "mongoose";

const dailyLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    trackingMode: { type: String, enum: ["quick", "detailed", "same_as_yesterday"], default: "detailed" },
    moodSelected: String,
    quickLog: {
      travelLevel: String,
      energyLevel: String,
      foodChoice: String,
      shoppingToday: String,
      ecoActionDone: Boolean
    },
    detailedLog: Schema.Types.Mixed,
    avatarMood: String,
    moodMessage: String,
    transport: {
      mode: String,
      distanceKm: Number,
      numberOfTrips: Number,
      co2: Number
    },
    electricity: {
      electricityKwhToday: Number,
      acHours: Number,
      fanHours: Number,
      co2: Number
    },
    food: {
      dietToday: String,
      foodDeliveryToday: Boolean,
      packagedFoodToday: Boolean,
      co2: Number
    },
    shoppingWaste: {
      onlineOrderToday: Boolean,
      clothingPurchaseToday: Boolean,
      plasticUsage: String,
      recycledToday: Boolean,
      co2: Number
    },
    ecoActions: [
      {
        actionId: String,
        title: String,
        co2Saved: Number,
        points: Number,
        xp: Number,
        leafCoins: Number
      }
    ],
    totals: {
      transportCO2: Number,
      electricityCO2: Number,
      foodCO2: Number,
      shoppingWasteCO2: Number,
      totalCO2: Number,
      co2Saved: Number,
      netCO2: Number
    },
    rewards: {
      xpEarned: Number,
      leafCoinsEarned: Number,
      levelAfterLog: Number
    },
    totalCO2: Number,
    co2Saved: Number,
    netCO2: Number,
    pointsEarned: Number,
    xpEarned: Number,
    leafCoinsEarned: Number,
    levelAfterLog: Number,
    treeStage: String,
    carbonEquivalents: Schema.Types.Mixed
  },
  { timestamps: true }
);

dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyLog = mongoose.model("DailyLog", dailyLogSchema);
