const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goal.controller');
const auth = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createGoalSchema } = require('../validation/goals.schema');

router.use(auth);

/**
 * @swagger
 * tags:
 *   name: Goals
 *   description: Reading goals management
 */

/**
 * @swagger
 * /api/goals:
 *   post:
 *     summary: Create a new reading goal
 *     tags: [Goals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - targetValue
 *               - type
 *               - duration
 *             properties:
 *               name:
 *                 type: string
 *               targetValue:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [books, pages]
 *               duration:
 *                 type: string
 *                 enum: [month, quarter, half_year, year]
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Goal created successfully
 */
router.post('/', validate(createGoalSchema), asyncHandler(goalController.createGoal));

/**
 * @swagger
 * /api/goals:
 *   get:
 *     summary: Get active reading goals
 *     tags: [Goals]
 *     responses:
 *       200:
 *         description: List of active goals
 */
router.get('/', asyncHandler(goalController.getGoals));

/**
 * @swagger
 * /api/goals/archived:
 *   get:
 *     summary: Get archived reading goals
 *     tags: [Goals]
 *     responses:
 *       200:
 *         description: List of archived goals
 */
router.get('/archived', asyncHandler(goalController.getArchivedGoals));

/**
 * @swagger
 * /api/goals/{id}/toggle-active:
 *   patch:
 *     summary: Toggle goal active status
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Goal status toggled successfully
 */
router.patch('/:id/toggle-active', asyncHandler(goalController.toggleGoalActive));

/**
 * @swagger
 * /api/goals/{id}:
 *   delete:
 *     summary: Delete a reading goal
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Goal deleted successfully
 */
router.delete('/:id', asyncHandler(goalController.deleteGoal));

/**
 * @swagger
 * /api/goals/{id}/prediction:
 *   get:
 *     summary: Get AI prediction for a goal
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Goal prediction data
 */
router.get('/:id/prediction', asyncHandler(goalController.getGoalPrediction));

module.exports = router;