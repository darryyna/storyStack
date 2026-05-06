const { z } = require('zod');

const createFolderSchema = z.object({
  name: z.string().min(1, 'name is required').max(100),
  description: z.string().optional(),
  colorLabel: z.string().optional().default('#3b82f6'),
  parentId: z.string().optional().nullable(),
  bookIds: z.array(z.string()).optional().default([]),
});

const updateFolderSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  colorLabel: z.string().optional(),
  parentId: z.string().optional().nullable(),
});

const bookIdsSchema = z.object({
  bookIds: z.array(z.string()).min(1, 'bookIds must be a non-empty array'),
});

module.exports = { createFolderSchema, updateFolderSchema, bookIdsSchema };