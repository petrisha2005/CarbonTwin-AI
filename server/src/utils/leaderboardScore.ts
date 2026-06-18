import { ecoTitleForLevel } from "./twinLogic.js";

export function ecoScore(user: any) {
  return Math.round(
    (Number(user.totalCO2Saved ?? user.co2Saved ?? 0) * 10) +
      (Number(user.xp ?? 0) * 0.5) +
      (Number(user.currentStreak ?? 0) * 20) +
      (Number(user.totalLoggedDays ?? 0) * 5)
  );
}

export function periodScore(input: { co2Saved: number; logsCount: number; xpEarned: number; period: "weekly" | "monthly" }) {
  const logWeight = input.period === "weekly" ? 20 : 10;
  return Math.round((input.co2Saved * 10) + (input.logsCount * logWeight) + (input.xpEarned * 0.5));
}

export function displayNameFor(user: any) {
  const value = String(user.displayName || user.name || "Eco Explorer").trim();
  return value.split(/\s+/)[0] || "Eco Explorer";
}

export function publicLeaderboardUser(user: any, rank: number, score = ecoScore(user)) {
  return {
    rank,
    userId: String(user.id),
    displayName: displayNameFor(user),
    city: user.city ?? "",
    collegeName: user.collegeName ?? "",
    department: user.department ?? "",
    batch: user.batch ?? "",
    avatarColor: user.avatarColor ?? "#22c55e",
    level: Number(user.level ?? 1),
    ecoTitle: ecoTitleForLevel(Number(user.level ?? 1)),
    totalCO2Saved: Number(user.totalCO2Saved ?? user.co2Saved ?? 0),
    xp: Number(user.xp ?? 0),
    leafCoins: Number(user.leafCoins ?? 0),
    currentStreak: Number(user.currentStreak ?? 0),
    totalLoggedDays: Number(user.totalLoggedDays ?? 0),
    ecoScore: score
  };
}
