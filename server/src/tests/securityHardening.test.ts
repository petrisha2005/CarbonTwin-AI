import assert from "node:assert/strict";
import test from "node:test";
import { createCorsOptions, productionClientOrigins } from "../config/cors.js";
import { assertProductionJwtSecret } from "../config/env.js";
import { validateElectricityBill } from "../services/electricityBillValidationService.js";
import { validateElectricityPaymentProof } from "../services/electricityPaymentValidationService.js";
import { setMongoEnabled, store } from "../services/store.js";
import { publicLeaderboardUser } from "../utils/leaderboardScore.js";

const testPassword = "ValidTestPassphrase123!";

test("production JWT secret validation rejects missing and weak values", () => {
  assert.throws(() => assertProductionJwtSecret(undefined, "production"), /JWT_SECRET is required/);
  assert.throws(() => assertProductionJwtSecret("short", "production"), /strong production secret/);
  assert.throws(() => assertProductionJwtSecret(["replace", "with", "a", "long", "random", "secret"].join("-"), "production"), /strong production secret/);
  assert.doesNotThrow(() => assertProductionJwtSecret("strong-production-secret-value-1234567890", "production"));
  assert.doesNotThrow(() => assertProductionJwtSecret(undefined, "development"));
});

test("production CORS config allows only configured origins and never wildcard origins", async () => {
  const options = createCorsOptions("https://carbon-twin-ai-client.vercel.app", "production");
  assert.notEqual(options.origin, "*");
  assert.ok(productionClientOrigins.includes("https://carbon-twin-ai-client.vercel.app"));

  await new Promise<void>((resolve, reject) => {
    if (typeof options.origin !== "function") return reject(new Error("Expected CORS origin callback"));
    options.origin("https://carbon-twin-ai-client.vercel.app", (error, allow) => {
      try {
        assert.equal(error, null);
        assert.equal(allow, true);
        resolve();
      } catch (assertionError) {
        reject(assertionError);
      }
    });
  });

  await new Promise<void>((resolve, reject) => {
    if (typeof options.origin !== "function") return reject(new Error("Expected CORS origin callback"));
    options.origin("https://malicious.example", (error, allow) => {
      try {
        assert.ok(error);
        assert.equal(allow, undefined);
        resolve();
      } catch (assertionError) {
        reject(assertionError);
      }
    });
  });
});

test("public user responses do not expose passwordHash", async () => {
  setMongoEnabled(false);
  const user = await store.createUser({
    name: "Security User",
    email: `security-${Date.now()}@example.com`,
    password: testPassword
  });

  assert.equal(Object.hasOwn(user, "passwordHash"), false);
  assert.equal(Object.hasOwn(publicLeaderboardUser({ ...user, passwordHash: "hashed-value" }, 1), "passwordHash"), false);
});

test("invalid upload text is rejected before extraction is trusted", () => {
  assert.equal(validateElectricityBill("Resume JavaScript projects and education history").isElectricityBill, false);
  assert.equal(validateElectricityPaymentProof("UPI transfer successful INR 200 paid to restaurant").isValid, false);
});
