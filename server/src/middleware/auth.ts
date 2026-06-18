import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { store } from "../services/store.js";

export type AuthedRequest = Request & { user?: { id: string } };

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing auth token" });

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { id: string };
    const user = await store.findUser(payload.id);
    if (!user) return res.status(401).json({ message: "Invalid auth token" });
    req.user = { id: payload.id };
    next();
  } catch {
    res.status(401).json({ message: "Invalid auth token" });
  }
}
