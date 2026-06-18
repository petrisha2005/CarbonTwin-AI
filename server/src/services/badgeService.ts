import { Badge } from "../models/Badge.js";
import { UserBadge } from "../models/UserBadge.js";
import { coachPlanStore } from "./coachPlanStore.js";
import { gamificationMemory } from "./gamificationState.js";
import { isMongoEnabled, store } from "./store.js";
import { UserMission } from "../models/UserMission.js";
import { levelFromXp } from "../utils/gamification.js";

function serializeBadge(badge: any) {
  return {
    id: String(badge._id ?? badge.badgeId),
    badgeId: badge.badgeId,
    title: badge.title,
    description: badge.description,
    icon: badge.icon,
    category: badge.category,
    conditionType: badge.conditionType,
    conditionValue: badge.conditionValue,
    xpBonus: badge.xpBonus ?? 0,
    leafCoinBonus: badge.leafCoinBonus ?? 0,
    active: badge.active !== false
  };
}

function serializeUserBadge(row: any) {
  return {
    id: String(row._id ?? row.id ?? `${row.userId}-${row.badgeId}`),
    userId: String(row.userId),
    badgeId: row.badgeId,
    unlockedAt: row.unlockedAt,
    rewardsClaimed: row.rewardsClaimed !== false,
    xpBonus: row.xpBonus ?? 0,
    leafCoinBonus: row.leafCoinBonus ?? 0
  };
}

async function allBadges() {
  const badges = isMongoEnabled() ? await Badge.find({ active: true }) : gamificationMemory.badges.filter((badge) => badge.active);
  return badges.map(serializeBadge);
}

async function userBadges(userId: string) {
  const rows = isMongoEnabled() ? await UserBadge.find({ userId }) : gamificationMemory.userBadges.filter((row) => row.userId === userId);
  return rows.map(serializeUserBadge);
}

async function completedMissionsCount(userId: string) {
  return isMongoEnabled()
    ? await UserMission.countDocuments({ userId, status: "completed" })
    : gamificationMemory.userMissions.filter((row) => row.userId === userId && row.status === "completed").length;
}

async function conditionMet(badge: any, user: any, completedMissions: number) {
  if (badge.conditionType === "totalLoggedDays") return (user.totalLoggedDays ?? 0) >= badge.conditionValue;
  if (badge.conditionType === "completedMissions") return completedMissions >= badge.conditionValue;
  if (badge.conditionType === "longestStreak") return (user.longestStreak ?? 0) >= badge.conditionValue;
  if (badge.conditionType === "totalCO2Saved") return (user.totalCO2Saved ?? user.co2Saved ?? 0) >= badge.conditionValue;
  if (badge.conditionType === "level") return (user.level ?? 1) >= badge.conditionValue;
  if (badge.conditionType === "campusProfile") return Boolean(user.collegeName && user.department);
  if (badge.conditionType === "savedCoachPlans") return (await coachPlanStore.history(user.id)).length >= badge.conditionValue;
  return false;
}

async function unlockBadge(userId: string, badge: any) {
  const payload = {
    userId,
    badgeId: badge.badgeId,
    unlockedAt: new Date(),
    rewardsClaimed: true,
    xpBonus: badge.xpBonus ?? 0,
    leafCoinBonus: badge.leafCoinBonus ?? 0
  };
  if (isMongoEnabled()) {
    const existing = await UserBadge.findOne({ userId, badgeId: badge.badgeId });
    if (existing) return null;
    await UserBadge.create(payload);
  } else {
    if (gamificationMemory.userBadges.some((row) => row.userId === userId && row.badgeId === badge.badgeId)) return null;
    gamificationMemory.userBadges.push({ id: `${userId}-${badge.badgeId}`, ...payload });
  }
  const user = await store.findUser(userId);
  if (user) {
    const badges = [...new Set([...(user.badges ?? []), badge.title])];
    const xp = (user.xp ?? 0) + (badge.xpBonus ?? 0);
    await store.updateUser(userId, {
      badges,
      xp,
      level: levelFromXp(xp),
      leafCoins: (user.leafCoins ?? 0) + (badge.leafCoinBonus ?? 0)
    });
  }
  return badge;
}

export const badgeService = {
  async all(userId: string) {
    const [badges, unlocked] = await Promise.all([allBadges(), userBadges(userId)]);
    const unlockedIds = new Set(unlocked.map((row) => row.badgeId));
    return badges.map((badge) => ({
      ...badge,
      unlocked: unlockedIds.has(badge.badgeId),
      unlockedAt: unlocked.find((row) => row.badgeId === badge.badgeId)?.unlockedAt
    }));
  },

  async my(userId: string) {
    const [badges, unlocked] = await Promise.all([allBadges(), userBadges(userId)]);
    const byId = new Map(badges.map((badge) => [badge.badgeId, badge]));
    return unlocked.map((row) => ({ ...row, badge: byId.get(row.badgeId) })).filter((row) => row.badge);
  },

  async checkUnlocks(userId: string) {
    const [user, badges, unlocked, completedMissions] = await Promise.all([
      store.findUser(userId),
      allBadges(),
      userBadges(userId),
      completedMissionsCount(userId)
    ]);
    if (!user) throw new Error("User not found");
    const unlockedIds = new Set(unlocked.map((row) => row.badgeId));
    const newlyUnlocked = [];
    for (const badge of badges) {
      if (unlockedIds.has(badge.badgeId)) continue;
      if (await conditionMet(badge, user, completedMissions)) {
        const unlockedBadge = await unlockBadge(userId, badge);
        if (unlockedBadge) newlyUnlocked.push(unlockedBadge);
      }
    }
    return newlyUnlocked;
  }
};
