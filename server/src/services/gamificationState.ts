export type MissionSeed = {
  missionId: string;
  title: string;
  description: string;
  category: "transport" | "electricity" | "food" | "shopping_waste" | "habit" | "community";
  type: "daily" | "weekly" | "special";
  difficulty: "easy" | "medium" | "challenge";
  estimatedCO2Saving: number;
  xpReward: number;
  leafCoinReward: number;
  targetCount: number;
  active: boolean;
  icon: string;
  verificationType: "self_check" | "eco_quest_match" | "photo_proof" | "bill_or_receipt" | "qr_code" | "friend_verification" | "location_optional";
  verificationRequired: boolean;
  minimumTrustScore: number;
  proofInstructions: string;
  allowSelfCheckFallback: boolean;
  rewardPolicy: "full_reward_on_self_check" | "partial_reward_until_verified" | "full_reward_only_after_verified";
};

export type BadgeSeed = {
  badgeId: string;
  title: string;
  description: string;
  icon: string;
  category: "streak" | "savings" | "missions" | "profile" | "community" | "level";
  conditionType: string;
  conditionValue: number;
  xpBonus: number;
  leafCoinBonus: number;
  active: boolean;
};

const selfCheck = {
  verificationType: "self_check" as const,
  verificationRequired: false,
  minimumTrustScore: 40,
  proofInstructions: "Confirm this trust-based action when you complete it.",
  allowSelfCheckFallback: true,
  rewardPolicy: "full_reward_on_self_check" as const
};

