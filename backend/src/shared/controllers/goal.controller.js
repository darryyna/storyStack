const goalsService = require('../services/goals.service');
const { NotFoundError } = require('../errorsHandling/errors');

exports.createGoal = async (req, res) => {
  const goal = await goalsService.createGoal(req.userId, req.body);
  res.status(201).json(goal);
};

exports.getGoals = async (req, res) => {
  const goals = await goalsService.getGoalsWithProgress(req.userId);
  res.json(goals);
};

exports.getArchivedGoals = async (req, res) => {
  const goals = await goalsService.getArchivedGoals(req.userId);
  res.json(goals);
};

exports.deleteGoal = async (req, res) => {
  const result = await goalsService.deleteGoal(req.userId, req.params.id);
  if (!result) throw new NotFoundError('Goal not found');

  res.json({ message: 'Goal deleted successfully' });
};

exports.toggleGoalActive = async (req, res) => {
  const result = await goalsService.toggleGoalActive(req.userId, req.params.id);
  if (!result) throw new NotFoundError('Goal not found');
  res.json(result);
};

exports.getGoalPrediction = async (req, res) => {
  const result = await goalsService.getGoalPrediction(req.userId, req.params.id);
  if (!result) throw new NotFoundError('Goal not found');

  res.json(result);
};