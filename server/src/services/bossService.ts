import { randomUUID } from "node:crypto";
import { WeeklyBossFight } from "../models/WeeklyBossFight.js";
import { levelFromXp } from "../utils/gamification.js";
import { weekKey } from "../utils/weekKey.js";
import { gameMemory, monsterNames } from "./gameState.js";
import { isMongoEnabled, store } from "./store.js";

function monsterFor(key: string) {
  return monsterNames[Math.abs([...key].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % monsterNames.length];
}

function serialize(row: any) {
  return {
    id: String(row._id ?? row.id),
    userId: String(row.userId),
    weekKey: row.weekKey,
    monsterName: row.monsterName,
    maxHP: row.maxHP ?? 100,
    currentHP: row.currentHP ?? 100,
    damageDealt: row.damageDealt ?? 0,
    defeated: row.defeated ?? false,
    rewardsClaimed: row.rewardsClaimed ?? false,
    actions: row.actions ?? []
  };
}

async function save(row: any) {
  const update = { ...row };
  delete update.id;
  delete update._id;
  if (isMongoEnabled()) {
    const saved = await WeeklyBossFight.findOneAndUpdate({ userId: row.userId, weekKey: row.weekKey }, update, { upsert: true, new: true });
    return serialize(saved);
  }
  const index = gameMemory.bosses.findIndex((item) => item.userId === row.userId && item.weekKey === row.weekKey);
  if (index >= 0) gameMemory.bosses[index] = { ...gameMemory.bosses[index], ...row, updatedAt: new Date() };
  else gameMemory.bosses.push({ id: randomUUID(), ...row, createdAt: new Date(), updatedAt: new Date() });
  return serialize(index >= 0 ? gameMemory.bosses[index] : gameMemory.bosses.at(-1));
}

export const bossService = {
  async current(userId: string) {
    const key = weekKey();
    const existing = isMongoEnabled()
      ? await WeeklyBossFight.findOne({ userId, weekKey: key })
      : gameMemory.bosses.find((boss) => boss.userId === userId && boss.weekKey === key);
    if (existing) return serialize(existing);
    return save({ userId, weekKey: key, monsterName: monsterFor(key), maxHP: 100, currentHP: 100, damageDealt: 0, defeated: false, rewardsClaimed: false, actions: [] });
  },

  async applyAction(userId: string, input: { source: string; title: string; damage: number; sourceId?: string }) {
    const boss = await this.current(userId);
    if (boss.defeated) return boss;
    if (input.sourceId && boss.actions.some((action: any) => action.source === input.source && action.sourceId === input.sourceId)) return boss;
    const damage = Math.max(0, Math.min(100, input.damage));
    const nextHP = Math.max(0, boss.currentHP - damage);
    return save({
      ...boss,
      currentHP: nextHP,
      damageDealt: boss.damageDealt + damage,
      defeated: nextHP === 0,
      actions: [{ ...input, damage, date: new Date() }, ...boss.actions].slice(0, 20)
    });
  },

  async claimReward(userId: string) {
    const boss = await this.current(userId);
    if (!boss.defeated) throw new Error("Boss is not defeated yet");
    if (boss.rewardsClaimed) return { boss, rewards: null };
    const user = await store.findUser(userId);
    if (!user) throw new Error("User not found");
    const xp = (user.xp ?? 0) + 100;
    await store.updateUser(userId, {
      xp,
      level: levelFromXp(xp),
      leafCoins: (user.leafCoins ?? 0) + 50,
      badges: [...new Set([...(user.badges ?? []), "Carbon Monster Slayer"])]
    });
    const updated = await save({ ...boss, rewardsClaimed: true });
    return { boss: updated, rewards: { xp: 100, leafCoins: 50, badge: "Carbon Monster Slayer" }, user: await store.findUser(userId) };
  }
};
