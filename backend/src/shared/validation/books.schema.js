const { z } = require('zod');

const addExternalBookSchema = z.object({
  sourceId: z.string().min(1, 'sourceId is required'),
  title: z.string().min(1, 'title is required'),
  authors: z.array(z.string()).optional().default([]),
  thumbnail: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  pageCount: z.number().int().positive().optional().nullable(),
  categories: z.array(z.string()).optional().default([]),
});

const addUserBookSchema = z.object({
  externalBookId: z.string().min(1, 'externalBookId is required'),
  rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().optional(),
});

const updateUserBookSchema = z.object({
  status: z.enum(['reading', 'completed', 'planned', 'dropped']).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  currentPage: z.number().int().min(0).optional(),
  bookId: z.object({ pageCount: z.number().int().positive() }).optional(),
});

const updateProgressSchema = z.object({
  pagesRead: z.number({ invalid_type_error: 'pagesRead must be a number' })
    .int('pagesRead must be an integer')
    .positive('pagesRead must be positive'),
});

const addManualBookSchema = z.object({
  title: z.string().min(1, 'title is required'),
  authors: z.array(z.string()).optional().default([]),
  thumbnail: z.union([z.string().url(), z.literal(''), z.null()]).optional().nullable(),
  description: z.string().optional().nullable(),
  pageCount: z.number().int().positive().optional().nullable(),
  categories: z.array(z.string()).optional().default([]),
});

const searchQuerySchema = z.object({
  q: z.string().min(1, 'Query parameter "q" is required'),
});

module.exports = {
  addExternalBookSchema, addUserBookSchema, updateUserBookSchema,
  updateProgressSchema, addManualBookSchema, searchQuerySchema,
};