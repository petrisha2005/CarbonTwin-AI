import { randomUUID } from "node:crypto";
import { Battle } from "../models/Battle.js";
import { BattleActivity } from "../models/BattleActivity.js";
import { levelFromXp } from "../utils/gamification.js";
import { gameMemory } from "./gameState.js";
import { isMongoEnabled, store } from "./store.js";

const goalFields: Record<string, string> = {
  most_co2_saved: "co2Saved",
  most_eco_quests: "ecoQuestsCompleted",
  most_missions_completed: "missionsCompleted",
  highest_eco_score: "score"
};

function generateCode() {
  return `ECO-${Math.random().toString(36).replace(/[^a-z0-9]/gi, "").slice(2, 7).toUpperCase()}`;
}

function statusFor(row: any) {
  if (row.status === "cancelled" || row.status === "completed") return row.status;
  const now = new Date();
  if (new Date(row.endDate) < now) return "completed";
  if (new Date(row.startDate) > now) return "upcoming";
  return "active";
}

function serialize(row: any) {
  const battleCode = row.battleCode ?? row.code;
  return {
    id: String(row._id ?? row.id),
    title: row.title,
    description: row.description ?? "",
    battleCode,
    code: battleCode,
    creatorId: String(row.creatorId),
    battleType: row.battleType ?? "group",
    goalType: row.goalType ?? "highest_eco_score",
    startDate: row.startDate,
    endDate: row.endDate,
    status: statusFor(row),
    maxParticipants: row.maxParticipants ?? 10,
    collegeName: row.collegeName ?? "",
    department: row.department ?? "",
    participants: row.participants ?? [],
    targetValue: row.targetValue ?? 3,
    winnerId: row.winnerId,
    rewardsGiven: row.rewardsGiven ?? false,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function serializeActivity(row: any) {
  return {
    id: String(row._id ?? row.id),
    battleId: String(row.battleId),
    userId: String(row.userId),
    sourceType: row.sourceType,
    sourceId: row.sourceId,
    actionTitle: row.actionTitle,
    co2Saved: row.co2Saved ?? 0,
    ecoQuestCount: row.ecoQuestCount ?? 0,
    missionCount: row.missionCount ?? 0,
    scoreAdded: row.scoreAdded ?? 0,
    createdAt: row.createdAt
  };
}

async function allBattles() {
  const rows = isMongoEnabled() ? await Battle.find({}).sort({ createdAt: -1 }) : gameMemory.battles;
  return rows.map(serialize);
}

async function save(row: any) {
  const id = row.id ?? row._id;
  const update = { ...row, battleCode: row.battleCode ?? row.code };
  delete update.id;
  delete update._id;
  if (isMongoEnabled()) {
    const saved = id ? await Battle.findByIdAndUpdate(id, update, { new: true }) : await Battle.create(update);
    return serialize(saved);
  }
  if (!row.id) row.id = randomUUID();
  row.battleCode = row.battleCode ?? row.code;
  const index = gameMemory.battles.findIndex((battle) => battle.id === row.id);
  if (index >= 0) gameMemory.battles[index] = { ...gameMemory.battles[index], ...row, updatedAt: new Date() };
  else gameMemory.battles.push({ ...row, createdAt: new Date(), updatedAt: new Date() });
  return serialize(index >= 0 ? gameMemory.battles[index] : gameMemory.battles.at(-1));
}

async function saveActivity(row: any) {
  if (isMongoEnabled()) {
    const existing = await BattleActivity.findOne({ battleId: row.battleId, userId: row.userId, sourceType: row.sourceType, sourceId: row.sourceId });
    if (existing) return null;
    return serializeActivity(await BattleActivity.create(row));
  }
  const existing = gameMemory.battleActivities.find((item: any) => item.battleId === row.battleId && item.userId === row.userId && item.sourceType === row.sourceType && item.sourceId === row.sourceId);
  if (existing) return null;
  const created = { id: randomUUID(), ...row, createdAt: new Date() };
  gameMemory.battleActivities.push(created);
  return serializeActivity(created);
}

async function activitiesFor(battleId: string) {
  const rows = isMongoEnabled()
    ? await BattleActivity.find({ battleId }).sort({ createdAt: -1 }).limit(30)
    : gameMemory.battleActivities.filter((item: any) => item.battleId === battleId).sort((a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 30);
  return rows.map(serializeActivity);
}

async function uniqueCode() {
  for (let i = 0; i < 20; i += 1) {
    const battleCode = generateCode();
    const exists = (await allBattles()).some((battle) => battle.battleCode === battleCode);
    if (!exists) return battleCode;
  }
  return `ECO-${randomUUID().slice(0, 5).toUpperCase()}`;
}

async function participantFor(userId: string) {
  const user = await store.findUser(userId);
  if (!user) throw new Error("User not found");
  return {
    userId,
    displayName: user.displayName || user.name || "Eco Player",
    joinedAt: new Date(),
    score: 0,
    co2Saved: 0,
    ecoQuestsCompleted: 0,
    missionsCompleted: 0,
    xpEarned: 0,
    leafCoinsEarned: 0
  };
}

async function enrich(battle: any, currentUserId?: string) {
  const users = await Promise.all((battle.participants ?? []).map((p: any) => store.findUser(p.userId)));
  const participants = (battle.participants ?? []).map((p: any, index: number) => ({ ...p, displayName: p.displayName || users[index]?.displayName || users[index]?.name || "Eco Player", user: users[index] }));
  const leaderboard = sortParticipants({ ...battle, participants });
  const currentUserRank = currentUserId ? leaderboard.find((row: any) => row.userId === currentUserId)?.rank ?? null : null;
  return { ...battle, participants, leaderboard, currentUserRank };
}

function sortParticipants(battle: any) {
  const field = goalFields[battle.goalType] ?? "score";
  return [...(battle.participants ?? [])]
    .sort((a: any, b: any) => Number(b[field] ?? 0) - Number(a[field] ?? 0) || Number(b.score ?? 0) - Number(a.score ?? 0))
    .map((row: any, index) => ({ ...row, rank: index + 1 }));
}

function dateFromDuration(input: any) {
  const start = input.startDate ? new Date(input.startDate) : new Date();
  let end = input.endDate ? new Date(input.endDate) : new Date(start);
  if (!input.endDate) {
    const days = input.duration === "1_day" ? 1 : input.duration === "7_days" ? 7 : Number(input.durationDays ?? 3);
    end.setUTCDate(end.getUTCDate() + days);
  }
  return { start, end };
}

async function markCompletedIfNeeded(battle: any) {
  if (battle.status === "completed" || battle.status === "cancelled") return battle;
  const nextStatus = statusFor(battle);
  if (nextStatus === battle.status) return battle;
  return save({ ...battle, status: nextStatus });
}

export const battleService = {
  async create(userId: string, input: any) {
    if (!input.title?.trim()) throw new Error("Battle title is required.");
    if (!input.goalType) throw new Error("Choose a battle goal.");
    if (!input.battleType) throw new Error("Choose a battle type.");
    const { start, end } = dateFromDuration(input);
    if (end <= start) throw new Error("End date must be after start date.");
    const maxParticipants = input.battleType === "one_v_one" ? 2 : Math.max(2, Number(input.maxParticipants ?? 10));
    const battleCode = await uniqueCode();
    const battle = await save({
      title: input.title.trim(),
      description: input.description ?? "",
      battleCode,
      code: battleCode,
      creatorId: userId,
      battleType: input.battleType,
      goalType: input.goalType,
      startDate: start,
      endDate: end,
      status: statusFor({ startDate: start, endDate: end, status: "active" }),
      maxParticipants,
      collegeName: input.collegeName ?? "",
      department: input.department ?? "",
      participants: [await participantFor(userId)],
      rewardsGiven: false
    });
    await saveActivity({ battleId: battle.id, userId, sourceType: "manual_join", sourceId: `${battle.id}:creator`, actionTitle: "Created the battle", scoreAdded: 0 });
    return { success: true, data: { battle: await enrich(battle, userId), battleCode }, message: "Battle created successfully." };
  },

  async my(userId: string) {
    const battles = await Promise.all((await allBattles()).filter((battle) => battle.creatorId === userId || battle.participants.some((p: any) => p.userId === userId)).map(markCompletedIfNeeded));
    const enriched = await Promise.all(battles.map((battle) => enrich(battle, userId)));
    return {
      activeBattles: enriched.filter((battle) => battle.status === "active"),
      upcomingBattles: enriched.filter((battle) => battle.status === "upcoming"),
      completedBattles: enriched.filter((battle) => battle.status === "completed" || battle.status === "cancelled"),
      battles: enriched
    };
  },

  async get(idOrCode: string, userId?: string) {
    const found = (await allBattles()).find((row) => row.id === idOrCode || row.battleCode === idOrCode || row.code === idOrCode);
    if (!found) throw new Error("Battle not found.");
    const battle = await markCompletedIfNeeded(found);
    if (userId && battle.creatorId !== userId && !battle.participants.some((p: any) => p.userId === userId)) throw new Error("You are not part of this battle.");
    return enrich(battle, userId);
  },

  async join(userId: string, battleCode: string) {
    if (!battleCode?.trim()) throw new Error("Battle code is required.");
    const battle = await this.get(battleCode.trim().toUpperCase());
    if (battle.status === "completed" || battle.status === "cancelled") throw new Error("This battle is no longer open.");
    if (battle.participants.some((p: any) => p.userId === userId)) throw new Error("You already joined this battle.");
    if (battle.participants.length >= battle.maxParticipants) throw new Error("This battle is already full.");
    battle.participants.push(await participantFor(userId));
    const saved = await save(battle);
    await saveActivity({ battleId: saved.id, userId, sourceType: "manual_join", sourceId: `${saved.id}:${userId}:join`, actionTitle: "Joined the battle", scoreAdded: 0 });
    return { success: true, data: await enrich(saved, userId), message: "You joined the battle." };
  },

  async leave(userId: string, id: string) {
    const battle = await this.get(id, userId);
    if (battle.status === "completed") throw new Error("Completed battles cannot be left.");
    if (battle.creatorId === userId) throw new Error("Creator cannot leave. Cancel the battle instead.");
    battle.participants = battle.participants.filter((p: any) => p.userId !== userId);
    return { success: true, data: await enrich(await save(battle), userId), message: "You left the battle." };
  },

  async cancel(userId: string, id: string) {
    const battle = await this.get(id, userId);
    if (battle.creatorId !== userId) throw new Error("Only the creator can cancel this battle.");
    if (battle.status === "completed") throw new Error("Completed battles cannot be cancelled.");
    const saved = await save({ ...battle, status: "cancelled" });
    await saveActivity({ battleId: saved.id, userId, sourceType: "system", sourceId: `${saved.id}:cancelled`, actionTitle: "Battle cancelled", scoreAdded: 0 });
    return { success: true, data: await enrich(saved, userId), message: "Battle cancelled." };
  },

  async leaderboard(id: string, userId?: string) {
    const battle = await this.get(id, userId);
    const leaderboard = sortParticipants(battle);
    return { leaderboard, currentUserRank: userId ? leaderboard.find((row: any) => row.userId === userId)?.rank ?? null : null };
  },

  async activity(id: string, userId?: string) {
    const battle = await this.get(id, userId);
    const rows = await activitiesFor(battle.id);
    const enriched = await Promise.all(rows.map(async (row) => ({ ...row, user: await store.findUser(row.userId) })));
    return { activities: enriched };
  },

  async finalize(id: string, userId?: string) {
    const battle = await this.get(id, userId);
    if (battle.status === "cancelled") return { success: true, data: battle, message: "Battle was cancelled." };
    const leaderboard = sortParticipants(battle);
    const winner = leaderboard[0];
    if (!battle.rewardsGiven) {
      for (const participant of battle.participants) {
        const user = await store.findUser(participant.userId);
        if (!user) continue;
        const isWinner = participant.userId === winner?.userId;
        const xp = (user.xp ?? 0) + (isWinner ? 150 : 50);
        await store.updateUser(participant.userId, {
          xp,
          level: levelFromXp(xp),
          leafCoins: (user.leafCoins ?? 0) + (isWinner ? 75 : 20),
          ecoPoints: (user.ecoPoints ?? 0) + (isWinner ? 150 : 50),
          badges: isWinner ? Array.from(new Set([...(user.badges ?? []), "Battle Winner"])) : user.badges
        });
      }
      await saveActivity({ battleId: battle.id, userId: winner?.userId ?? battle.creatorId, sourceType: "system", sourceId: `${battle.id}:finalized`, actionTitle: "Battle completed. Rewards distributed.", scoreAdded: 0 });
    }
    const saved = await save({ ...battle, status: "completed", winnerId: winner?.userId, rewardsGiven: true });
    return { success: true, data: await enrich(saved, userId), message: "Battle completed. Rewards unlocked." };
  },

  async applyProgress(userId: string, sourceType: "eco_quest" | "mission", sourceData: any) {
    const battles = (await allBattles()).filter((battle) => battle.status === "active" && battle.participants.some((p: any) => p.userId === userId) && new Date(battle.startDate) <= new Date() && new Date(battle.endDate) >= new Date());
    for (const battle of battles) {
      const co2Saved = Number(sourceData.co2Saved ?? 0);
      const scoreAdded = Math.round((co2Saved * 10 + (sourceType === "eco_quest" ? 20 : 15)) * 10) / 10;
      const activity = await saveActivity({
        battleId: battle.id,
        userId,
        sourceType,
        sourceId: String(sourceData.sourceId),
        actionTitle: sourceType === "eco_quest" ? "Completed Eco Quest" : `Completed Mission: ${sourceData.missionTitle ?? "Mission"}`,
        co2Saved,
        ecoQuestCount: sourceType === "eco_quest" ? 1 : 0,
        missionCount: sourceType === "mission" ? 1 : 0,
        scoreAdded
      });
      if (!activity) continue;
      battle.participants = battle.participants.map((p: any) => {
        if (p.userId !== userId) return p;
        return {
          ...p,
          score: Math.round(((p.score ?? 0) + scoreAdded) * 10) / 10,
          co2Saved: Math.round(((p.co2Saved ?? 0) + co2Saved) * 10) / 10,
          ecoQuestsCompleted: (p.ecoQuestsCompleted ?? 0) + (sourceType === "eco_quest" ? 1 : 0),
          missionsCompleted: (p.missionsCompleted ?? 0) + (sourceType === "mission" ? 1 : 0),
          xpEarned: (p.xpEarned ?? 0) + (sourceType === "eco_quest" ? 20 : 15),
          leafCoinsEarned: (p.leafCoinsEarned ?? 0) + (sourceType === "eco_quest" ? 10 : 8)
        };
      });
      await save(battle);
    }
  }
};
