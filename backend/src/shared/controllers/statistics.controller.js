const statisticsService = require('../services/statistics.service');
const logger = require('../configuration/logger');

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