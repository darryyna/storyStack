const { promisify } = require('util');
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const logger = require('../configuration/logger');
const { sendPasswordResetEmail } = require('../services/email.service');

const verifyJwt = promisify(jwt.verify);

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
  });
};


exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(409).json({ error: 'Email already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ username, email, password: hashedPassword });
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 днів
    });
    res.status(201).json({ message: 'User is created', accessToken });
  } catch (err) {
    logger.error(`Registration error for email ${email}: ${err.message}`);
    res.status(400).json({ error: 'Error while registering', details: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (err) {
    logger.error(`Login error for user ${username}: ${err.message}`);
    res.status(500).json({ error: 'Login Error', details: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: 'Refresh token required' });

    const decoded = await verifyJwt(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId).select('username email');
    if (!user) return res.status(403).json({ error: 'User not found' });

    const accessToken = generateAccessToken(decoded.userId);
    res.json({
      accessToken,
      user: { id: String(user._id), username: user.username, email: user.email }
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }
    logger.error(`Token refresh failed: ${err.message}`);
    res.status(500).json({ error: 'Token refresh failed', details: err.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'Strict',
  });
  res.json({ message: 'Logout from the system' });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email });

    // Відповідь однакова незалежно від того чи юзер існує — щоб не зливати інфу
    if (!user) return res.status(200).json({ message: 'If this email exists, a reset link was sent' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 година
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendPasswordResetEmail(email, resetUrl);

    res.status(200).json({ message: 'If this email exists, a reset link was sent' });
  } catch (err) {
    logger.error(`Forgot password error: ${err.message}`);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    logger.error(`Reset password error: ${err.message}`);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
