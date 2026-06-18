import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? "development";
const jwtSecret = process.env.JWT_SECRET;
const unsafeProductionSecrets = new Set([
  "secret",
  "test-secret",
  "dev-secret",
  "your-secret",
  ["replace", "with", "a", "long", "random", "secret"].join("-"),
  "your_long_random_secret",
  ["dev", "only", "change", "me"].join("-")
]);

export function assertProductionJwtSecret(secret: string | undefined, activeNodeEnv: string) {
  if (activeNodeEnv !== "production") return;
  if (!secret) {
    throw new Error("JWT_SECRET is required in production.");
  }
  if (secret.length < 32 || unsafeProductionSecrets.has(secret)) {
    throw new Error("JWT_SECRET must be a strong production secret.");
  }
}

assertProductionJwtSecret(jwtSecret, nodeEnv);

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: jwtSecret ?? "local-development-jwt-secret-do-not-use-in-production",
  geminiApiKey: process.env.GEMINI_API_KEY,
  clientOrigin: process.env.CLIENT_URL ?? process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  nodeEnv
};
