import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations, sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const sessions = sqliteTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: integer("expire", { mode: "timestamp" }).notNull(),
});

export const resources = sqliteTable("resources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  url: text("url").notNull(),
  tags: text("tags"),
  warning: text("warning"),
  submittedBy: text("submitted_by"),
  status: text("status").notNull().default("approved"),
  votes: integer("votes").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const resourceVotes = sqliteTable("resource_votes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  resourceId: integer("resource_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const roadmaps = sqliteTable("roadmaps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  icon: text("icon"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const roadmapSteps = sqliteTable("roadmap_steps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roadmapId: integer("roadmap_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  resources: text("resources"),
  section: text("section").notNull(),
  order: integer("order").notNull(),
});

export const userProgress = sqliteTable("user_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  stepId: integer("step_id").notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  resourceId: integer("resource_id"),
  read: integer("read", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const pathProgress = sqliteTable("path_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  pathId: text("path_id").notNull(),
  phaseIndex: integer("phase_index").notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const roadmapsRelations = relations(roadmaps, ({ many }) => ({
  steps: many(roadmapSteps),
}));

export const roadmapStepsRelations = relations(roadmapSteps, ({ one }) => ({
  roadmap: one(roadmaps, {
    fields: [roadmapSteps.roadmapId],
    references: [roadmaps.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertResourceSchema = createInsertSchema(resources).omit({ id: true, createdAt: true });
export const insertRoadmapSchema = createInsertSchema(roadmaps).omit({ id: true, createdAt: true });
export const insertRoadmapStepSchema = createInsertSchema(roadmapSteps).omit({ id: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true, completedAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Roadmap = typeof roadmaps.$inferSelect;
export type InsertRoadmap = z.infer<typeof insertRoadmapSchema>;
export type RoadmapStep = typeof roadmapSteps.$inferSelect;
export type InsertRoadmapStep = z.infer<typeof insertRoadmapStepSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type ResourceVote = typeof resourceVotes.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type PathProgress = typeof pathProgress.$inferSelect;
