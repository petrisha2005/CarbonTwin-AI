export type User = {
  id: string;
  name: string;
  displayName: string;
  avatarColor: string;
  email: string;
  city: string;
  country?: string;
  bio?: string;
  ecoPoints: number;
  xp: number;
  level: number;
  leafCoins: number;
  currentStreak: number;
  longestStreak: number;
  streakFreezeCount: number;
  totalCO2Saved: number;
  baselineFootprint?: {
    totalCO2: number;
    transportCO2: number;
    electricityCO2: number;
    foodCO2: number;
    shoppingWasteCO2: number;
    calculatedAt?: string;
  };
  totalLoggedDays: number;
  badges: string[];
  carbonGoal: number;
  climateGoal: string;
  co2Saved: number;
  collegeName: string;
  department: string;
  batch: string;
  goals?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
  privacy?: Record<string, unknown>;
  onboarding?: {
    hasSeenWelcome?: boolean;
    hasCompletedOnboarding?: boolean;
    hasCompletedProfileSetup?: boolean;
    hasCompletedBaselineCalculator?: boolean;
    hasSelectedGoal?: boolean;
    hasSetBudget?: boolean;
    hasCompletedFirstEcoQuest?: boolean;
    skipped?: boolean;
    onboardingCompletedAt?: string;
  };
};

export type ShopCategory = "avatar_aura" | "outfit" | "tree_style" | "pet" | "profile_frame" | "background" | "badge_effect";

export type ShopItem = {
  id: string;
  itemId: string;
  slug: string;
  name: string;
  category: ShopCategory;
  description: string;
  priceLeafCoins: number;
  unlockLevelRequired: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  icon: string;
  previewStyle?: {
    color?: string;
    gradient?: string;
    glow?: string;
    emoji?: string;
    cssClass?: string;
    effect?: string;
  };
  active: boolean;
};

export type EquippedItems = Partial<Record<ShopCategory, ShopItem & { equipped?: boolean }>>;

export type ShopItemStatus = ShopItem & {
  item: ShopItem;
  owned: boolean;
  equipped: boolean;
  canAfford: boolean;
  levelUnlocked: boolean;
  lockedReason: string | null;
  locked: boolean;
};

export type CarbonLog = {
  id: string;
  userId: string;
  transportCO2: number;
  electricityCO2: number;
  foodCO2: number;
  shoppingCO2: number;
  totalCO2: number;
  lifestyleInputs: Record<string, unknown>;
  month: number;
  year: number;
  createdAt: string;
};

export type Personality = {
  type: string;
  description: string;
  mainProblem: string;
  strategy: string;
  weeklyAction: string;
};

export type Summary = {
  user: User | null;
  latestLog: CarbonLog | null;
  logs: CarbonLog[];
  score: number;
  status: string;
  personality: Personality;
};

export type Mission = {
  id: string;
  missionId: string;
  title: string;
  description: string;
  estimatedCO2Saving: number;
  xpReward: number;
  leafCoinReward: number;
  targetCount: number;
  userMission?: UserMission | null;
  status?: "not_started" | "in_progress" | "completed";
  progress?: number;
  userStatus?: "not_started" | "in_progress" | "completed";
  rewardsClaimed?: boolean;
  difficulty: "easy" | "medium" | "challenge";
  category: string;
  type: "daily" | "weekly" | "special";
  icon: string;
  verificationType: "self_check" | "eco_quest_match" | "photo_proof" | "bill_or_receipt" | "qr_code" | "friend_verification" | "location_optional";
  verificationRequired: boolean;
  minimumTrustScore?: number;
  proofInstructions?: string;
  allowSelfCheckFallback?: boolean;
  rewardPolicy: "full_reward_on_self_check" | "partial_reward_until_verified" | "full_reward_only_after_verified";
  verificationStatus?: "not_required" | "pending" | "verified" | "rejected" | "needs_review";
  trustScore?: number;
  rewardStatus?: "not_claimed" | "partial_claimed" | "full_claimed";
  xpAwarded?: number;
  leafCoinsAwarded?: number;
  co2SavedAwarded?: number;
  proofs?: Array<{
    proofType: string;
    proofMethod?: string;
    fileUrl?: string;
    fileName?: string;
    fileMimeType?: string;
    fileSize?: number;
    uploadedAt?: string;
    validationResult?: string;
    validationStatus?: "verified" | "pending" | "needs_review" | "rejected";
    verificationStatus?: "verified" | "pending" | "needs_review" | "rejected";
    trustScore?: number;
    validationMessage?: string;
    rejectionReason?: string;
    expectedProof?: string;
    extractedTextPreview?: string;
    matchedEvidence?: string[];
    reviewerNote?: string;
  }>;
  verificationDetails?: {
    matchedEcoQuest?: boolean;
    matchedFields?: string[];
    reason?: string;
    verifiedAt?: string;
  };
};

