import { clerkMiddleware, getAuth } from "@clerk/express";
import type { Express, Request, Response, NextFunction } from "express";

const ADMIN_USER_IDS = ((process.env.CLERK_ADMIN_USER_IDS || "").split(",").map(s => s.trim()).filter(Boolean).concat(["user_3DEBNJHXs8q2p8a8QCz71eq5vXy"]));

export function setupAuth(app: Express) {
  app.use(clerkMiddleware());
}

export function getClerkUserId(req: Request): string | null {
  try {
    const { userId } = getAuth(req);
    return userId ?? null;
  } catch {
    return null;
  }
}

export function isAdminUser(req: Request): boolean {
  const userId = getClerkUserId(req);
  if (!userId) return false;
  return ADMIN_USER_IDS.includes(userId);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = getClerkUserId(req);
  if (!userId) return res.status(401).json({ message: "Sign in required." });
  next();
}
