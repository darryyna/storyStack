const goalsService = require('../services/goals.service');
const logger = require('../configuration/logger');

exports.createGoal = async (req, res) => {
  try {
    const goal = await goalsService.createGoal(req.userId, req.body);
    res.status(201).json(goal);
  } catch (error) {
    logger.error(`Create Goal Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to create goal' });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const goals = await goalsService.getGoalsWithProgress(req.userId);
    res.json(goals);
  } catch (error) {
    logger.error(`Get Goals Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const result = await goalsService.deleteGoal(req.userId, req.params.id);
    if (!result) return res.status(404).json({ error: 'Goal not found' });

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    logger.error(`Delete Goal Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
};

exports.getGoalPrediction = async (req, res) => {
  try {
    const result = await goalsService.getGoalPrediction(req.userId, req.params.id);
    if (!result) return res.status(404).json({ error: 'Goal not found' });

    res.json(result);
  } catch (error) {
    logger.error(`Get Goal Prediction Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to get goal prediction' });
  }
};