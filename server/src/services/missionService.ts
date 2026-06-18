import { randomUUID } from "node:crypto";
import { Mission } from "../models/Mission.js";
import { UserMission } from "../models/UserMission.js";
import { dateKey, weekKey } from "../utils/weekKey.js";
import { levelFromXp } from "../utils/gamification.js";
import { badgeService } from "./badgeService.js";
import { bossService } from "./bossService.js";
import { battleProgressService } from "./battleProgressService.js";
import { gamificationMemory } from "./gamificationState.js";
import { missionVerificationService } from "./missionVerificationService.js";
import { isMongoEnabled, store } from "./store.js";
import { sanitizeProofForResponse } from "../utils/proofSecurity.js";

function serializeMission(mission: any) {
  return {
    id: mission.missionId ?? mission.id,
    missionId: mission.missionId ?? mission.id,
    title: mission.title,
    description: mission.description,
    category: mission.category === "waste" || mission.category === "shopping" ? "shopping_waste" : mission.category,
    type: mission.type ?? "daily",
    difficulty: mission.difficulty === "hard" ? "challenge" : mission.difficulty,
    estimatedCO2Saving: mission.estimatedCO2Saving ?? mission.estimatedSaving ?? 0,
    xpReward: mission.xpReward ?? mission.points ?? 0,
    leafCoinReward: mission.leafCoinReward ?? Math.round((mission.points ?? 0) / 2),
    targetCount: mission.targetCount ?? 1,
    active: mission.active ?? mission.isActive ?? true,
    icon: mission.icon ?? "Leaf",
    verificationType: mission.verificationType ?? "self_check",
    verificationRequired: mission.verificationRequired ?? false,
    minimumTrustScore: mission.minimumTrustScore ?? 40,
    proofInstructions: mission.proofInstructions ?? "",
    allowSelfCheckFallback: mission.allowSelfCheckFallback ?? true,
    rewardPolicy: mission.rewardPolicy ?? "full_reward_on_self_check"
  };
}

function serializeUserMission(row: any) {
  return {
    id: String(row._id ?? row.id),
    userId: String(row.userId),
    missionId: row.missionId,
    status: row.status === "started" ? "in_progress" : row.status,
    progress: row.progress ?? (row.status === "completed" ? row.targetCount ?? 1 : 0),
    targetCount: row.targetCount ?? 1,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    dateKey: row.dateKey,
    weekKey: row.weekKey,
    rewardsClaimed: row.rewardsClaimed ?? false,
    verificationStatus: row.verificationStatus ?? "not_required",
    trustScore: row.trustScore ?? 0,
    proofs: (row.proofs ?? []).map(sanitizeProofForResponse),
    verifiedAt: row.verifiedAt,
    rejectedAt: row.rejectedAt,
    verificationMessage: row.verificationMessage,
    verificationDetails: row.verificationDetails ?? {},
    rewardStatus: row.rewardStatus ?? (row.rewardsClaimed ? "full_claimed" : "not_claimed"),
    xpReward: row.xpReward ?? 0,
    leafCoinReward: row.leafCoinReward ?? 0,
    co2SavedReward: row.co2SavedReward ?? 0,
    xpAwarded: row.xpAwarded ?? 0,
    leafCoinsAwarded: row.leafCoinsAwarded ?? 0,
    co2SavedAwarded: row.co2SavedAwarded ?? 0,
    progressEvents: row.progressEvents ?? []
  };
}

function periodFor(mission: any, date = new Date()) {
  if (mission.type === "daily") return { dateKey: dateKey(date), weekKey: undefined };
  if (mission.type === "weekly") return { dateKey: undefined, weekKey: weekKey(date) };
  return { dateKey: undefined, weekKey: undefined };
}

function matchesPeriod(row: any, mission: any, period: { dateKey?: string; weekKey?: string }) {
  if (mission.type === "daily") return row.dateKey === period.dateKey;
  if (mission.type === "weekly") return row.weekKey === period.weekKey;
  return !row.dateKey && !row.weekKey;
}

