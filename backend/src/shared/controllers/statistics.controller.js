const statisticsService = require('../services/statistics.service');
const logger = require('../configuration/logger');

exports.getGeneralStats = async (req, res) => {
  try {
    const stats = await statisticsService.getGeneralStats(req.userId);
    res.json(stats);
  } catch (error) {
    logger.error(`Get General Stats Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

exports.getGenreStats = async (req, res) => {
  try {
    const stats = await statisticsService.getGenreStats(req.userId);
    res.json(stats);
  } catch (error) {
    logger.error(`Get Genre Stats Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch genre statistics' });
  }
};

exports.getAuthorStats = async (req, res) => {
  try {
    const stats = await statisticsService.getAuthorStats(req.userId);
    res.json(stats);
  } catch (error) {
    logger.error(`Get Author Stats Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch author statistics' });
  }
};

exports.getActivityStats = async (req, res) => {
  try {
    const stats = await statisticsService.getActivityStats(req.userId, req.query.period);
    res.json(stats);
  } catch (error) {
    logger.error(`Get Activity Stats Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch activity statistics' });
  }
};

exports.getBooksPerYearStats = async (req, res) => {
  try {
    const stats = await statisticsService.getBooksPerYearStats(req.userId);
    res.json(stats);
  } catch (error) {
    logger.error(`Get Books Per Year Stats Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch books per year statistics' });
  }
};