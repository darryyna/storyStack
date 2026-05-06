const { z } = require('zod');

const createGoalSchema = z.object({
  name: z.string().min(1, 'name is required').max(200),
  type: z.enum(['MONTH', 'QUARTER', 'HALF_YEAR', 'YEAR']),
  goalType: z.enum(['BOOKS_COUNT', 'PAGES_COUNT']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  targetCount: z.number().int().min(1, 'targetCount must be at least 1'),
  category: z.string().optional(),
}).refine(data => data.endDate > data.startDate, {
  message: 'endDate must be after startDate',
  path: ['endDate'],
});

module.exports = { createGoalSchema };