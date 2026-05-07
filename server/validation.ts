import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

// ── Allowed values ────────────────────────────────────────────────────────────

const VALID_CATEGORIES = [
  "Learning", "Programming", "Dev Tools", "AI & ML",
  "Cybersecurity", "Design & UI", "Reference", "Community", "Books", "Practice",
  "Entertainment", "General Tools",
  "Cloud & DevOps", "Data Science", "Career",
] as const;

const VALID_ROADMAP_ICONS = [
  "brain", "shield", "layers", "globe", "database", "terminal",
  "code", "cpu", "server", "cloud", "zap", "star",
] as const;

// ── URL helper ────────────────────────────────────────────────────────────────

const httpsUrl = z
  .string({ required_error: "URL is required" })
  .trim()
  .min(1, "URL is required")
  .refine((v) => {
    try {
      const u = new URL(v);
      return u.protocol === "https:";
    } catch {
      return false;
    }
  }, { message: "URL must be a valid https:// address" });

// ── Public schemas ────────────────────────────────────────────────────────────

export const submitResourceSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be under 200 characters"),
  url: httpsUrl,
  description: z
    .string()
    .trim()
    .max(1000, "Description must be under 1000 characters")
    .optional()
    .default("No description provided"),
  category: z.enum(VALID_CATEGORIES, {
    errorMap: () => ({ message: `Category must be one of: ${VALID_CATEGORIES.join(", ")}` }),
  }),
  subcategory: z.string().trim().max(100).optional(),
  tags: z.union([z.string().trim().max(500), z.array(z.string().trim().max(100))]).optional(),
  warning: z.string().trim().max(500).optional(),
});

export const progressToggleSchema = z.object({
  stepId: z
    .number({ required_error: "stepId is required", invalid_type_error: "stepId must be a number" })
    .int("stepId must be an integer")
    .positive("stepId must be positive"),
  completed: z.boolean({
    required_error: "completed is required",
    invalid_type_error: "completed must be a boolean",
  }),
});

// ── Admin schemas ─────────────────────────────────────────────────────────────

export const adminUpdateResourceSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  url: httpsUrl.optional(),
  description: z.string().trim().max(1000).optional(),
  category: z.enum(VALID_CATEGORIES).optional(),
  subcategory: z.string().trim().max(100).optional(),
  tags: z.union([z.string().trim().max(500), z.array(z.string().trim().max(100))]).optional(),
  warning: z.string().trim().max(500).optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export const bulkActionSchema = z.object({
  action: z.enum(["approve", "delete"], {
    errorMap: () => ({ message: "action must be 'approve' or 'delete'" }),
  }),
  ids: z
    .array(z.number().int().positive())
    .min(1, "At least one ID is required")
    .max(100, "Cannot bulk-action more than 100 items at once"),
});

export const createRoadmapSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(5).max(2000),
  category: z.string().trim().min(1).max(100),
  icon: z.enum(VALID_ROADMAP_ICONS).optional(),
  steps: z
    .array(
      z.object({
        title: z.string().trim().min(2).max(200),
        description: z.string().trim().max(2000).optional().default(""),
        section: z.string().trim().min(1).max(100),
        order: z.number().int().nonnegative(),
        resources: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});

export const updateRoadmapSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().max(100).optional(),
  icon: z.enum(VALID_ROADMAP_ICONS).optional(),
});

export const createRoadmapStepSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional().default(""),
  section: z.string().trim().min(1).max(100),
  order: z.number().int().nonnegative(),
  resources: z.string().optional(),
});

export const updateRoadmapStepSchema = createRoadmapStepSchema.partial();

// ── Validation middleware factory ─────────────────────────────────────────────

export function validate(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(422).json({ message: "Validation failed", errors });
    }
    req.body = result.data;
    next();
  };
}

// ── ID param sanitiser ────────────────────────────────────────────────────────

export function requireNumericId(req: Request, res: Response, next: NextFunction) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid ID parameter" });
  }
  next();
}
