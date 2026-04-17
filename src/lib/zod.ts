import { z } from 'zod';

export const ContentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  type: z.enum(['VIDEO', 'ARTICLE']),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  videoUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  category: z.string().optional(),
});

export const PaginationSchema = z.object({
  cursor: z.string().optional(),
  take: z.number().min(1).max(50).default(20),
});

export const ProgressSchema = z.object({
  contentId: z.string().min(1, 'Content ID is required'),
  lastPosition: z.number().min(0),
  isCompleted: z.boolean(),
});

export type ContentInput = z.infer<typeof ContentSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
export type ProgressInput = z.infer<typeof ProgressSchema>;
