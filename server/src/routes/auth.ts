import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { store } from "../services/store.js";
import { missionService } from "../services/missionService.js";

export const authRouter = express.Router();

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  city: z.string().optional().default(""),
  collegeName: z.string().optional().default(""),
  department: z.string().optional().default(""),
  batch: z.string().optional().default("")
});

function tokenFor(id: string) {
  return jwt.sign({ id }, env.jwtSecret, { expiresIn: "7d" });
}

function authPayload(user: any, token?: string) {
  return {
    success: true,
    ...(token ? { token } : {}),
    user,
    data: { user }
  };
}

authRouter.post("/signup", async (req, res) => {
  try {
    const input = signupSchema.parse(req.body);
    const user = await store.createUser(input);
    res.status(201).json(authPayload(user, tokenFor(user.id)));
  } catch (error: any) {
    res.status(400).json({ message: error.message ?? "Signup failed" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const input = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
    const user = await store.validateUser(input.email, input.password);
    if (!user) return res.status(401).json({ message: "Invalid email or password" });
    res.json(authPayload(user, tokenFor(user.id)));
  } catch {
    res.status(400).json({ message: "Login failed" });
  }
});

authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await store.findUser(req.user!.id);
  res.json(authPayload(user));
});

authRouter.patch("/me", requireAuth, async (req: AuthedRequest, res) => {
  const input = z
    .object({
      city: z.string().optional(),
      country: z.string().optional(),
      bio: z.string().max(400).optional(),
      displayName: z.string().max(80).optional(),
      avatarColor: z.string().max(30).optional(),
      collegeName: z.string().optional(),
      department: z.string().optional(),
      batch: z.string().optional(),
      climateGoal: z.string().max(120).optional(),
      goals: z.record(z.any()).optional(),
      preferences: z.record(z.any()).optional(),
      privacy: z.record(z.any()).optional()
    })
    .parse(req.body);
  const user = await store.updateUser(req.user!.id, input);
  if (user) await missionService.handleProfileUpdate(req.user!.id, user);
  const updated = await store.findUser(req.user!.id);
  res.json(authPayload(updated));
});
