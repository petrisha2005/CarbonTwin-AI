import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    displayName: { type: String, default: "" },
    avatarColor: { type: String, default: "#22c55e" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    bio: { type: String, default: "" },
    ecoPoints: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    leafCoins: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    streakFreezeCount: { type: Number, default: 0 },
    totalLoggedDays: { type: Number, default: 0 },
    lastLogDate: Date,
    badges: { type: [String], default: [] },
    carbonGoal: { type: Number, default: 160 },
    climateGoal: { type: String, default: "" },
    goals: {
      carbonGoalType: { type: String, default: "" },
      monthlyCarbonBudget: { type: Number, default: 160 }
    },
    preferences: {
      preferredTrackingMode: { type: String, default: "" },
      aiCoachTone: { type: String, default: "" },
      budgetPreference: { type: String, default: "" },
      difficultyPreference: { type: String, default: "" },
      categoryBudgetSplit: {
        transport: { type: Number, default: 0 },
        electricity: { type: Number, default: 0 },
        food: { type: Number, default: 0 },
        shoppingWaste: { type: Number, default: 0 }
      }
    },
    privacy: {
      showOnLeaderboards: { type: Boolean, default: true },
      shareCollegeStats: { type: Boolean, default: true }
    },
    co2Saved: { type: Number, default: 0 },
    totalCO2Saved: { type: Number, default: 0 },
    baselineFootprint: {
      totalCO2: { type: Number, default: 0 },
      transportCO2: { type: Number, default: 0 },
      electricityCO2: { type: Number, default: 0 },
      foodCO2: { type: Number, default: 0 },
      shoppingWasteCO2: { type: Number, default: 0 },
      calculatedAt: Date
    },
    collegeName: { type: String, default: "" },
    department: { type: String, default: "" },
    batch: { type: String, default: "" }
    ,
    onboarding: {
      hasSeenWelcome: { type: Boolean, default: false },
      hasCompletedOnboarding: { type: Boolean, default: false },
      hasCompletedProfileSetup: { type: Boolean, default: false },
      hasCompletedBaselineCalculator: { type: Boolean, default: false },
      hasSelectedGoal: { type: Boolean, default: false },
      hasSetBudget: { type: Boolean, default: false },
      hasCompletedFirstEcoQuest: { type: Boolean, default: false },
      skipped: { type: Boolean, default: false },
      onboardingCompletedAt: Date
    },
    lastLoginAt: Date,
    lastActiveAt: Date
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
