const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Logged in user test', userId: req.userId });
});

module.exports = router;
