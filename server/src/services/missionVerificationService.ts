import { store } from "./store.js";

const todayKey = () => new Date().toISOString().slice(0, 10);

function startOfWeekKey(date = new Date()) {
  const day = new Date(`${date.toISOString().slice(0, 10)}T00:00:00.000Z`);
  const weekday = day.getUTCDay();
  day.setUTCDate(day.getUTCDate() + (weekday === 0 ? -6 : 1 - weekday));
  return day.toISOString().slice(0, 10);
}

function verified(trustScore: number, matchedFields: string[], reason: string) {
  return { verified: true, trustScore, matchedFields, reason };
}

function notVerified(reason: string, matchedFields: string[] = []) {
  return { verified: false, trustScore: matchedFields.length ? 55 : 0, matchedFields, reason };
}

function actionIds(log: any) {
  return new Set((log?.ecoActions ?? []).map((action: any) => action.actionId));
}

export const missionVerificationService = {
  async verifyMissionWithEcoQuest(userId: string, missionId: string, date = todayKey()) {
    const log = await store.dailyLogByDate(userId, date);
    if (!log) return notVerified("No Eco Quest log found for this date.");
    const actions = actionIds(log);

    if (missionId === "walk-one-short-trip") {
      const ok = ["walking", "bicycle"].includes(log.transport?.mode) && Number(log.transport?.distanceKm ?? 0) > 0;
      return ok ? verified(85, ["transport.mode", "transport.distanceKm"], "Matched walking or bicycle travel in Eco Quest.") : notVerified("Eco Quest does not show walking or bicycle travel.");
    }

    if (missionId === "public-transport-choice" || missionId === "three-public-transport-days") {
      const ok = ["bus", "metro", "train"].includes(log.transport?.mode);
      return ok ? verified(85, ["transport.mode"], "Matched public transport in Eco Quest.") : notVerified("Eco Quest does not show bus, metro, or train.");
    }

    if (missionId === "reduce-ac-by-1-hour" || missionId === "low-energy-week") {
      const lowAc = Number(log.electricity?.acHours ?? 99) <= 1;
      const action = actions.has("switched-off-appliances");
      if (lowAc && action) return verified(85, ["electricity.acHours", "ecoActions"], "Matched low AC use and appliance action.");
      if (lowAc) return verified(75, ["electricity.acHours"], "Matched low AC usage in Eco Quest.");
      if (action) return verified(70, ["ecoActions"], "Matched switched-off-appliances Eco Action.");
      return notVerified("Eco Quest does not show reduced AC or switched-off appliance action.");
    }

    if (missionId === "plant-based-meal" || missionId === "three-plant-based-meals") {
      const plant = ["vegan", "vegetarian"].includes(log.food?.dietToday);
      const action = actions.has("plant-based-meal");
      if (plant && action) return verified(85, ["food.dietToday", "ecoActions"], "Matched plant-based food and Eco Action.");
      if (plant) return verified(75, ["food.dietToday"], "Matched plant-based food choice in Eco Quest.");
      if (action) return verified(75, ["ecoActions"], "Matched plant-based Eco Action.");
      return notVerified("Eco Quest does not show a plant-based meal yet.");
    }

    if (missionId === "avoid-food-delivery") {
      return log.food?.foodDeliveryToday === false
        ? verified(80, ["food.foodDeliveryToday"], "Matched no food delivery in Eco Quest.")
        : notVerified("Eco Quest still shows food delivery for this date.");
    }

    if (missionId === "no-online-shopping-today" || missionId === "no-shopping-week") {
      return log.shoppingWaste?.onlineOrderToday === false
        ? verified(80, ["shoppingWaste.onlineOrderToday"], "Matched no online shopping in Eco Quest.")
        : notVerified("Eco Quest still shows an online order for this date.");
    }

    if (missionId === "avoid-plastic-bottle") {
      const action = actions.has("avoided-plastic-bottle");
      const lowPlastic = log.shoppingWaste?.plasticUsage === "low";
      if (action && lowPlastic) return verified(85, ["ecoActions", "shoppingWaste.plasticUsage"], "Matched avoided plastic bottle and low plastic usage.");
      if (action) return verified(75, ["ecoActions"], "Matched avoided-plastic-bottle Eco Action.");
      if (lowPlastic) return verified(70, ["shoppingWaste.plasticUsage"], "Matched low plastic usage in Eco Quest.");
      return notVerified("Eco Quest does not show low plastic usage or avoided bottle action.");
    }

    if (missionId === "first-eco-quest") {
      return verified(80, ["dailyLog"], "Matched completed Eco Quest.");
    }

    return notVerified("This mission does not have an Eco Quest rule yet.");
  },

  async verifyWeeklyEcoQuest(userId: string, missionId: string, targetCount: number) {
    const weekStart = startOfWeekKey();
    const logs = (await store.dailyLogs(userId)).filter((log: any) => String(log.date) >= weekStart);
    let matches = 0;
    const fields = new Set<string>();
    for (const log of logs) {
      const result = await this.verifyMissionWithEcoQuest(userId, missionId, log.date);
      if (result.verified) {
        matches += 1;
        result.matchedFields.forEach((field) => fields.add(field));
      }
    }
    if (matches >= targetCount) return verified(85, [...fields], `Matched ${matches}/${targetCount} Eco Quest days this week.`);
    return notVerified(`Matched ${matches}/${targetCount} Eco Quest days this week.`, [...fields]);
  }
};
