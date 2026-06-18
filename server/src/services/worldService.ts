import { bossService } from "./bossService.js";
import { shopService } from "./shopService.js";
import { store } from "./store.js";

function stageFor(level: number) {
  if (level >= 10) return { name: "CarbonTwin Forest", description: "A full glowing eco world.", elements: ["Tree", "River", "Sky", "Animals", "Solar house", "Garden", "Clean air aura"] };
  if (level >= 8) return { name: "Green Valley", description: "Animals return under a cleaner sky.", elements: ["Tree", "River", "Animals", "Clean sky", "Forest"] };
  if (level >= 6) return { name: "Clean Village", description: "A solar home joins your growing world.", elements: ["Tree", "River", "Solar house"] };
  if (level >= 4) return { name: "Eco Park", description: "Plants spread and a river begins to flow.", elements: ["Plants", "Small river"] };
  if (level >= 2) return { name: "Sprout Garden", description: "Soft grass and a small plant appear.", elements: ["Sprout", "Grass"] };
  return { name: "Seed Land", description: "A small seed waits for better choices.", elements: ["Seed", "Empty land"] };
}

export const worldService = {
  async get(userId: string) {
    const [user, summary, boss, equipped] = await Promise.all([store.findUser(userId), store.dailySummary(userId), bossService.current(userId), shopService.equipped(userId)]);
    if (!user) throw new Error("User not found");
    const today = summary.todayLog;
    const weeklySaved = summary.weeklyTrend.reduce((total: number, item: any) => total + (item.saved ?? 0), 0);
    return {
      user,
      stage: stageFor(user.level ?? 1),
      behavior: {
        loggedToday: Boolean(today),
        highCarbonDay: (today?.netCO2 ?? 0) > 15,
        goldenAura: (user.currentStreak ?? 0) >= 7,
        animalsAppear: weeklySaved >= 5,
        weeklyCO2Saved: Math.round(weeklySaved * 10) / 10
      },
      stats: {
        level: user.level ?? 1,
        streak: user.currentStreak ?? 0,
        totalCO2Saved: user.totalCO2Saved ?? user.co2Saved ?? 0,
        leafCoins: user.leafCoins ?? 0
      },
      boss,
      equippedItems: equipped.equippedItems
    };
  }
};
