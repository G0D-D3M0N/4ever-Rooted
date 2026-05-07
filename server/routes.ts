import type { Express } from "express";
import type { Server } from "http";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, getClerkUserId, isAdminUser } from "./auth";
import {
  validate,
  requireNumericId,
  submitResourceSchema,
  progressToggleSchema,
  adminUpdateResourceSchema,
  bulkActionSchema,
  createRoadmapSchema,
  updateRoadmapSchema,
  createRoadmapStepSchema,
  updateRoadmapStepSchema,
} from "./validation";
import { buildFmhySeedItems } from "@shared/fmhy-ingest";

// ── Rate limiters ─────────────────────────────────────────────────────────────

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
  skip: (req) => !!getClerkUserId(req),
});

const submitResourceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many resource submissions. Please wait an hour before submitting again." },
  keyGenerator: (req) => getClerkUserId(req) ?? ipKeyGenerator(req.ip || "0.0.0.0"),
});

const voteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please slow down." },
  keyGenerator: (req) => getClerkUserId(req) ?? ipKeyGenerator(req.ip || "0.0.0.0"),
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many search requests. Please slow down." },
});

const progressLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many progress updates. Please slow down." },
  keyGenerator: (req) => getClerkUserId(req) ?? ipKeyGenerator(req.ip || "0.0.0.0"),
});

/** FMHY importer (see `@shared/fmhy-ingest`). Default cap is raised for bulk community imports. */
async function seedFromFMHY(): Promise<{ inserted: number; skipped: number; total: number }> {
  const toInsert = await buildFmhySeedItems({ maxLinks: 8000 });
  const inserted = await storage.bulkCreateResources(toInsert as any);
  return { inserted, skipped: toInsert.length - inserted, total: toInsert.length };
}

