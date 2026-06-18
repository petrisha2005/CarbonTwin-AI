import assert from "node:assert/strict";
import test from "node:test";
import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { setMongoEnabled, store } from "../services/store.js";

function mockResponse() {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    }
  };
  return response as Response & typeof response;
}

test("JWT signed with app secret authenticates protected requests", async () => {
  setMongoEnabled(false);
  const user = await store.createUser({
    name: "Auth User",
    email: `auth-${Date.now()}@example.com`,
    password: "secret123"
  });
  const token = jwt.sign({ id: user.id }, env.jwtSecret, { expiresIn: "7d" });
  const req = { headers: { authorization: `Bearer ${token}` } } as AuthedRequest;
  const res = mockResponse();
  let nextCalled = false;
  const next: NextFunction = () => {
    nextCalled = true;
  };

  await requireAuth(req, res, next);

  assert.equal(nextCalled, true);
  assert.deepEqual(req.user, { id: user.id });
});

test("protected route rejects missing and invalid tokens", async () => {
  const missingReq = { headers: {} } as AuthedRequest;
  const missingRes = mockResponse();
  await requireAuth(missingReq, missingRes, (() => undefined) as NextFunction);

  assert.equal(missingRes.statusCode, 401);
  assert.deepEqual(missingRes.body, { message: "Missing auth token" });

  const invalidReq = { headers: { authorization: "Bearer invalid-token" } } as AuthedRequest;
  const invalidRes = mockResponse();
  await requireAuth(invalidReq, invalidRes, (() => undefined) as NextFunction);

  assert.equal(invalidRes.statusCode, 401);
  assert.deepEqual(invalidRes.body, { message: "Invalid auth token" });
});

test("saved daily logs are isolated by userId and duplicate dates update instead of duplicating", async () => {
  setMongoEnabled(false);
  const firstUser = await store.createUser({
    name: "Persistence One",
    email: `persist-one-${Date.now()}@example.com`,
    password: "secret123"
  });
  const secondUser = await store.createUser({
    name: "Persistence Two",
    email: `persist-two-${Date.now()}@example.com`,
    password: "secret123"
  });
  const dailyInput = {
    date: "2026-06-18",
    transport: { mode: "walking" as const, distanceKm: 1, numberOfTrips: 1 },
    electricity: { electricityKwhToday: 2, acHours: 0, fanHours: 2 },
    food: { dietToday: "vegetarian" as const, foodDeliveryToday: false, packagedFoodToday: false },
    shoppingWaste: { onlineOrderToday: false, clothingPurchaseToday: false, plasticUsage: "low" as const, recycledToday: false },
    ecoActionIds: []
  };

  const created = await store.upsertDailyLog(firstUser.id, dailyInput);
  const updated = await store.upsertDailyLog(firstUser.id, { ...dailyInput, electricity: { ...dailyInput.electricity, electricityKwhToday: 4 } });
  await store.upsertDailyLog(secondUser.id, dailyInput);

  const firstLogs = await store.dailyLogs(firstUser.id);
  const secondLogs = await store.dailyLogs(secondUser.id);

  assert.equal(created.updated, false);
  assert.equal(updated.updated, true);
  assert.equal(firstLogs.length, 1);
  assert.equal(secondLogs.length, 1);
  assert.notEqual(firstLogs[0].userId, secondLogs[0].userId);
  assert.equal(firstLogs[0].electricity.electricityKwhToday, 4);
});
