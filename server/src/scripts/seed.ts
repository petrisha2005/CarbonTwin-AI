import { connectDatabase } from "../config/db.js";
import { seedGamification } from "../services/seedGamificationService.js";
import { setMongoEnabled } from "../services/store.js";

const mongoEnabled = await connectDatabase();
setMongoEnabled(mongoEnabled);
await seedGamification();
console.log("Gamification seed complete.");
