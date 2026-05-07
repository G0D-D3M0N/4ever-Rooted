import { z } from 'zod';
import { insertResourceSchema, insertRoadmapSchema, insertRoadmapStepSchema, insertUserProgressSchema, resources, roadmaps, roadmapSteps, userProgress } from './schema';

export const api = {
  resources: {
    list: {
      method: 'GET' as const,
      path: '/api/resources',
      input: z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.union([
          z.array(z.custom<typeof resources.$inferSelect>()),
          z.object({
            resources: z.array(z.custom<typeof resources.$inferSelect>()),
            total: z.number(),
          }),
        ]),
      },
    },
  },
  roadmaps: {
    list: {
      method: 'GET' as const,
      path: '/api/roadmaps',
      responses: {
        200: z.array(z.custom<typeof roadmaps.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/roadmaps/:id',
      responses: {
        200: z.custom<typeof roadmaps.$inferSelect & { steps: typeof roadmapSteps.$inferSelect[] }>(),
        404: z.object({ message: z.string() }),
      },
    },
  },
  progress: {
    list: {
      method: 'GET' as const,
      path: '/api/progress',
      responses: {
        200: z.array(z.custom<typeof userProgress.$inferSelect>()),
      },
    },
    toggle: {
      method: 'POST' as const,
      path: '/api/progress',
      input: z.object({
        stepId: z.number(),
        completed: z.boolean(),
      }),
      responses: {
        200: z.custom<typeof userProgress.$inferSelect>(),
        401: z.object({ message: z.string() }),
      },
    },
  },
  user: {
    me: {
      method: 'GET' as const,
      path: '/api/user/me',
      responses: {
        200: z.object({
          id: z.number(),
          username: z.string(),
        }).nullable(),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
