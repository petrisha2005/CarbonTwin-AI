import { avatarMoodMessage, carbonEquivalents, treeStageForLevel, type AvatarMood } from "./gamification.js";

const personalityDescriptions = {
  "Travel Burner": "Your lifestyle impact mainly comes from travel. Your fastest improvement path is smarter commuting.",
  "Energy Drainer": "Your footprint is mostly driven by energy usage. Small electricity-saving habits can create visible impact.",
  "Food Impacter": "Food choices are shaping most of your footprint. Balanced meal choices can reduce impact without changing your life completely.",
  "Fast Fashioner": "Shopping and waste habits are your biggest impact area. Reuse, repair, and mindful buying can help quickly.",
  "Eco Balancer": "Your carbon footprint is fairly balanced. You can improve steadily across multiple areas.",
  "Not enough data yet": "Complete your first Eco Quest to reveal your CarbonTwin personality."
};

const treeDescriptions = {
  Seed: "Your climate journey has started. Complete Eco Quests to help your tree grow.",
  Sprout: "Your first habits are forming. Your CarbonTwin Tree is beginning to grow.",
  "Small Plant": "Your consistent actions are creating visible impact.",
  "Young Tree": "Your CarbonTwin Tree is growing strong with your eco streaks.",
  "Big Tree": "Your climate habits are becoming powerful and consistent.",
  "Forest Guardian Tree": "You have built a strong low-carbon lifestyle. Your CarbonTwin Tree is fully thriving."
};

const evolutionStages = ["Not Awakened", "Awakening Twin", "Learning Twin", "Growing Twin", "Adaptive Twin", "Climate Intelligence Twin"];

export function ecoTitleForLevel(level: number) {
  if (level >= 15) return "CarbonTwin Legend";
  if (level >= 10) return "Forest Guardian";
  if (level >= 8) return "Planet Protector";
  if (level >= 6) return "Climate Challenger";
  if (level >= 4) return "Carbon Cutter";
  if (level >= 2) return "Green Starter";
  return "Eco Seed";
}

export function xpProgress(xp: number) {
  const level = Math.floor(xp / 100) + 1;
  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel = level * 100;
  const xpProgressPercent = Math.max(0, Math.min(100, ((xp - xpForCurrentLevel) / 100) * 100));
  return { level, xpForCurrentLevel, xpForNextLevel, xpProgressPercent };
}

export function treeDetails(level: number) {
  const treeStage = treeStageForLevel(level);
  const nextTreeStage =
    level < 2 ? "Sprout" :
    level < 4 ? "Small Plant" :
    level < 6 ? "Young Tree" :
    level < 8 ? "Big Tree" :
    level < 10 ? "Forest Guardian Tree" :
    "Fully grown";
  return {
    treeStage,
    treeStageDescription: treeDescriptions[treeStage as keyof typeof treeDescriptions],
    nextTreeStage
  };
}

export function evolutionForLoggedDays(totalLoggedDays: number) {
  if (totalLoggedDays === 0) {
    return { evolutionStage: "Not Awakened", nextEvolutionGoal: "Complete your first Eco Quest to awaken your CarbonTwin." };
  }
  if (totalLoggedDays <= 3) {
    return { evolutionStage: "Awakening Twin", nextEvolutionGoal: `Log ${Math.max(0, 4 - totalLoggedDays)} more Eco Quest(s) to evolve into Learning Twin.` };
  }
  if (totalLoggedDays <= 7) {
    return { evolutionStage: "Learning Twin", nextEvolutionGoal: `Log ${Math.max(0, 8 - totalLoggedDays)} more Eco Quest(s) to evolve into Growing Twin.` };
  }
  if (totalLoggedDays <= 14) {
    return { evolutionStage: "Growing Twin", nextEvolutionGoal: `Log ${Math.max(0, 15 - totalLoggedDays)} more Eco Quest(s) to evolve into Adaptive Twin.` };
  }
  if (totalLoggedDays <= 30) {
    return { evolutionStage: "Adaptive Twin", nextEvolutionGoal: `Log ${Math.max(0, 31 - totalLoggedDays)} more Eco Quest(s) to evolve into Climate Intelligence Twin.` };
  }
  return { evolutionStage: "Climate Intelligence Twin", nextEvolutionGoal: "Keep your climate intelligence alive with daily Eco Quests." };
}

export function allEvolutionStages() {
  return evolutionStages;
}

export function avatarMoodFromToday(todayLog: any | null): AvatarMood {
  if (!todayLog) return "tired";
  if ((todayLog.netCO2 ?? 0) <= 5) return "calm";
  if ((todayLog.co2Saved ?? 0) > 0 && (todayLog.netCO2 ?? 0) <= 8) return "glowing";
  if ((todayLog.netCO2 ?? 0) > 15) return "polluted";
  return "happy";
}

export function personalityFromCategories(categories: { name: string; value: number }[]) {
  if (!categories.some((item) => item.value > 0)) {
    return {
      personalityType: "Not enough data yet",
      personalityDescription: personalityDescriptions["Not enough data yet"],
      mainImpactCategory: "No data yet"
    };
  }
  const sorted = [...categories].sort((a, b) => b.value - a.value);
  const top = sorted[0];
  const second = sorted[1];
  const balanced = !second || top.value - second.value <= Math.max(1, top.value * 0.12);
  if (balanced) {
    return {
      personalityType: "Eco Balancer",
      personalityDescription: personalityDescriptions["Eco Balancer"],
      mainImpactCategory: "Balanced"
    };
  }
  const type =
    top.name === "Transport" ? "Travel Burner" :
    top.name === "Electricity" ? "Energy Drainer" :
    top.name === "Food" ? "Food Impacter" :
    "Fast Fashioner";
  return {
    personalityType: type,
    personalityDescription: personalityDescriptions[type as keyof typeof personalityDescriptions],
    mainImpactCategory: top.name
  };
}

export function weeklyStatus(logsCount: number, co2Saved: number) {
  if (logsCount >= 5 && co2Saved > 5) {
    return { status: "excellent", message: "You're having a strong eco week. Your CarbonTwin is thriving." };
  }
  if (logsCount >= 3) {
    return { status: "good", message: "You're building momentum. A few more Eco Quests can level up your week." };
  }
  if (logsCount >= 1) {
    return { status: "needs_attention", message: "You've started this week. Complete more quests to keep your CarbonTwin active." };
  }
  return { status: "inactive", message: "Your CarbonTwin has been quiet this week. Start with one easy Eco Quest." };
}

export function twinMessage(input: {
  name: string;
  todayLog: any | null;
  currentStreak: number;
  personalityType: string;
  avatarMood: AvatarMood;
  weeklySaved: number;
}) {
  if (!input.todayLog) return `Hey ${input.name}, I'm waiting for today's Eco Quest. One tiny action is enough.`;
  if (input.currentStreak >= 7) return "Your streak is powerful. You're turning sustainability into a habit.";
  if (input.personalityType === "Travel Burner") return "Your next best move is simple: replace one short trip this week.";
  if (input.avatarMood === "polluted") return "No guilt today. Let's choose one small action tomorrow and balance it.";
  if (input.weeklySaved > 5) return "You saved meaningful carbon this week. Your CarbonTwin is proud.";
  return "Take care of your CarbonTwin, and your CarbonTwin helps you take care of the planet.";
}

export { avatarMoodMessage, carbonEquivalents };