export const defaultMissions: MissionSeed[] = [
  { missionId: "walk-one-short-trip", title: "Walk One Short Trip", description: "Replace one short vehicle trip with walking or cycling.", category: "transport", type: "daily", difficulty: "easy", estimatedCO2Saving: 1.5, xpReward: 30, leafCoinReward: 15, targetCount: 1, active: true, icon: "Footprints", verificationType: "eco_quest_match", verificationRequired: false, minimumTrustScore: 60, proofInstructions: "Log walking or bicycle in Eco Quest, or self-check for partial rewards.", allowSelfCheckFallback: true, rewardPolicy: "partial_reward_until_verified" },
  { missionId: "public-transport-choice", title: "Public Transport Choice", description: "Choose bus, metro, train, or shared transport for one journey.", category: "transport", type: "daily", difficulty: "medium", estimatedCO2Saving: 2, xpReward: 40, leafCoinReward: 20, targetCount: 1, active: true, icon: "Bus", verificationType: "eco_quest_match", verificationRequired: true, minimumTrustScore: 70, proofInstructions: "Log bus, metro, or train in Eco Quest or upload ticket photo.", allowSelfCheckFallback: false, rewardPolicy: "full_reward_only_after_verified" },
  { missionId: "switch-off-unused-appliances", title: "Switch Off Unused Appliances", description: "Turn off idle lights, chargers, screens, and appliances.", category: "electricity", type: "daily", difficulty: "easy", estimatedCO2Saving: 0.8, xpReward: 20, leafCoinReward: 10, targetCount: 1, active: true, icon: "Power", ...selfCheck },
  { missionId: "reduce-ac-by-1-hour", title: "Reduce AC by 1 Hour", description: "Trim one AC hour and use fan or ventilation instead.", category: "electricity", type: "daily", difficulty: "medium", estimatedCO2Saving: 2, xpReward: 40, leafCoinReward: 20, targetCount: 1, active: true, icon: "Fan", verificationType: "eco_quest_match", verificationRequired: false, minimumTrustScore: 60, proofInstructions: "Log low AC usage or select a reduced-AC Eco Quest action.", allowSelfCheckFallback: true, rewardPolicy: "partial_reward_until_verified" },
  { missionId: "plant-based-meal", title: "Plant-Based Meal", description: "Choose one plant-forward meal today.", category: "food", type: "daily", difficulty: "easy", estimatedCO2Saving: 1.5, xpReward: 30, leafCoinReward: 15, targetCount: 1, active: true, icon: "Salad", verificationType: "photo_proof", verificationRequired: false, minimumTrustScore: 70, proofInstructions: "Upload a meal photo or select plant-based meal in Eco Quest.", allowSelfCheckFallback: true, rewardPolicy: "partial_reward_until_verified" },
  { missionId: "avoid-food-delivery", title: "Avoid Food Delivery", description: "Skip one delivery order and avoid extra travel and packaging.", category: "food", type: "daily", difficulty: "easy", estimatedCO2Saving: 1.2, xpReward: 25, leafCoinReward: 12, targetCount: 1, active: true, icon: "Utensils", verificationType: "eco_quest_match", verificationRequired: true, minimumTrustScore: 70, proofInstructions: "Complete today’s Eco Quest with food delivery set to no.", allowSelfCheckFallback: false, rewardPolicy: "full_reward_only_after_verified" },
  { missionId: "no-online-shopping-today", title: "No Online Shopping Today", description: "Avoid one non-essential online order today.", category: "shopping_waste", type: "daily", difficulty: "medium", estimatedCO2Saving: 1.8, xpReward: 35, leafCoinReward: 18, targetCount: 1, active: true, icon: "ShoppingBag", verificationType: "eco_quest_match", verificationRequired: true, minimumTrustScore: 75, proofInstructions: "Complete today’s Eco Quest with online order set to no.", allowSelfCheckFallback: false, rewardPolicy: "full_reward_only_after_verified" },
  { missionId: "avoid-plastic-bottle", title: "Avoid Plastic Bottle", description: "Carry a reusable bottle instead of buying single-use plastic.", category: "shopping_waste", type: "daily", difficulty: "easy", estimatedCO2Saving: 0.3, xpReward: 10, leafCoinReward: 5, targetCount: 1, active: true, icon: "Bottle", ...selfCheck },
  { missionId: "5-day-eco-quest-streak", title: "5-Day Eco Quest Streak", description: "Complete Eco Quest on five days this week.", category: "habit", type: "weekly", difficulty: "challenge", estimatedCO2Saving: 5, xpReward: 100, leafCoinReward: 50, targetCount: 5, active: true, icon: "Flame", verificationType: "eco_quest_match", verificationRequired: true, minimumTrustScore: 80, proofInstructions: "Complete five Eco Quest days this week.", allowSelfCheckFallback: false, rewardPolicy: "full_reward_only_after_verified" },
  { missionId: "three-public-transport-days", title: "Three Public Transport Days", description: "Use public transport on three different days this week.", category: "transport", type: "weekly", difficulty: "challenge", estimatedCO2Saving: 6, xpReward: 120, leafCoinReward: 60, targetCount: 3, active: true, icon: "Train", verificationType: "eco_quest_match", verificationRequired: true, minimumTrustScore: 80, proofInstructions: "Log bus, metro, or train on three Eco Quest days.", allowSelfCheckFallback: false, rewardPolicy: "full_reward_only_after_verified" },
  { missionId: "low-energy-week", title: "Low Energy Week", description: "Log five lower-energy days this week.", category: "electricity", type: "weekly", difficulty: "medium", estimatedCO2Saving: 5, xpReward: 90, leafCoinReward: 45, targetCount: 5, active: true, icon: "Zap", verificationType: "eco_quest_match", verificationRequired: true, minimumTrustScore: 75, proofInstructions: "Log five lower-energy Eco Quest days this week.", allowSelfCheckFallback: false, rewardPolicy: "full_reward_only_after_verified" },
  { missionId: "three-plant-based-meals", title: "Three Plant-Based Meals", description: "Eat three plant-based meals this week.", category: "food", type: "weekly", difficulty: "medium", estimatedCO2Saving: 4.5, xpReward: 90, leafCoinReward: 45, targetCount: 3, active: true, icon: "Leaf", verificationType: "photo_proof", verificationRequired: false, minimumTrustScore: 70, proofInstructions: "Upload meal proof or log plant-based meals in Eco Quest.", allowSelfCheckFallback: true, rewardPolicy: "partial_reward_until_verified" },
  { missionId: "no-shopping-week", title: "No Shopping Week", description: "Avoid non-essential shopping for seven days.", category: "shopping_waste", type: "weekly", difficulty: "challenge", estimatedCO2Saving: 5, xpReward: 110, leafCoinReward: 55, targetCount: 7, active: true, icon: "PackageX", verificationType: "eco_quest_match", verificationRequired: true, minimumTrustScore: 80, proofInstructions: "Complete seven Eco Quests with no online shopping entries.", allowSelfCheckFallback: false, rewardPolicy: "full_reward_only_after_verified" },
  { missionId: "first-eco-quest", title: "First Eco Quest", description: "Complete your first Eco Quest.", category: "habit", type: "special", difficulty: "easy", estimatedCO2Saving: 1, xpReward: 50, leafCoinReward: 25, targetCount: 1, active: true, icon: "Sparkles", verificationType: "eco_quest_match", verificationRequired: true, minimumTrustScore: 70, proofInstructions: "Complete your first Eco Quest.", allowSelfCheckFallback: false, rewardPolicy: "full_reward_only_after_verified" },
  { missionId: "join-campus-carbon-league", title: "Join Campus Carbon League", description: "Add your college and department to join the league.", category: "community", type: "special", difficulty: "easy", estimatedCO2Saving: 0, xpReward: 50, leafCoinReward: 20, targetCount: 1, active: true, icon: "GraduationCap", ...selfCheck },
  { missionId: "complete-your-profile", title: "Complete Your Profile", description: "Complete your CarbonTwin profile to at least 80%.", category: "habit", type: "special", difficulty: "easy", estimatedCO2Saving: 0, xpReward: 40, leafCoinReward: 20, targetCount: 1, active: true, icon: "UserRound", ...selfCheck }
];

