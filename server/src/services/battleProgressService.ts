import { battleService } from "./battleService.js";

export const battleProgressService = {
  updateActiveBattlesForUser(userId: string, sourceType: "eco_quest" | "mission", sourceData: any) {
    return battleService.applyProgress(userId, sourceType, sourceData);
  }
};
