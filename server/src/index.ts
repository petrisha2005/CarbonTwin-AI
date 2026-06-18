import cors from "cors";
import express from "express";
import morgan from "morgan";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.js";
import { badgesRouter } from "./routes/badges.js";
import { battlesRouter } from "./routes/battles.js";
import { bossRouter } from "./routes/boss.js";
import { budgetRoutes } from "./routes/budgetRoutes.js";
import { carbonRouter } from "./routes/carbon.js";
import { coachRouter } from "./routes/coach.js";
import { carbonWrappedRouter } from "./routes/carbonWrapped.js";
import { dailyLogsRouter } from "./routes/dailyLogs.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { electricityRouter } from "./routes/electricity.js";
import { ecoQuestRouter } from "./routes/ecoQuest.js";
import { leaderboardRouter } from "./routes/leaderboard.js";
import { missionsRouter } from "./routes/missions.js";
import { onboardingRouter } from "./routes/onboarding.js";
import { profileRouter } from "./routes/profile.js";
import { shopRouter } from "./routes/shop.js";
import { twinRouter } from "./routes/twin.js";
import { worldRouter } from "./routes/world.js";
import { setMongoEnabled } from "./services/store.js";
import { seedGamification } from "./services/seedGamificationService.js";
import { shopService } from "./services/shopService.js";

const app = express();
const developmentOrigins = env.nodeEnv === "production" ? [] : ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"];
const allowedOrigins = new Set([env.clientOrigin, ...developmentOrigins]);

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
if (env.nodeEnv !== "test") app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "CarbonTwin AI" }));
app.use("/api/auth", authRouter);
app.use("/api/badges", badgesRouter);
app.use("/api/battles", battlesRouter);
app.use("/api/boss", bossRouter);
app.use("/api/budget", budgetRoutes);
app.use("/api/carbon", carbonRouter);
app.use("/api/daily-logs", dailyLogsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/electricity", electricityRouter);
app.use("/api/eco-quest", ecoQuestRouter);
app.use("/api/carbon-wrapped", carbonWrappedRouter);
app.use("/api/missions", missionsRouter);
app.use("/api/onboarding", onboardingRouter);
app.use("/api/profile", profileRouter);
app.use("/api/shop", shopRouter);
app.use("/api/coach", coachRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/twin", twinRouter);
app.use("/api/world", worldRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

const mongoEnabled = await connectDatabase();
setMongoEnabled(mongoEnabled);
await seedGamification();
await shopService.seed();

app.listen(env.port, () => {
  console.log(`CarbonTwin AI API running on http://localhost:${env.port}/api`);
});
