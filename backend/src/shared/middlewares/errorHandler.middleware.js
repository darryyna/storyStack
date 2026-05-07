const { AppError } = require('../errorsHandling/errors');
const logger = require('../configuration/logger');

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({ error: err.message, code: err.code });
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(403).json({ error: 'Invalid or expired token', code: 'INVALID_TOKEN' });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ error: `${field} already exists`, code: 'CONFLICT' });
  }
  logger.error(`Unhandled error: ${err.message}\n${err.stack}`);
  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
};

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };