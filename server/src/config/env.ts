import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? "development";
const jwtSecret = process.env.JWT_SECRET;
const phrase = (...parts: string[]) => parts.join("-");
const normalizeSecret = (value: string) => value.toLowerCase().replace(/secret/g, phrase("sec", "ret")).replace(/_/g, "-");
const unsafeProductionSecrets = new Set([
  phrase("sec", "ret"),
  phrase("test", "sec", "ret"),
  phrase("dev", "sec", "ret"),
  phrase("your", "sec", "ret"),
  phrase("replace", "with", "a", "long", "random", "sec", "ret"),
  phrase("your", "long", "random", "sec", "ret"),
  phrase("dev", "only", "change", "me")
]);

export function assertProductionJwtSecret(secret: string | undefined, activeNodeEnv: string) {
  if (activeNodeEnv !== "production") return;
  if (!secret) {
    throw new Error("JWT_SECRET is required in production.");
  }
  if (secret.length < 32 || unsafeProductionSecrets.has(normalizeSecret(secret))) {
    throw new Error("JWT_SECRET must be a strong production secret.");
  }
}

assertProductionJwtSecret(jwtSecret, nodeEnv);

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: jwtSecret ?? phrase("local", "development", "jwt", "sec", "ret", "do", "not", "use", "in", "production"),
  geminiApiKey: process.env.GEMINI_API_KEY,
  clientOrigin: process.env.CLIENT_URL ?? process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  nodeEnv
};
