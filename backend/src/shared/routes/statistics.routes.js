const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statistics.controller');
const auth = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');

router.use(auth);

router.get('/general', asyncHandler(statisticsController.getGeneralStats));
router.get('/genres', asyncHandler(statisticsController.getGenreStats));
router.get('/authors', asyncHandler(statisticsController.getAuthorStats));
router.get('/activity', asyncHandler(statisticsController.getActivityStats));
router.get('/books-per-year', asyncHandler(statisticsController.getBooksPerYearStats));
router.get('/record', asyncHandler(statisticsController.getReadingRecord));
router.get('/streak', asyncHandler(statisticsController.getReadingStreak));
router.get('/insights', asyncHandler(statisticsController.getInsights));

module.exports = router;
