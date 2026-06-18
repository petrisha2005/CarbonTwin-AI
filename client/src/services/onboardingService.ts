import { api } from "../lib/api";

export type OnboardingStatus = {
  hasSeenWelcome: boolean;
  hasCompletedOnboarding: boolean;
  hasCompletedProfileSetup: boolean;
  hasCompletedBaselineCalculator: boolean;
  hasSelectedGoal: boolean;
  hasSetBudget: boolean;
  hasCompletedFirstEcoQuest: boolean;
  skipped?: boolean;
  recommendedNextRoute: string;
  recommendedAction: string;
  setupProgressPercent: number;
};

export function getPostLoginRedirect(status: OnboardingStatus) {
  return status.recommendedNextRoute || "/dashboard";
}

export async function getOnboardingStatus() {
  const response = await api<{ success: boolean; data: OnboardingStatus }>("/onboarding/status");
  return response.data;
}

export async function completeWelcome() {
  const response = await api<{ success: boolean; data: OnboardingStatus }>("/onboarding/complete-welcome", { method: "POST" });
  return response.data;
}

export async function skipOnboarding() {
  const response = await api<{ success: boolean; data: OnboardingStatus }>("/onboarding/skip", { method: "POST" });
  return response.data;
}

export async function completeProfileSetup() {
  const response = await api<{ success: boolean; data: OnboardingStatus }>("/onboarding/complete-profile", { method: "POST" });
  return response.data;
}

export async function completeGoalSetup() {
  const response = await api<{ success: boolean; data: OnboardingStatus }>("/onboarding/complete-goal", { method: "POST" });
  return response.data;
}

export async function completeBaselineCalculator() {
  const response = await api<{ success: boolean; data: OnboardingStatus }>("/onboarding/complete-baseline-calculator", { method: "POST" });
  return response.data;
}

export async function completeBudgetSetup() {
  const response = await api<{ success: boolean; data: OnboardingStatus }>("/onboarding/complete-budget", { method: "POST" });
  return response.data;
}

export async function completeFirstQuest() {
  const response = await api<{ success: boolean; data: OnboardingStatus }>("/onboarding/complete-first-quest", { method: "POST" });
  return response.data;
}
