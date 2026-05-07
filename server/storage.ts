import { db } from "./db";
import {
  resources, roadmaps, roadmapSteps, userProgress, resourceVotes, notifications, pathProgress,
  type Resource, type Roadmap, type RoadmapStep, type UserProgress,
  type InsertResource, type Notification, type PathProgress,
} from "@shared/schema";
import { eq, and, desc, like, or, sql, inArray } from "drizzle-orm";

export interface IStorage {
  getResources(): Promise<Resource[]>;
  getAllResources(): Promise<Resource[]>;
  getRecentResources(limit: number): Promise<Resource[]>;
  getResourcesByCategory(category: string): Promise<Resource[]>;
  getPendingResources(): Promise<Resource[]>;
  getResourcesPaginated(page: number, limit: number, category?: string, search?: string): Promise<{ resources: Resource[]; total: number }>;
  createResource(resource: InsertResource): Promise<Resource>;
  approveResource(id: number): Promise<Resource | undefined>;
  rejectResource(id: number): Promise<void>;
  deleteResource(id: number): Promise<void>;
  updateResource(id: number, data: Partial<InsertResource>): Promise<Resource | undefined>;
  bulkApproveResources(ids: number[]): Promise<void>;
  bulkDeleteResources(ids: number[]): Promise<void>;

  getRoadmaps(): Promise<Roadmap[]>;
  getRoadmap(id: number): Promise<Roadmap | undefined>;
  getRoadmapSteps(roadmapId: number): Promise<RoadmapStep[]>;
  deleteRoadmap(id: number): Promise<void>;
  createRoadmap(roadmap: any): Promise<Roadmap>;
  updateRoadmap(id: number, data: Partial<any>): Promise<Roadmap | undefined>;
  createRoadmapStep(step: any): Promise<RoadmapStep>;
  updateRoadmapStep(id: number, data: Partial<any>): Promise<RoadmapStep | undefined>;
  deleteRoadmapStep(id: number): Promise<void>;
  createRoadmapWithSteps(data: any): Promise<Roadmap>;

  getUserProgress(userId: string): Promise<UserProgress[]>;
  toggleUserProgress(userId: string, stepId: number, completed: boolean): Promise<UserProgress>;

  getPathProgress(userId: string): Promise<Record<string, number[]>>;
  togglePathProgress(userId: string, pathId: string, phaseIndex: number, completed: boolean): Promise<void>;

  toggleVote(resourceId: number, userId: string): Promise<{ voted: boolean; votes: number }>;
  hasUserVoted(resourceId: number, userId: string): Promise<boolean>;

  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(data: { userId: string; type: string; message: string; resourceId?: number }): Promise<Notification>;
  markNotificationRead(id: number, userId: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;

  getProfile(userId: string): Promise<any>;
  getChangelog(limit: number): Promise<any>;
  globalSearch(query: string): Promise<{ resources: Resource[]; roadmaps: Roadmap[] }>;

  getLeaderboard(): Promise<{
    topSubmitters: Array<{ userId: string; count: number; approvedCount: number }>;
    topResources: Resource[];
    stats: { totalResources: number; totalVotes: number; totalSubmitters: number };
  }>;

  resourceUrlExists(url: string): Promise<boolean>;
  bulkCreateResources(items: InsertResource[]): Promise<number>;
}

function safeParseJsonArray(value: unknown): any {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Keep API resilient if legacy rows contain non-JSON text.
    return [];
  }
}

function parseResource(r: Resource): Resource {
  return { ...r, tags: safeParseJsonArray(r.tags) };
}

export class DatabaseStorage implements IStorage {
  async getResources(): Promise<Resource[]> {
    const res = await db.select().from(resources).where(eq(resources.status, "approved"));
    return res.map(parseResource);
  }

