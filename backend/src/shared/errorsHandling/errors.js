class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed') { super(message, 400, 'VALIDATION_ERROR'); }
}
class NotFoundError extends AppError {
  constructor(message = 'Not found') { super(message, 404, 'NOT_FOUND'); }
}
class ConflictError extends AppError {
  constructor(message = 'Conflict') { super(message, 409, 'CONFLICT'); }
}
class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') { super(message, 401, 'UNAUTHORIZED'); }
}
class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') { super(message, 403, 'FORBIDDEN'); }
}

module.exports = { AppError, ValidationError, NotFoundError, ConflictError, UnauthorizedError, ForbiddenError };