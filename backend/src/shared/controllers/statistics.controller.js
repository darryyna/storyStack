const statisticsService = require('../services/statistics.service');

exports.getGeneralStats = async (req, res) => {
  const stats = await statisticsService.getGeneralStats(req.userId);
  res.json(stats);
};

exports.getGenreStats = async (req, res) => {
  const stats = await statisticsService.getGenreStats(req.userId);
  res.json(stats);
};

exports.getAuthorStats = async (req, res) => {
  const stats = await statisticsService.getAuthorStats(req.userId);
  res.json(stats);
};

exports.getActivityStats = async (req, res) => {
  const stats = await statisticsService.getActivityStats(req.userId, req.query.period);
  res.json(stats);
};

exports.getBooksPerYearStats = async (req, res) => {
  const stats = await statisticsService.getBooksPerYearStats(req.userId);
  res.json(stats);
};

exports.getReadingRecord = async (req, res) => {
  const record = await statisticsService.getReadingRecord(req.userId);
  res.json(record);
};

exports.getReadingStreak = async (req, res) => {
  const streak = await statisticsService.getReadingStreak(req.userId);
  res.json(streak);
};

exports.getInsights = async (req, res) => {
  const insights = await statisticsService.getInsights(req.userId);
  res.json(insights);
};