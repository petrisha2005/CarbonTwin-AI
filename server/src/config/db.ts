import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  if (!env.mongoUri) {
    console.warn("MONGODB_URI missing. Using development-only in-memory persistence.");
    return false;
  }

  try {
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    if (env.nodeEnv === "production") throw error;
    console.warn("MongoDB connection failed. Using development-only in-memory persistence.", error);
    return false;
  }
}
