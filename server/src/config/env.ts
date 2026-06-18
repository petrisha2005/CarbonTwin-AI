import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? "development";
const jwtSecret = process.env.JWT_SECRET;

if (nodeEnv === "production" && !jwtSecret) {
  throw new Error("JWT_SECRET is required in production.");
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: jwtSecret ?? "dev-only-change-me",
  geminiApiKey: process.env.GEMINI_API_KEY,
  clientOrigin: process.env.CLIENT_URL ?? process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  nodeEnv
};
