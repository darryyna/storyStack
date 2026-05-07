const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goal.controller');
const auth = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createGoalSchema } = require('../validation/goals.schema');

router.use(auth);

router.post('/', validate(createGoalSchema), asyncHandler(goalController.createGoal));
router.get('/', asyncHandler(goalController.getGoals));
router.delete('/:id', asyncHandler(goalController.deleteGoal));
router.get('/:id/prediction', asyncHandler(goalController.getGoalPrediction));
router.get('/archived', asyncHandler(goalController.getArchivedGoals));
router.patch('/:id/toggle-active', asyncHandler(goalController.toggleGoalActive));

module.exports = router;
