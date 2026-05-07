const { promisify } = require('util');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/user.repository');
const logger = require('../configuration/logger');
const { sendPasswordResetEmail } = require('../services/email.service');
const { ValidationError, ConflictError, UnauthorizedError, ForbiddenError } = require('../errorsHandling/errors');

const verifyJwt = promisify(jwt.verify);

const generateAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
  });

const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
  });

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,
  sameSite: 'Strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ValidationError('Username, email and password are required');
  }

  const [existingByUsername, existingByEmail] = await Promise.all([
    userRepo.findByUsername(username),
    userRepo.findByEmail(email)
  ]);

  if (existingByUsername) throw new ConflictError('Username already taken');
  if (existingByEmail) throw new ConflictError('Email already taken');

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await userRepo.create({ username, email, password: hashedPassword });

  const accessToken = generateAccessToken(newUser._id);
  const refreshToken = generateRefreshToken(newUser._id);

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(201).json({ message: 'User is created', accessToken });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await userRepo.findByUsername(username);
  if (!user) throw new UnauthorizedError('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new UnauthorizedError('Invalid credentials');

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  res.json({ accessToken });
};

exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new UnauthorizedError('Refresh token required');

  try {
    const decoded = await verifyJwt(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await userRepo.findById(decoded.userId);
    if (!user) throw new ForbiddenError('User not found');

    const accessToken = generateAccessToken(decoded.userId);
    res.json({
      accessToken,
      user: { id: String(user._id), username: user.username, email: user.email }
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      throw new ForbiddenError('Invalid refresh token');
    }
    throw err;
  }
};

exports.logout = (req, res) => {
  res.clearCookie('refreshToken', { httpOnly: true, secure: false, sameSite: 'Strict' });
  res.json({ message: 'Logout from the system' });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ValidationError('Email is required');

  const user = await userRepo.findByEmail(email);
  if (!user) return res.status(200).json({ message: 'If this email exists, a reset link was sent' });

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendPasswordResetEmail(email, resetUrl);

  res.status(200).json({ message: 'If this email exists, a reset link was sent' });
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    throw new ValidationError('Token and new password are required');
  }

  const user = await userRepo.findByResetToken(token);
  if (!user) throw new ValidationError('Invalid or expired token');

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({ message: 'Password updated successfully' });
};