export const defaultBadges: BadgeSeed[] = [
  { badgeId: "first-step", title: "First Step", description: "Complete your first Eco Quest.", icon: "Footprints", category: "profile", conditionType: "totalLoggedDays", conditionValue: 1, xpBonus: 20, leafCoinBonus: 10, active: true },
  { badgeId: "eco-starter", title: "Eco Starter", description: "Complete three missions.", icon: "Sprout", category: "missions", conditionType: "completedMissions", conditionValue: 3, xpBonus: 50, leafCoinBonus: 25, active: true },
  { badgeId: "mission-master", title: "Mission Master", description: "Complete ten missions.", icon: "Trophy", category: "missions", conditionType: "completedMissions", conditionValue: 10, xpBonus: 100, leafCoinBonus: 50, active: true },
  { badgeId: "3-day-spark", title: "3-Day Spark", description: "Reach a three-day streak.", icon: "Flame", category: "streak", conditionType: "longestStreak", conditionValue: 3, xpBonus: 40, leafCoinBonus: 20, active: true },
  { badgeId: "7-day-streak", title: "7-Day Streak", description: "Reach a seven-day streak.", icon: "Flame", category: "streak", conditionType: "longestStreak", conditionValue: 7, xpBonus: 100, leafCoinBonus: 50, active: true },
  { badgeId: "carbon-cutter", title: "Carbon Cutter", description: "Save 10 kg CO2.", icon: "Scissors", category: "savings", conditionType: "totalCO2Saved", conditionValue: 10, xpBonus: 80, leafCoinBonus: 40, active: true },
  { badgeId: "planet-protector", title: "Planet Protector", description: "Save 50 kg CO2.", icon: "Shield", category: "savings", conditionType: "totalCO2Saved", conditionValue: 50, xpBonus: 200, leafCoinBonus: 100, active: true },
  { badgeId: "level-5-twin", title: "Level 5 Twin", description: "Reach CarbonTwin level 5.", icon: "Star", category: "level", conditionType: "level", conditionValue: 5, xpBonus: 100, leafCoinBonus: 50, active: true },
  { badgeId: "campus-competitor", title: "Campus Competitor", description: "Join your campus league.", icon: "GraduationCap", category: "community", conditionType: "campusProfile", conditionValue: 1, xpBonus: 50, leafCoinBonus: 20, active: true },
  { badgeId: "ai-guided", title: "AI Guided", description: "Save an AI Eco Coach plan.", icon: "Bot", category: "profile", conditionType: "savedCoachPlans", conditionValue: 1, xpBonus: 60, leafCoinBonus: 30, active: true }
];

export const gamificationMemory = {
  missions: [...defaultMissions],
  userMissions: [] as any[],
  badges: [...defaultBadges],
  userBadges: [] as any[]
};
