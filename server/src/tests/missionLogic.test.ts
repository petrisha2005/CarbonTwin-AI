import assert from "node:assert/strict";
import test from "node:test";
import { defaultMissions, gamificationMemory } from "../services/gamificationState.js";
import { seedGamification } from "../services/seedGamificationService.js";
import { missionService } from "../services/missionService.js";
import { validateMissionProof } from "../services/missionProofValidationService.js";
import { setMongoEnabled, store } from "../services/store.js";

async function testUser(label: string) {
  setMongoEnabled(false);
  await seedGamification();
  gamificationMemory.userMissions = [];
  gamificationMemory.userBadges = [];
  return store.createUser({
    name: `Mission ${label}`,
    email: `mission-${label}-${Date.now()}@example.com`,
    password: "secret123"
  });
}

test("mission service starts a mission once for the active period", async () => {
  const user = await testUser("start");
  const first = await missionService.start(user.id, "switch-off-unused-appliances");
  const second = await missionService.start(user.id, "switch-off-unused-appliances");

  assert.equal(first.status, "in_progress");
  assert.equal(second.id, first.id);
});

test("mission progress updates without immediately claiming rewards", async () => {
  const user = await testUser("progress");
  const result = await missionService.progress(user.id, "switch-off-unused-appliances", 1, "unit-progress");

  assert.equal(result.userMission.status, "completed");
  assert.equal(result.userMission.progress, 1);
  assert.equal(result.rewards, null);
  assert.equal(result.userMission.rewardStatus, "not_claimed");
});

test("mission completion supports reward claim and prevents duplicate rewards", async () => {
  const user = await testUser("claim");
  const completed = await missionService.complete(user.id, "switch-off-unused-appliances");
  const claimed = await missionService.claimReward(user.id, "switch-off-unused-appliances");
  const duplicate = await missionService.claimReward(user.id, "switch-off-unused-appliances");

  assert.equal(completed.userMission.status, "completed");
  assert.deepEqual(claimed.rewards, { xp: 20, leafCoins: 10, co2Saved: 0.8 });
  assert.equal(duplicate.rewards, null);
  assert.equal(duplicate.userMission.rewardStatus, "full_claimed");
});

test("recommended missions do not auto-start user mission rows", async () => {
  const user = await testUser("recommended");
  const recommended = await missionService.recommended(user.id);
  const mine = await missionService.my(user.id);

  assert.ok(recommended.length > 0);
  assert.deepEqual(mine.active, []);
  assert.deepEqual(mine.completed, []);
});

test("Eco Quest data can verify and complete a matching mission", async () => {
  const user = await testUser("ecoquest");
  const { log } = await store.upsertDailyLog(user.id, {
    date: new Date().toISOString().slice(0, 10),
    transport: { mode: "bus", distanceKm: 6, numberOfTrips: 2 },
    electricity: { electricityKwhToday: 2, acHours: 0, fanHours: 2 },
    food: { dietToday: "vegetarian", foodDeliveryToday: false, packagedFoodToday: false },
    shoppingWaste: { onlineOrderToday: false, clothingPurchaseToday: false, plasticUsage: "low", recycledToday: false },
    ecoActionIds: ["public-transport"]
  });

  await missionService.handleEcoQuest(user.id, log);
  const status = await missionService.verificationStatus(user.id, "public-transport-choice");

  assert.equal(status.userMission.status, "completed");
  assert.equal(status.verificationStatus, "verified");
  assert.ok(status.trustScore >= 70);
});

test("Eco Quest verifies no shopping and no food delivery missions", async () => {
  const user = await testUser("ecoquest-no-shopping");
  const { log } = await store.upsertDailyLog(user.id, {
    date: new Date().toISOString().slice(0, 10),
    transport: { mode: "walking", distanceKm: 0, numberOfTrips: 0 },
    electricity: { electricityKwhToday: 2, acHours: 0, fanHours: 2 },
    food: { dietToday: "vegetarian", foodDeliveryToday: false, packagedFoodToday: false },
    shoppingWaste: { onlineOrderToday: false, clothingPurchaseToday: false, plasticUsage: "low", recycledToday: false },
    ecoActionIds: []
  });

  await missionService.handleEcoQuest(user.id, log);
  const noShopping = await missionService.verificationStatus(user.id, "no-online-shopping-today");
  const noDelivery = await missionService.verificationStatus(user.id, "avoid-food-delivery");

  assert.equal(noShopping.verificationStatus, "verified");
  assert.equal(noDelivery.verificationStatus, "verified");
});

test("wrong proof method is rejected for missions requiring verified Eco Quest proof", async () => {
  const user = await testUser("reject-proof");
  const mission = defaultMissions.find((item) => item.missionId === "public-transport-choice")!;
  const result = await validateMissionProof({
    mission,
    userMission: {},
    userId: user.id,
    proofMethod: "self_check"
  });

  assert.equal(result.verificationStatus, "rejected");
  assert.match(result.rejectionReason, /Self-check not allowed/);
});
