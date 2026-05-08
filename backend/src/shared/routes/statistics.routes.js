const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statistics.controller');
const auth = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');

router.use(auth);

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Reading statistics and activity tracking
 */

/**
 * @swagger
 * /api/statistics/general:
 *   get:
 *     summary: Get general reading statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: General statistics (total books, books read, etc.)
 */
router.get('/general', asyncHandler(statisticsController.getGeneralStats));

/**
 * @swagger
 * /api/statistics/genres:
 *   get:
 *     summary: Get genre distribution statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Genre distribution data
 */
router.get('/genres', asyncHandler(statisticsController.getGenreStats));

/**
 * @swagger
 * /api/statistics/authors:
 *   get:
 *     summary: Get top authors statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Top authors data
 */
router.get('/authors', asyncHandler(statisticsController.getAuthorStats));

/**
 * @swagger
 * /api/statistics/activity:
 *   get:
 *     summary: Get reading activity data
 *     tags: [Statistics]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [month, year]
 *         description: Time period for activity
 *     responses:
 *       200:
 *         description: Reading activity data
 */
router.get('/activity', asyncHandler(statisticsController.getActivityStats));

/**
 * @swagger
 * /api/statistics/books-per-year:
 *   get:
 *     summary: Get books read per year statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Books per year data
 */
router.get('/books-per-year', asyncHandler(statisticsController.getBooksPerYearStats));

/**
 * @swagger
 * /api/statistics/record:
 *   get:
 *     summary: Get personal reading record
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Personal record data
 */
router.get('/record', asyncHandler(statisticsController.getReadingRecord));

/**
 * @swagger
 * /api/statistics/streak:
 *   get:
 *     summary: Get reading streak information
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Streak data
 */
router.get('/streak', asyncHandler(statisticsController.getReadingStreak));

/**
 * @swagger
 * /api/statistics/insights:
 *   get:
 *     summary: Get reading insights
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Reading insights data
 */
router.get('/insights', asyncHandler(statisticsController.getInsights));

module.exports = router;
