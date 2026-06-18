import { store } from "./store.js";

const defaults = {
  hasSeenWelcome: false,
  hasCompletedOnboarding: false,
  hasCompletedProfileSetup: false,
  hasCompletedBaselineCalculator: false,
  hasSelectedGoal: false,
  hasSetBudget: false,
  hasCompletedFirstEcoQuest: false,
  skipped: false
};

async function normalize(userId: string, user: any) {
  const saved = { ...defaults, ...(user?.onboarding ?? {}) };
  const logs = await store.dailyLogs(userId).catch(() => []);
  const normalized = {
    ...saved,
    hasCompletedProfileSetup: saved.hasCompletedProfileSetup || Boolean((user?.displayName || user?.name) && user?.city),
    hasCompletedBaselineCalculator: saved.hasCompletedBaselineCalculator || Boolean(user?.baselineFootprint?.calculatedAt),
    hasSelectedGoal: saved.hasSelectedGoal || Boolean(user?.climateGoal || user?.goals?.carbonGoalType),
    hasCompletedFirstEcoQuest: saved.hasCompletedFirstEcoQuest || logs.length > 0
  };
  return {
    ...normalized,
    hasCompletedOnboarding: normalized.hasSeenWelcome && normalized.hasCompletedProfileSetup && normalized.hasCompletedBaselineCalculator && normalized.hasSelectedGoal && normalized.hasSetBudget && normalized.hasCompletedFirstEcoQuest
  };
}

function routeFor(status: typeof defaults) {
  if (!status.hasSeenWelcome) return { recommendedNextRoute: "/onboarding", recommendedAction: "Start your CarbonTwin setup" };
  if (!status.hasCompletedProfileSetup) return { recommendedNextRoute: "/profile-setup", recommendedAction: "Complete your basic profile" };
  if (!status.hasCompletedBaselineCalculator) return { recommendedNextRoute: "/calculator", recommendedAction: "Complete your baseline calculator" };
  if (!status.hasSelectedGoal) return { recommendedNextRoute: "/goal-setup", recommendedAction: "Choose your first climate goal" };
  if (!status.hasSetBudget) return { recommendedNextRoute: "/budget", recommendedAction: "Set your monthly carbon budget" };
  if (!status.hasCompletedFirstEcoQuest) return { recommendedNextRoute: "/eco-quest", recommendedAction: "Complete your first Eco Quest" };
  return { recommendedNextRoute: "/dashboard", recommendedAction: "View your climate dashboard" };
}

function progress(status: typeof defaults) {
  return Math.round(([status.hasSeenWelcome, status.hasCompletedProfileSetup, status.hasCompletedBaselineCalculator, status.hasSelectedGoal, status.hasSetBudget, status.hasCompletedFirstEcoQuest, status.hasCompletedOnboarding].filter(Boolean).length / 7) * 100);
}

export const onboardingService = {
  async status(userId: string) {
    const user = await store.findUser(userId);
    const onboarding = await normalize(userId, user);
    return {
      ...onboarding,
      ...routeFor(onboarding),
      setupProgressPercent: progress(onboarding)
    };
  },

  async patch(userId: string, patch: Record<string, any>) {
    const user = await store.findUser(userId);
    const onboarding = { ...(await normalize(userId, user)), ...patch };
    const complete = onboarding.hasSeenWelcome && onboarding.hasCompletedProfileSetup && onboarding.hasCompletedBaselineCalculator && onboarding.hasSelectedGoal && onboarding.hasSetBudget && onboarding.hasCompletedFirstEcoQuest;
    onboarding.hasCompletedOnboarding = complete;
    if (complete && !onboarding.onboardingCompletedAt) {
      onboarding.onboardingCompletedAt = new Date();
    }
    await store.updateUser(userId, { onboarding } as any);
    return this.status(userId);
  }
};
