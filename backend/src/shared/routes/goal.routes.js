const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goal.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/', auth, goalController.createGoal);
router.get('/', auth, goalController.getGoals);
router.delete('/:id', auth, goalController.deleteGoal);
router.get('/:id/prediction', auth, goalController.getGoalPrediction);

module.exports = router;
