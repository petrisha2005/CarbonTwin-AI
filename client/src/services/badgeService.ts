import { api } from "../lib/api";

export type Badge = {
  id: string;
  badgeId: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  conditionType: string;
  conditionValue: number;
  xpBonus: number;
  leafCoinBonus: number;
  unlocked?: boolean;
  unlockedAt?: string;
};

export const getBadges = () => api<{ badges: Badge[] }>("/badges");
export const getMyBadges = () => api<{ badges: Array<{ badgeId: string; badge: Badge; unlockedAt: string }> }>("/badges/my");
export const checkBadgeUnlocks = () => api<{ newlyUnlocked: Badge[] }>("/badges/check-unlocks", { method: "POST" });
