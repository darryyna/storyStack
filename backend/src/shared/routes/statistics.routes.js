const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statistics.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/general', auth, statisticsController.getGeneralStats);
router.get('/genres', auth, statisticsController.getGenreStats);
router.get('/authors', auth, statisticsController.getAuthorStats);
router.get('/activity', auth, statisticsController.getActivityStats);
router.get('/books-per-year', auth, statisticsController.getBooksPerYearStats);

module.exports = router;