// ── Route registration ────────────────────────────────────────────────────────

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  setupAuth(app);
  app.use("/api", globalLimiter);

  // ── Resources ──────────────────────────────────────────────────────────────

  app.get(api.resources.list.path, async (req, res) => {
    const category = req.query.category as string;
    const search = req.query.search as string;
    const recent = req.query.recent === "true";
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

    if (page && limit) {
      const result = await storage.getResourcesPaginated(page, limit, category, search);
      return res.json(result);
    }

    let resources;
    if (recent) {
      resources = await storage.getRecentResources(5);
    } else {
      resources = await storage.getResources();
    }

    if (category && category !== "All") {
      resources = resources.filter(r => r.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      resources = resources.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    }

    res.json(resources);
  });

  app.post(
    api.resources.list.path,
    submitResourceLimiter,
    validate(submitResourceSchema),
    async (req, res) => {
      try {
        const userId = getClerkUserId(req);
        if (!userId) return res.status(401).json({ message: "Sign in to submit resources." });

        const urlExists = await storage.resourceUrlExists(req.body.url);
        if (urlExists) {
          return res.status(409).json({ message: "Resource with this URL already submitted." });
        }

        const resource = await storage.createResource({
          ...req.body,
          submittedBy: userId,
          status: "pending",
        });
        res.status(201).json(resource);
      } catch (err) {
        console.error("[submit resource] error:", err);
        const msg = err instanceof Error ? err.message : String(err);
        res.status(500).json({ message: `Failed to submit resource: ${msg}` });
      }
    }
  );

  app.post("/api/resources/:id/vote", requireNumericId, voteLimiter, async (req, res) => {
    const userId = getClerkUserId(req);
    if (!userId) return res.status(401).json({ message: "Sign in to vote." });
    const id = Number(req.params.id);
    const result = await storage.toggleVote(id, userId);
    res.json(result);
  });

  app.get("/api/resources/:id/vote", requireNumericId, async (req, res) => {
    const userId = getClerkUserId(req);
    if (!userId) return res.json({ voted: false });
    const id = Number(req.params.id);
    const voted = await storage.hasUserVoted(id, userId);
    res.json({ voted });
  });

  // ── Admin — Resources ──────────────────────────────────────────────────────

  app.get("/api/admin/resources/pending", async (req, res) => {
    if (!isAdminUser(req)) return res.status(403).json({ message: "Admin only." });
    const pending = await storage.getPendingResources();
    res.json(pending);
  });

  app.get("/api/admin/resources/all", async (req, res) => {
    if (!isAdminUser(req)) return res.status(403).json({ message: "Admin only." });
    const all = await storage.getAllResources();
    res.json(all);
  });

  app.patch(
    "/api/admin/resources/:id/approve",
    requireNumericId,
    async (req, res) => {
      if (!isAdminUser(req)) return res.status(403).json({ message: "Admin only." });
      const id = Number(req.params.id);
      const resource = await storage.approveResource(id);
      if (!resource) return res.status(404).json({ message: "Resource not found." });
      if (resource.submittedBy) {
        await storage.createNotification({
          userId: resource.submittedBy,
          type: "approved",
          message: `Your resource "${resource.title}" was approved and is now live!`,
          resourceId: resource.id,
        });
      }
      res.json(resource);
    }
  );

  app.patch(
    "/api/admin/resources/:id",
    requireNumericId,
    validate(adminUpdateResourceSchema),
    async (req, res) => {
      if (!isAdminUser(req)) return res.status(403).json({ message: "Admin only." });
      const id = Number(req.params.id);
      const updated = await storage.updateResource(id, req.body);
      if (!updated) return res.status(404).json({ message: "Resource not found." });
      res.json(updated);
    }
  );

  app.delete("/api/admin/resources/:id", requireNumericId, async (req, res) => {
    if (!isAdminUser(req)) return res.status(403).json({ message: "Admin only." });
    const id = Number(req.params.id);
    const allRes = await storage.getAllResources();
    const resource = allRes.find(r => r.id === id);
    await storage.deleteResource(id);
    if (resource?.submittedBy) {
      await storage.createNotification({
        userId: resource.submittedBy,
        type: "rejected",
        message: `Your resource "${resource.title}" was removed by an admin.`,
      });
    }
    res.json({ message: "Deleted." });
  });

  app.post(
    "/api/admin/resources/bulk-action",
    validate(bulkActionSchema),
    async (req, res) => {
      if (!isAdminUser(req)) return res.status(403).json({ message: "Admin only." });
      const { action, ids } = req.body as { action: "approve" | "delete"; ids: number[] };
      if (action === "approve") {
        await storage.bulkApproveResources(ids);
      } else {
        await storage.bulkDeleteResources(ids);
      }
      res.json({ message: "Done.", count: ids.length });
    }
  );

  // ── Admin — FMHY Seed ──────────────────────────────────────────────────────

  app.post("/api/admin/seed-fmhy", async (req, res) => {
    if (!isAdminUser(req)) return res.status(403).json({ message: "Admin only." });
    // Allow up to 3 minutes for the full fetch + parse + DB insert cycle
    req.setTimeout(180_000);
    res.setTimeout(180_000);
    try {
      const result = await seedFromFMHY();
      res.json({
        message: `Import complete. Inserted ${result.inserted} new resources, skipped ${result.skipped} duplicates.`,
        ...result,
      });
    } catch (err: any) {
      console.error("[seed-fmhy] error:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: err.message || "Failed to import from FMHY." });
      }
    }
  });

  // ── Admin — Roadmaps ───────────────────────────────────────────────────────

  app.post(
    "/api/admin/roadmaps",
    validate(createRoadmapSchema),
    async (req, res) => {
      if (!isAdminUser(req)) return res.status(403).json({ message: "Admin only." });
      try {
        const roadmap = await storage.createRoadmapWithSteps(req.body);
        res.status(201).json(roadmap);
      } catch (err: any) {
        const isProd = process.env.NODE_ENV === "production";
        res.status(400).json({
          message: isProd ? "Failed to create roadmap." : (err.message || "Failed to create roadmap."),
        });
      }
    }
  );

  app.patch(
    "/api/admin/roadmaps/:id",
    requireNumericId,
    validate(updateRoadmapSchema),
    async (req, res) => {
      if (!isAdminUser(req)) return res.status(403).json({ message: "Admin only." });
      const id = Number(req.params.id);
      const updated = await storage.updateRoadmap(id, req.body);
      if (!updated) return res.status(404).json({ message: "Roadmap not found." });
      res.json(updated);
    }
  );

  app.delete("/api/admin/roadmaps/:id", requireNumericId, async (req, res) => {
    if (!isAdminUser(req)) return res.status(403).json({ message: "Admin only." });
    const id = Number(req.params.id);
    await storage.deleteRoadmap(id);
    res.json({ message: "Roadmap deleted." });
  });

  app.post(
    "/api/admin/roadmaps/:id/steps",
    requireNumericId,
    validate(createRoadmapStepSchema),
    async (req, res) => {
      if (!isAdminUser(req)) return res.status(403).json({ message: "Admin only." });
      const roadmapId = Number(req.params.id);
      const step = await storage.createRoadmapStep({ ...req.body, roadmapId });
      res.status(201).json(step);
    }
  );

  app.patch(
    "/api/admin/roadmap-steps/:id",
    requireNumericId,
    validate(updateRoadmapStepSchema),
    async (req, res) => {
      if (!isAdminUser(req)) return res.status(403).json({ message: "Admin only." });
      const id = Number(req.params.id);
      const updated = await storage.updateRoadmapStep(id, req.body);
      if (!updated) return res.status(404).json({ message: "Step not found." });
      res.json(updated);
    }
  );

  app.delete("/api/admin/roadmap-steps/:id", requireNumericId, async (req, res) => {
    if (!isAdminUser(req)) return res.status(403).json({ message: "Admin only." });
    const id = Number(req.params.id);
    await storage.deleteRoadmapStep(id);
    res.json({ message: "Step deleted." });
  });

  // ── Roadmaps (public) ──────────────────────────────────────────────────────

  app.get(api.roadmaps.list.path, async (_req, res) => {
    const roadmaps = await storage.getRoadmaps();
    res.json(roadmaps);
  });

  app.get(api.roadmaps.get.path, requireNumericId, async (req, res) => {
    const id = Number(req.params.id);
    const roadmap = await storage.getRoadmap(id);
    if (!roadmap) return res.status(404).json({ message: "Roadmap not found" });
    const steps = await storage.getRoadmapSteps(id);
    res.json({ ...roadmap, steps });
  });

  // ── Progress ───────────────────────────────────────────────────────────────

  app.get(api.progress.list.path, async (req, res) => {
    const userId = getClerkUserId(req);
    if (!userId) return res.json([]);
    const progress = await storage.getUserProgress(userId);
    res.json(progress);
  });

  app.post(
    api.progress.toggle.path,
    progressLimiter,
    validate(progressToggleSchema),
    async (req, res) => {
      const userId = getClerkUserId(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });
      const { stepId, completed } = req.body;
      const progress = await storage.toggleUserProgress(userId, stepId, completed);
      res.json(progress);
    }
  );

  // ── Path Progress ──────────────────────────────────────────────────────────

  app.get("/api/path-progress", async (req, res) => {
    const userId = getClerkUserId(req);
    if (!userId) return res.json({});
    const progress = await storage.getPathProgress(userId);
    res.json(progress);
  });

  app.post("/api/path-progress", progressLimiter, async (req, res) => {
    const userId = getClerkUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const { pathId, phaseIndex, completed } = req.body;
    if (typeof pathId !== "string" || typeof phaseIndex !== "number" || typeof completed !== "boolean") {
      return res.status(400).json({ message: "Invalid request body" });
    }
    await storage.togglePathProgress(userId, pathId, phaseIndex, completed);
    res.json({ ok: true });
  });

  // ── Notifications ──────────────────────────────────────────────────────────

  app.get("/api/notifications", async (req, res) => {
    const userId = getClerkUserId(req);
    if (!userId) return res.json([]);
    const notifs = await storage.getNotifications(userId);
    res.json(notifs);
  });

  app.patch("/api/notifications/:id/read", requireNumericId, async (req, res) => {
    const userId = getClerkUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const id = Number(req.params.id);
    await storage.markNotificationRead(id, userId);
    res.json({ message: "Marked as read." });
  });

  app.patch("/api/notifications/read-all", async (req, res) => {
    const userId = getClerkUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    await storage.markAllNotificationsRead(userId);
    res.json({ message: "All marked as read." });
  });

  // ── Profile ────────────────────────────────────────────────────────────────

  app.get("/api/profile", async (req, res) => {
    const userId = getClerkUserId(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const profile = await storage.getProfile(userId);
    res.json(profile);
  });

  // ── Leaderboard (public) ───────────────────────────────────────────────────

  app.get("/api/leaderboard", async (_req, res) => {
    const data = await storage.getLeaderboard();
    res.json(data);
  });

  // ── Changelog ─────────────────────────────────────────────────────────────

  app.get("/api/changelog", async (_req, res) => {
    const changelog = await storage.getChangelog(15);
    res.json(changelog);
  });

  // ── Global search ──────────────────────────────────────────────────────────

  app.get("/api/search", searchLimiter, async (req, res) => {
    const q = ((req.query.q as string) || "").trim().slice(0, 200);
    if (!q || q.length < 2) return res.json({ resources: [], roadmaps: [] });
    const results = await storage.globalSearch(q);
    res.json(results);
  });

  // ── Stats (public) ─────────────────────────────────────────────────────────

  app.get("/api/stats", async (_req, res) => {
    const [allResources, allRoadmaps] = await Promise.all([
      storage.getResources(),
      storage.getRoadmaps(),
    ]);
    res.json({
      resourceCount: allResources.length,
      roadmapCount: allRoadmaps.length,
    });
  });

  // ── Current user ───────────────────────────────────────────────────────────

  app.get(api.user.me.path, (req, res) => {
    const userId = getClerkUserId(req);
    if (!userId) return res.json(null);
    res.json({ id: userId, isAdmin: isAdminUser(req) });
  });

  return httpServer;
}