export type UserMission = {
  id: string;
  missionId: string;
  status: "not_started" | "in_progress" | "completed";
  progress: number;
  targetCount: number;
  rewardsClaimed: boolean;
  completedAt?: string;
  verificationStatus?: "not_required" | "pending" | "verified" | "rejected" | "needs_review";
  trustScore?: number;
  rewardStatus?: "not_claimed" | "partial_claimed" | "full_claimed";
  xpAwarded?: number;
  leafCoinsAwarded?: number;
  co2SavedAwarded?: number;
  proofs?: Mission["proofs"];
  verificationDetails?: Mission["verificationDetails"];
  verificationMessage?: string;
};

export type DailyEcoAction = {
  actionId: string;
  title: string;
  co2Saved: number;
  points: number;
  leafCoins: number;
};

export type QuickTravelLevel = "no_travel" | "low" | "medium" | "high";

export type DailyLogInput = {
  date: string;
  transport: {
    mode: "walking" | "bicycle" | "bus" | "metro" | "train" | "two_wheeler_petrol" | "car_petrol" | "car_diesel" | "ev";
    distanceKm: number;
    numberOfTrips: number;
  };
  electricity: {
    electricityKwhToday: number;
    acHours: number;
    fanHours: number;
  };
  food: {
    dietToday: "vegan" | "vegetarian" | "mixed" | "non_vegetarian";
    foodDeliveryToday: boolean;
    packagedFoodToday: boolean;
  };
  shoppingWaste: {
    onlineOrderToday: boolean;
    clothingPurchaseToday: boolean;
    plasticUsage: "low" | "medium" | "high";
    recycledToday: boolean;
  };
  ecoActionIds: string[];
};

export type DailyLog = Omit<DailyLogInput, "ecoActionIds"> & {
  id: string;
  userId: string;
  transport: DailyLogInput["transport"] & { co2: number };
  electricity: DailyLogInput["electricity"] & { co2: number };
  food: DailyLogInput["food"] & { co2: number };
  shoppingWaste: DailyLogInput["shoppingWaste"] & { co2: number };
  ecoActions: DailyEcoAction[];
  totalCO2: number;
  co2Saved: number;
  netCO2: number;
  pointsEarned: number;
  xpEarned: number;
  leafCoinsEarned: number;
  levelAfterLog: number;
  treeStage: string;
  trackingMode: "quick" | "detailed" | "same_as_yesterday";
  moodSelected?: string;
  avatarMood: "glowing" | "happy" | "calm" | "tired" | "polluted";
  carbonEquivalents: {
    phoneCharges: number;
    petrolKm: number;
    treeDays: number;
  };
  quickLog?: {
    travelLevel: QuickTravelLevel;
    energyLevel: "low" | "medium" | "high";
    foodChoice: "vegan" | "vegetarian" | "mixed" | "non_vegetarian";
    shoppingToday: "none" | "small" | "high";
    ecoActionDone: boolean;
  };
  totals?: {
    transportCO2: number;
    electricityCO2: number;
    foodCO2: number;
    shoppingWasteCO2: number;
    totalCO2: number;
    co2Saved: number;
    netCO2: number;
  };
  rewards?: {
    xpEarned: number;
    leafCoinsEarned: number;
    levelAfterLog: number;
  };
  moodMessage?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type DailySummary = {
  todayCO2: number;
  weeklyCO2: number;
  monthlyCO2: number;
  totalCO2Saved: number;
  currentStreak: number;
  longestStreak: number;
  totalLoggedDays: number;
  totalPoints: number;
  xpEarned: number;
  leafCoinsEarned: number;
  categoryBreakdown: { name: string; value: number; color: string }[];
  weeklyTrend: { date: string; co2: number; saved: number }[];
  monthlyTrend: { date: string; co2: number; saved: number }[];
  savedTrend: { date: string; saved: number }[];
  latestDailyLog: DailyLog | null;
  todayLog: DailyLog | null;
  hasDailyLogs: boolean;
};