  async getResourcesPaginated(page: number, limit: number, category?: string, search?: string): Promise<{ resources: Resource[]; total: number }> {
    const offset = (page - 1) * limit;
    const dbConditions: any[] = [eq(resources.status, "approved")];
    if (category && category !== "All") dbConditions.push(eq(resources.category, category));
    if (search) dbConditions.push(or(like(resources.title, `%${search}%`), like(resources.description, `%${search}%`)));
    const where = and(...dbConditions);

    const [rows, [{ count }]] = await Promise.all([
      db.select().from(resources).where(where).orderBy(desc(resources.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(resources).where(where),
    ]);

    return { resources: rows.map(parseResource), total: Number(count) };
  }

  async getRecentResources(limit: number): Promise<Resource[]> {
    const res = await db.select().from(resources)
      .where(eq(resources.status, "approved"))
      .orderBy(desc(resources.createdAt))
      .limit(limit);
    return res.map(parseResource);
  }

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    const res = await db.select().from(resources)
      .where(and(eq(resources.category, category), eq(resources.status, "approved")));
    return res.map(parseResource);
  }

  async getPendingResources(): Promise<Resource[]> {
    const res = await db.select().from(resources)
      .where(eq(resources.status, "pending"))
      .orderBy(desc(resources.createdAt));
    return res.map(parseResource);
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const [res] = await db.insert(resources).values({
      ...resource,
      tags: resource.tags ? JSON.stringify(resource.tags) : null,
    }).returning();
    return parseResource(res);
  }

  async approveResource(id: number): Promise<Resource | undefined> {
    const [res] = await db.update(resources)
      .set({ status: "approved" })
      .where(eq(resources.id, id))
      .returning();
    return res ? parseResource(res) : undefined;
  }

  async getAllResources(): Promise<Resource[]> {
    const res = await db.select().from(resources)
      .where(eq(resources.status, "approved"))
      .orderBy(desc(resources.createdAt));
    return res.map(parseResource);
  }

  async rejectResource(id: number): Promise<void> {
    await db.delete(resources).where(eq(resources.id, id));
  }

  async deleteResource(id: number): Promise<void> {
    await db.delete(resources).where(eq(resources.id, id));
  }

  async updateResource(id: number, data: Partial<InsertResource>): Promise<Resource | undefined> {
    const update: any = { ...data };
    if (data.tags && Array.isArray(data.tags)) {
      update.tags = JSON.stringify(data.tags);
    }
    const [res] = await db.update(resources).set(update).where(eq(resources.id, id)).returning();
    return res ? parseResource(res) : undefined;
  }

  async bulkApproveResources(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await db.update(resources).set({ status: "approved" }).where(inArray(resources.id, ids));
  }

  async bulkDeleteResources(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await db.delete(resources).where(inArray(resources.id, ids));
  }

  async getRoadmaps(): Promise<Roadmap[]> {
    return await db.select().from(roadmaps).orderBy(desc(roadmaps.createdAt));
  }

  async getRoadmap(id: number): Promise<Roadmap | undefined> {
    const [roadmap] = await db.select().from(roadmaps).where(eq(roadmaps.id, id));
    return roadmap;
  }

  async getRoadmapSteps(roadmapId: number): Promise<RoadmapStep[]> {
    const steps = await db.select().from(roadmapSteps)
      .where(eq(roadmapSteps.roadmapId, roadmapId))
      .orderBy(roadmapSteps.order);
    return steps.map(s => ({ ...s, resources: safeParseJsonArray(s.resources) }));
  }

  async deleteRoadmap(id: number): Promise<void> {
    const steps = await db.select().from(roadmapSteps).where(eq(roadmapSteps.roadmapId, id));
    const stepIds = steps.map(s => s.id);
    if (stepIds.length > 0) {
      await db.delete(userProgress).where(inArray(userProgress.stepId, stepIds));
    }
    await db.delete(roadmapSteps).where(eq(roadmapSteps.roadmapId, id));
    await db.delete(roadmaps).where(eq(roadmaps.id, id));
  }

  async createRoadmap(roadmap: any): Promise<Roadmap> {
    const [r] = await db.insert(roadmaps).values(roadmap).returning();
    return r;
  }

  async updateRoadmap(id: number, data: Partial<any>): Promise<Roadmap | undefined> {
    const [r] = await db.update(roadmaps).set(data).where(eq(roadmaps.id, id)).returning();
    return r;
  }

  async createRoadmapStep(step: any): Promise<RoadmapStep> {
    const [s] = await db.insert(roadmapSteps).values({
      ...step,
      resources: step.resources ? JSON.stringify(step.resources) : null,
    }).returning();
    return { ...s, resources: safeParseJsonArray(s.resources) };
  }

  async updateRoadmapStep(id: number, data: Partial<any>): Promise<RoadmapStep | undefined> {
    const update: any = { ...data };
    if (data.resources) update.resources = JSON.stringify(data.resources);
    const [s] = await db.update(roadmapSteps).set(update).where(eq(roadmapSteps.id, id)).returning();
    return s ? { ...s, resources: safeParseJsonArray(s.resources) } : undefined;
  }

  async deleteRoadmapStep(id: number): Promise<void> {
    await db.delete(userProgress).where(eq(userProgress.stepId, id));
    await db.delete(roadmapSteps).where(eq(roadmapSteps.id, id));
  }

  async createRoadmapWithSteps(data: any): Promise<Roadmap> {
    const { steps = [], ...roadmapData } = data;
    const [roadmap] = await db.insert(roadmaps).values(roadmapData).returning();
    if (steps.length > 0) {
      await db.insert(roadmapSteps).values(
        steps.map((step: any, idx: number) => ({
          ...step,
          roadmapId: roadmap.id,
          order: step.order ?? idx + 1,
          resources: step.resources ? JSON.stringify(step.resources) : null,
        }))
      );
    }
    return roadmap;
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async toggleUserProgress(userId: string, stepId: number, completed: boolean): Promise<UserProgress> {
    if (completed) {
      const existing = await db.select().from(userProgress)
        .where(and(eq(userProgress.userId, userId), eq(userProgress.stepId, stepId)));
      if (existing.length > 0) return existing[0];
      const [progress] = await db.insert(userProgress).values({ userId, stepId }).returning();
      return progress;
    } else {
      await db.delete(userProgress).where(and(eq(userProgress.userId, userId), eq(userProgress.stepId, stepId)));
      return { id: -1, userId, stepId, completedAt: new Date() };
    }
  }

  async getPathProgress(userId: string): Promise<Record<string, number[]>> {
    const rows = await db.select().from(pathProgress).where(eq(pathProgress.userId, userId));
    const result: Record<string, number[]> = {};
    for (const row of rows) {
      if (!result[row.pathId]) result[row.pathId] = [];
      result[row.pathId].push(row.phaseIndex);
    }
    return result;
  }

  async togglePathProgress(userId: string, pathId: string, phaseIndex: number, completed: boolean): Promise<void> {
    if (completed) {
      const existing = await db.select().from(pathProgress)
        .where(and(eq(pathProgress.userId, userId), eq(pathProgress.pathId, pathId), eq(pathProgress.phaseIndex, phaseIndex)));
      if (existing.length === 0) {
        await db.insert(pathProgress).values({ userId, pathId, phaseIndex });
      }
    } else {
      await db.delete(pathProgress)
        .where(and(eq(pathProgress.userId, userId), eq(pathProgress.pathId, pathId), eq(pathProgress.phaseIndex, phaseIndex)));
    }
  }

  async toggleVote(resourceId: number, userId: string): Promise<{ voted: boolean; votes: number }> {
    const existing = await db.select().from(resourceVotes)
      .where(and(eq(resourceVotes.resourceId, resourceId), eq(resourceVotes.userId, userId)));
    if (existing.length > 0) {
      await db.delete(resourceVotes)
        .where(and(eq(resourceVotes.resourceId, resourceId), eq(resourceVotes.userId, userId)));
      await db.update(resources)
        .set({ votes: sql`MAX(0, ${resources.votes} - 1)` })
        .where(eq(resources.id, resourceId));
      const [r] = await db.select().from(resources).where(eq(resources.id, resourceId));
      return { voted: false, votes: r?.votes ?? 0 };
    } else {
      await db.insert(resourceVotes).values({ resourceId, userId });
      await db.update(resources)
        .set({ votes: sql`${resources.votes} + 1` })
        .where(eq(resources.id, resourceId));
      const [r] = await db.select().from(resources).where(eq(resources.id, resourceId));
      return { voted: true, votes: r?.votes ?? 0 };
    }
  }

  async hasUserVoted(resourceId: number, userId: string): Promise<boolean> {
    const rows = await db.select().from(resourceVotes)
      .where(and(eq(resourceVotes.resourceId, resourceId), eq(resourceVotes.userId, userId)));
    return rows.length > 0;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(30);
  }

  async createNotification(data: { userId: string; type: string; message: string; resourceId?: number }): Promise<Notification> {
    const [n] = await db.insert(notifications).values({
      userId: data.userId,
      type: data.type,
      message: data.message,
      resourceId: data.resourceId ?? null,
      read: false,
    }).returning();
    return n;
  }

  async markNotificationRead(id: number, userId: string): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
  }

  async getProfile(userId: string): Promise<any> {
    const [submittedRaw, progressRows, allRoadmaps] = await Promise.all([
      db.select().from(resources).where(eq(resources.submittedBy, userId)).orderBy(desc(resources.createdAt)),
      db.select().from(userProgress).where(eq(userProgress.userId, userId)),
      db.select().from(roadmaps),
    ]);
    const submitted = submittedRaw.map(parseResource);

    const progressByRoadmap: Record<number, number[]> = {};
    for (const p of progressRows) {
      const step = await db.select().from(roadmapSteps).where(eq(roadmapSteps.id, p.stepId));
      if (step[0]) {
        const rid = step[0].roadmapId;
        if (!progressByRoadmap[rid]) progressByRoadmap[rid] = [];
        progressByRoadmap[rid].push(p.stepId);
      }
    }

    const roadmapProgress = await Promise.all(
      Object.entries(progressByRoadmap).map(async ([roadmapId, completedStepIds]) => {
        const rm = allRoadmaps.find(r => r.id === Number(roadmapId));
        const totalSteps = await db.select().from(roadmapSteps)
          .where(eq(roadmapSteps.roadmapId, Number(roadmapId)));
        const pct = totalSteps.length > 0
          ? Math.round((completedStepIds.length / totalSteps.length) * 100)
          : 0;
        return { roadmap: rm, completedCount: completedStepIds.length, totalSteps: totalSteps.length, pct };
      })
    );

    return { submitted, roadmapProgress: roadmapProgress.filter(r => r.roadmap) };
  }

  async getChangelog(limit: number): Promise<any> {
    const [recentResources, recentRoadmaps] = await Promise.all([
      db.select().from(resources)
        .where(eq(resources.status, "approved"))
        .orderBy(desc(resources.createdAt))
        .limit(limit),
      db.select().from(roadmaps)
        .orderBy(desc(roadmaps.createdAt))
        .limit(limit),
    ]);
    return {
      resources: recentResources.map(parseResource),
      roadmaps: recentRoadmaps,
    };
  }

  async globalSearch(query: string): Promise<{ resources: Resource[]; roadmaps: Roadmap[] }> {
    const q = `%${query}%`;
    const [foundResources, foundRoadmaps] = await Promise.all([
      db.select().from(resources).where(
        and(
          eq(resources.status, "approved"),
          or(like(resources.title, q), like(resources.description, q))
        )
      ).limit(20),
      db.select().from(roadmaps).where(
        or(like(roadmaps.title, q), like(roadmaps.description, q), like(roadmaps.category, q))
      ).limit(10),
    ]);
    return { resources: foundResources.map(parseResource), roadmaps: foundRoadmaps };
  }

  async getLeaderboard(): Promise<{
    topSubmitters: Array<{ userId: string; count: number; approvedCount: number }>;
    topResources: Resource[];
    stats: { totalResources: number; totalVotes: number; totalSubmitters: number };
  }> {
    const [allApproved, topVoted] = await Promise.all([
      db.select().from(resources).where(eq(resources.status, "approved")),
      db.select().from(resources)
        .where(and(eq(resources.status, "approved"), sql`${resources.votes} > 0`))
        .orderBy(desc(resources.votes))
        .limit(10),
    ]);

    // Count by submitter
    const submitterMap: Record<string, number> = {};
    let totalVotes = 0;
    for (const r of allApproved) {
      totalVotes += r.votes ?? 0;
      if (r.submittedBy) {
        submitterMap[r.submittedBy] = (submitterMap[r.submittedBy] ?? 0) + 1;
      }
    }

    const topSubmitters = Object.entries(submitterMap)
      .map(([userId, count]) => ({ userId, count, approvedCount: count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      topSubmitters,
      topResources: topVoted.map(parseResource),
      stats: {
        totalResources: allApproved.length,
        totalVotes,
        totalSubmitters: Object.keys(submitterMap).length,
      },
    };
  }

  async resourceUrlExists(url: string): Promise<boolean> {
    const rows = await db.select({ id: resources.id }).from(resources).where(eq(resources.url, url)).limit(1);
    return rows.length > 0;
  }

  async bulkCreateResources(items: InsertResource[]): Promise<number> {
    if (items.length === 0) return 0;
    let inserted = 0;
    const BATCH = 50;
    for (let i = 0; i < items.length; i += BATCH) {
      const batch = items.slice(i, i + BATCH);
      const toInsert = [];
      for (const item of batch) {
        const exists = await this.resourceUrlExists(item.url);
        if (!exists) {
          toInsert.push({
            ...item,
            tags: item.tags ? JSON.stringify(item.tags) : null,
          });
        }
      }
      if (toInsert.length > 0) {
        await db.insert(resources).values(toInsert);
        inserted += toInsert.length;
      }
    }
    return inserted;
  }
}

export const storage = new DatabaseStorage();