async function allMissions() {
  const missions = isMongoEnabled() ? await Mission.find({ active: true }).lean() : gamificationMemory.missions.filter((mission) => mission.active);
  return missions.map(serializeMission);
}

async function userMissionRows(userId: string) {
  const rows = isMongoEnabled() ? await UserMission.find({ userId }).lean() : gamificationMemory.userMissions.filter((row) => row.userId === userId);
  return rows.map(serializeUserMission);
}

async function findMission(missionId: string) {
  const mission = (await allMissions()).find((item) => item.missionId === missionId || item.id === missionId);
  if (!mission) throw new Error("Mission not found");
  return mission;
}

async function findUserMission(userId: string, mission: any, period = periodFor(mission)) {
  const rows = isMongoEnabled()
    ? await UserMission.find({ userId, missionId: mission.missionId }).lean()
    : gamificationMemory.userMissions.filter((row) => row.userId === userId && row.missionId === mission.missionId);
  return rows.map(serializeUserMission).find((row) => matchesPeriod(row, mission, period)) ?? null;
}

async function saveUserMission(row: any) {
  const update = { ...row };
  delete update.id;
  delete update._id;
  if (isMongoEnabled()) {
    const saved = await UserMission.findOneAndUpdate(
      { userId: row.userId, missionId: row.missionId, dateKey: row.dateKey, weekKey: row.weekKey },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return serializeUserMission(saved);
  }
  const index = gamificationMemory.userMissions.findIndex((item) => item.id === row.id);
  if (index >= 0) gamificationMemory.userMissions[index] = { ...gamificationMemory.userMissions[index], ...row, updatedAt: new Date() };
  else gamificationMemory.userMissions.push({ ...row, id: row.id ?? randomUUID(), createdAt: new Date(), updatedAt: new Date() });
  return serializeUserMission(index >= 0 ? gamificationMemory.userMissions[index] : gamificationMemory.userMissions.at(-1));
}

function rewardAmounts(mission: any, ratio = 1) {
  return {
    xp: Math.round(mission.xpReward * ratio),
    leafCoins: Math.round(mission.leafCoinReward * ratio),
    co2Saved: Math.round(mission.estimatedCO2Saving * ratio * 10) / 10
  };
}

async function awardDelta(userId: string, mission: any, userMission: any, targetRatio: number) {
  const target = rewardAmounts(mission, targetRatio);
  const already = {
    xp: userMission.xpAwarded ?? 0,
    leafCoins: userMission.leafCoinsAwarded ?? 0,
    co2Saved: userMission.co2SavedAwarded ?? 0
  };
  const delta = {
    xp: Math.max(0, target.xp - already.xp),
    leafCoins: Math.max(0, target.leafCoins - already.leafCoins),
    co2Saved: Math.max(0, Math.round((target.co2Saved - already.co2Saved) * 10) / 10)
  };
  if (!delta.xp && !delta.leafCoins && !delta.co2Saved) return { userMission, rewards: null, badges: [] };
  const user = await store.findUser(userId);
  if (!user) throw new Error("User not found");
  const xp = (user.xp ?? 0) + delta.xp;
  const co2Saved = Math.round(((user.co2Saved ?? 0) + delta.co2Saved) * 10) / 10;
  const totalCO2Saved = Math.round(((user.totalCO2Saved ?? 0) + delta.co2Saved) * 10) / 10;
  await store.updateUser(userId, {
    xp,
    level: levelFromXp(xp),
    leafCoins: (user.leafCoins ?? 0) + delta.leafCoins,
    ecoPoints: (user.ecoPoints ?? 0) + delta.xp,
    co2Saved,
    totalCO2Saved
  });
  const saved = await saveUserMission({
    ...userMission,
    status: "completed",
    progress: mission.targetCount,
    completedAt: userMission.completedAt ?? new Date(),
    rewardsClaimed: targetRatio >= 1,
    rewardStatus: targetRatio >= 1 ? "full_claimed" : "partial_claimed",
    xpReward: target.xp,
    leafCoinReward: target.leafCoins,
    co2SavedReward: target.co2Saved,
    xpAwarded: target.xp,
    leafCoinsAwarded: target.leafCoins,
    co2SavedAwarded: target.co2Saved
  });
  const badges = await badgeService.checkUnlocks(userId);
  if (targetRatio >= 1) await bossService.applyAction(userId, { source: "mission", sourceId: saved.id, title: `Completed mission: ${mission.title}`, damage: 10 });
  if (targetRatio >= 1) await battleProgressService.updateActiveBattlesForUser(userId, "mission", { sourceId: saved.id, co2Saved: delta.co2Saved || target.co2Saved, missionTitle: mission.title });
  return {
    userMission: saved,
    rewards: delta,
    badges
  };
}

function baseVerificationFor(mission: any, source: "self_check" | "eco_quest_match" | "proof") {
  if (source === "eco_quest_match") return { verificationStatus: "verified", trustScore: Math.max(70, mission.minimumTrustScore ?? 70) };
  if (source === "proof") return { verificationStatus: "verified", trustScore: Math.max(75, mission.minimumTrustScore ?? 75) };
  if (mission.verificationType === "self_check") return { verificationStatus: "not_required", trustScore: 40 };
  return { verificationStatus: "pending", trustScore: 40 };
}

async function completeWithPolicy(userId: string, mission: any, existing: any, source: "self_check" | "eco_quest_match" | "proof", verificationDetails: any = {}) {
  const verification = baseVerificationFor(mission, source);
  const completed = await saveUserMission({
    ...existing,
    status: "completed",
    progress: mission.targetCount,
    completedAt: existing.completedAt ?? new Date(),
    verificationStatus: verification.verificationStatus,
    trustScore: Math.max(existing.trustScore ?? 0, verification.trustScore),
    verificationDetails: { ...(existing.verificationDetails ?? {}), ...verificationDetails },
    rewardStatus: existing.rewardStatus ?? "not_claimed",
    rewardsClaimed: false
  });

  return { userMission: completed, rewards: null, badges: [] };
}

async function startOrCreate(userId: string, mission: any) {
  const period = periodFor(mission);
  const existing = await findUserMission(userId, mission, period);
  if (existing) return existing;
  return saveUserMission({
    id: randomUUID(),
    userId,
    missionId: mission.missionId,
    status: "in_progress",
    progress: 0,
    targetCount: mission.targetCount,
    startedAt: new Date(),
    dateKey: period.dateKey,
    weekKey: period.weekKey,
    rewardsClaimed: false,
    verificationStatus: mission.verificationRequired ? "pending" : "not_required",
    trustScore: 0,
    proofs: [],
    verificationDetails: {},
    rewardStatus: "not_claimed",
    xpAwarded: 0,
    leafCoinsAwarded: 0,
    co2SavedAwarded: 0
  });
}

function withStatus(mission: any, rows: any[]) {
  const period = periodFor(mission);
  const status = rows.find((row) => row.missionId === mission.missionId && matchesPeriod(row, mission, period));
  const userStatus = status?.status ?? "not_started";
  const verificationStatus = status?.verificationStatus ?? (mission.verificationRequired ? "pending" : "not_required");
  const rewardStatus = status?.rewardStatus ?? "not_claimed";
  const enriched = {
    ...mission,
    mission,
    userMission: status ?? null,
    status: userStatus,
    userStatus,
    progress: status?.progress ?? 0,
    targetCount: status?.targetCount ?? mission.targetCount,
    rewardsClaimed: status?.rewardsClaimed ?? false,
    completedAt: status?.completedAt,
    verificationStatus,
    trustScore: status?.trustScore ?? 0,
    proofInstructions: mission.proofInstructions,
    verificationType: mission.verificationType,
    verificationRequired: mission.verificationRequired,
    allowSelfCheckFallback: mission.allowSelfCheckFallback,
    rewardPolicy: mission.rewardPolicy,
    rewardStatus,
    xpAwarded: status?.xpAwarded ?? 0,
    leafCoinsAwarded: status?.leafCoinsAwarded ?? 0,
    co2SavedAwarded: status?.co2SavedAwarded ?? 0,
    proofs: status?.proofs ?? [],
    verificationDetails: status?.verificationDetails ?? {}
  };
  return {
    ...enriched,
    canStart: userStatus === "not_started",
    canComplete: userStatus === "in_progress",
    canClaimReward: userStatus === "completed" && rewardStatus !== "full_claimed" && ["verified", "not_required"].includes(verificationStatus)
  };
}

export const missionService = {
  async list(userId: string) {
    const [missions, rows] = await Promise.all([allMissions(), userMissionRows(userId)]);
    const enriched = missions.map((mission) => withStatus(mission, rows));
    return {
      daily: enriched.filter((mission) => mission.type === "daily"),
      weekly: enriched.filter((mission) => mission.type === "weekly"),
      special: enriched.filter((mission) => mission.type === "special")
    };
  },

  async recommended(userId: string) {
    const [missions, logs] = await Promise.all([allMissions(), store.dailyLogs(userId)]);
    const month = new Date().toISOString().slice(0, 7);
    const totals = { transport: 0, electricity: 0, food: 0, shopping_waste: 0, habit: 0 };
    for (const log of logs.filter((item: any) => item.date.startsWith(month))) {
      totals.transport += log.totals?.transportCO2 ?? log.transport?.co2 ?? 0;
      totals.electricity += log.totals?.electricityCO2 ?? log.electricity?.co2 ?? 0;
      totals.food += log.totals?.foodCO2 ?? log.food?.co2 ?? 0;
      totals.shopping_waste += log.totals?.shoppingWasteCO2 ?? log.shoppingWaste?.co2 ?? 0;
    }
    const highest = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
    const category = highest && highest[1] > 0 ? highest[0] : "habit";
    const rows = await userMissionRows(userId);
    return missions.filter((mission) => mission.category === category || (category === "habit" && mission.difficulty === "easy")).map((mission) => withStatus(mission, rows)).slice(0, 3);
  },

  async start(userId: string, missionId: string) {
    return startOrCreate(userId, await findMission(missionId));
  },

  async progress(userId: string, missionId: string, amount = 1, eventKey?: string) {
    const mission = await findMission(missionId);
    const existing = await startOrCreate(userId, mission);
    if (existing.status === "completed") return { userMission: existing, rewards: null, badges: [] };
    if (eventKey && (existing.progressEvents ?? []).includes(eventKey)) {
      return { userMission: existing, rewards: null, badges: [] };
    }
    const progress = Math.min(mission.targetCount, (existing.progress ?? 0) + amount);
    const progressEvents = eventKey ? [...(existing.progressEvents ?? []), eventKey] : existing.progressEvents;
    const saved = await saveUserMission({ ...existing, status: progress >= mission.targetCount ? "completed" : "in_progress", progress, progressEvents, completedAt: progress >= mission.targetCount ? new Date() : existing.completedAt });
    if (progress >= mission.targetCount) {
      const verificationDetails = {
        matchedEcoQuest: mission.verificationType === "eco_quest_match",
        matchedFields: mission.verificationType === "eco_quest_match" ? ["ecoQuest.progress"] : [],
        reason: mission.verificationType === "eco_quest_match" ? "Mission progress matched Eco Quest data." : "Mission progress completed.",
        verifiedAt: mission.verificationType === "eco_quest_match" ? new Date() : undefined
      };
      return completeWithPolicy(userId, mission, saved, mission.verificationType === "eco_quest_match" ? "eco_quest_match" : "self_check", verificationDetails);
    }
    return { userMission: saved, rewards: null, badges: [] };
  },

  async complete(userId: string, missionId: string) {
    const mission = await findMission(missionId);
    const existing = await startOrCreate(userId, mission);
    if (existing.status === "completed") return { userMission: existing, rewards: null, badges: [] };
    if (mission.verificationRequired && !mission.allowSelfCheckFallback && mission.verificationType !== "self_check") {
      const saved = await saveUserMission({
        ...existing,
        status: "in_progress",
        verificationStatus: "pending",
        trustScore: 0,
        verificationDetails: { reason: "Verified proof is required before this mission can be completed." }
      });
      return { userMission: saved, rewards: null, badges: [] };
    }
    return completeWithPolicy(userId, mission, { ...existing, progress: mission.targetCount, status: "completed", completedAt: new Date() }, "self_check", {
      matchedEcoQuest: false,
      matchedFields: [],
      reason: mission.rewardPolicy === "partial_reward_until_verified" ? "Self-check recorded. Upload proof or verify Eco Quest for full rewards." : "Trust-based action confirmed.",
      verifiedAt: mission.verificationType === "self_check" ? new Date() : undefined
    });
  },

  async verify(userId: string, missionId: string, date = dateKey()) {
    const mission = await findMission(missionId);
    const existing = await startOrCreate(userId, mission);
    const result = mission.type === "weekly"
      ? await missionVerificationService.verifyWeeklyEcoQuest(userId, mission.missionId, mission.targetCount)
      : await missionVerificationService.verifyMissionWithEcoQuest(userId, mission.missionId, date);
    const saved = await saveUserMission({
      ...existing,
      status: result.verified ? "completed" : existing.status,
      progress: result.verified ? mission.targetCount : existing.progress,
      completedAt: result.verified ? existing.completedAt ?? new Date() : existing.completedAt,
      verificationStatus: result.verified ? "verified" : "pending",
      trustScore: Math.max(existing.trustScore ?? 0, result.trustScore),
      verificationDetails: {
        matchedEcoQuest: result.verified,
        matchedFields: result.matchedFields,
        reason: result.reason,
        verifiedAt: result.verified ? new Date() : undefined
      }
    });
    return { userMission: saved, verification: result };
  },

  async recordProof(userId: string, missionId: string, proof: any) {
    const mission = await findMission(missionId);
    const existing = await startOrCreate(userId, mission);
    const proofType = proof.proofType ?? mission.verificationType;
    const trustScore = proof.trustScore ?? (proofType === "bill_or_receipt" ? 85 : 75);
    const verificationStatus = proof.validationStatus ?? (proof.validationResult === "rejected" ? "rejected" : proof.validationResult === "needs_review" ? "needs_review" : "verified");
    const verifiedAt = verificationStatus === "verified" ? new Date() : existing.verifiedAt;
    const rejectedAt = verificationStatus === "rejected" ? new Date() : existing.rejectedAt;
    const saved = await saveUserMission({
      ...existing,
      status: verificationStatus === "verified" ? "completed" : existing.status,
      progress: verificationStatus === "verified" ? mission.targetCount : existing.progress,
      completedAt: verificationStatus === "verified" ? existing.completedAt ?? new Date() : existing.completedAt,
      verificationStatus,
      trustScore,
      proofs: [...(existing.proofs ?? []), proof],
      verifiedAt,
      rejectedAt,
      verificationMessage: proof.validationMessage ?? proof.reviewerNote ?? "Proof uploaded for mission verification.",
      verificationDetails: {
        ...(existing.verificationDetails ?? {}),
        matchedEcoQuest: proof.proofMethod === "eco_quest_match",
        matchedFields: proof.matchedFields ?? [],
        reason: proof.validationMessage ?? proof.reviewerNote ?? "Proof uploaded for mission verification.",
        verifiedAt
      }
    });
    return { userMission: saved };
  },

  async claimReward(userId: string, missionId: string) {
    const mission = await findMission(missionId);
    const existing = await startOrCreate(userId, mission);
    if (existing.rewardStatus === "full_claimed") return { userMission: existing, rewards: null, badges: [] };
    if (existing.status !== "completed") return { userMission: existing, rewards: null, badges: [], message: "Complete the mission before claiming rewards." };
    if (existing.verificationStatus === "rejected") {
      return { userMission: existing, rewards: null, badges: [], message: "Proof was rejected. Upload mission-specific proof before claiming rewards." };
    }
    if (mission.rewardPolicy === "full_reward_only_after_verified" && existing.verificationStatus !== "verified") {
      return { userMission: existing, rewards: null, badges: [], message: "Proof pending verification." };
    }
    if (mission.rewardPolicy === "partial_reward_until_verified" && existing.verificationStatus !== "verified") {
      const reason = String(existing.verificationDetails?.reason ?? "").toLowerCase();
      if (!reason.includes("self-check")) {
        return { userMission: existing, rewards: null, badges: [], message: "Proof pending verification." };
      }
      return awardDelta(userId, mission, { ...existing, status: "completed", completedAt: existing.completedAt ?? new Date() }, 0.4);
    }
    return awardDelta(userId, mission, { ...existing, status: "completed", completedAt: existing.completedAt ?? new Date() }, 1);
  },

  async verificationStatus(userId: string, missionId: string) {
    const mission = await findMission(missionId);
    const row = await startOrCreate(userId, mission);
    return {
      mission,
      userMission: row,
      verificationStatus: row.verificationStatus,
      trustScore: row.trustScore,
      rewardStatus: row.rewardStatus,
      xpAwarded: row.xpAwarded,
      leafCoinsAwarded: row.leafCoinsAwarded,
      co2SavedAwarded: row.co2SavedAwarded
    };
  },

  async my(userId: string) {
    const rows = await userMissionRows(userId);
    return {
      active: rows.filter((row) => row.status === "in_progress"),
      completed: rows.filter((row) => row.status === "completed"),
      dailyCompletedToday: rows.filter((row) => row.status === "completed" && row.dateKey === dateKey()),
      weeklyProgress: rows.filter((row) => row.weekKey === weekKey())
    };
  },

  async summary(userId: string) {
    const [rows, recommended] = await Promise.all([userMissionRows(userId), this.recommended(userId)]);
    const completed = rows.filter((row) => row.status === "completed");
    return {
      completedToday: completed.filter((row) => row.dateKey === dateKey()).length,
      completedThisWeek: completed.filter((row) => row.weekKey === weekKey() || row.dateKey === dateKey()).length,
      totalCompleted: completed.length,
      activeMissions: rows.filter((row) => row.status === "in_progress").length,
      recommendedCount: recommended.length,
      xpEarnedFromMissions: completed.reduce((total, row) => total + (row.xpAwarded ?? row.xpReward ?? 0), 0),
      leafCoinsEarnedFromMissions: completed.reduce((total, row) => total + (row.leafCoinsAwarded ?? row.leafCoinReward ?? 0), 0),
      co2SavedFromMissions: Math.round(completed.reduce((total, row) => total + (row.co2SavedAwarded ?? row.co2SavedReward ?? 0), 0) * 10) / 10
    };
  },

  async handleEcoQuest(userId: string, log: any) {
    const updates = ["first-eco-quest", "5-day-eco-quest-streak"];
    const mode = log.transport?.mode;
    if (mode === "walking" || mode === "bicycle") updates.push("walk-one-short-trip");
    if (["bus", "metro", "train"].includes(mode)) updates.push("public-transport-choice", "three-public-transport-days");
    if ((log.electricity?.acHours ?? 0) <= 1) updates.push("reduce-ac-by-1-hour", "low-energy-week");
    if (log.food?.dietToday === "vegan" || log.food?.dietToday === "vegetarian") updates.push("plant-based-meal", "three-plant-based-meals");
    if (!log.food?.foodDeliveryToday) updates.push("avoid-food-delivery");
    if (!log.shoppingWaste?.onlineOrderToday) updates.push("no-online-shopping-today", "no-shopping-week");
    if (log.shoppingWaste?.plasticUsage === "low") updates.push("avoid-plastic-bottle");
    const results = [];
    for (const missionId of [...new Set(updates)]) {
      results.push(await this.progress(userId, missionId, 1, `eco-quest:${log.date}:${missionId}`));
    }
    await badgeService.checkUnlocks(userId);
    return results;
  },

  async handleProfileUpdate(userId: string, user: any) {
    const results = [];
    const filled = [user.displayName || user.name, user.city, user.collegeName, user.department, user.batch].filter(Boolean).length;
    if (user.collegeName && user.department) results.push(await this.complete(userId, "join-campus-carbon-league"));
    if (filled / 5 >= 0.8) results.push(await this.complete(userId, "complete-your-profile"));
    await badgeService.checkUnlocks(userId);
    return results;
  }
};
