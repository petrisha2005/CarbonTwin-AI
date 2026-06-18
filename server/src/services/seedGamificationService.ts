import { Badge } from "../models/Badge.js";
import { Mission } from "../models/Mission.js";
import { defaultBadges, defaultMissions, gamificationMemory } from "./gamificationState.js";
import { isMongoEnabled } from "./store.js";

export async function seedGamification() {
  if (!isMongoEnabled()) {
    gamificationMemory.missions = [...defaultMissions];
    gamificationMemory.badges = [...defaultBadges];
    return;
  }

  for (const mission of defaultMissions) {
    await Mission.findOneAndUpdate(
      { missionId: mission.missionId },
      { ...mission, estimatedSaving: mission.estimatedCO2Saving, points: mission.xpReward, isActive: mission.active },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }
  for (const badge of defaultBadges) {
    await Badge.findOneAndUpdate({ badgeId: badge.badgeId }, badge, { upsert: true, setDefaultsOnInsert: true });
  }
}
