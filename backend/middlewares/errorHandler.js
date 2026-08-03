/**
 * Custom error class for application-level errors.
 * Extends the built-in Error class with HTTP status code support.
 */
export class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Classifies MongoDB / Mongoose error types into user-friendly messages
 */
const handleMongoError = (err) => {
  // CastError — Invalid ObjectId or type mismatch
  if (err.name === 'CastError') {
    return new AppError(`Invalid ${err.path}: ${err.value}. Please provide a valid value.`, 400, 'INVALID_FIELD');
  }

  // MongoServerError 11000 — Duplicate key constraint violation
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(', ');
    return new AppError(`A record with this ${field} already exists. Duplicate entries are not allowed.`, 409, 'DUPLICATE_ENTRY');
  }

  // Mongoose ValidationError — Schema-level validation failures
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message).join('; ');
    return new AppError(`Validation failed: ${messages}`, 422, 'VALIDATION_ERROR');
  }

  return null;
};

/**
 * Classifies JWT errors into structured responses
 */
const handleJWTError = (err) => {
  if (err.name === 'JsonWebTokenError') {
    return new AppError('Invalid authentication token. Please login again.', 401, 'INVALID_TOKEN');
  }
  if (err.name === 'TokenExpiredError') {
    return new AppError('Your session has expired. Please login again.', 401, 'TOKEN_EXPIRED');
  }
  return null;
};

/**
 * Global error handling middleware.
 * Catches all errors and returns a consistent JSON response.
 * Handles MongoDB errors, JWT errors, operational errors and unexpected server errors.
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = err;

  // Try to classify known error types
  const mongoError = handleMongoError(err);
  const jwtError = handleJWTError(err);

  if (mongoError) error = mongoError;
  else if (jwtError) error = jwtError;

  if (process.env.NODE_ENV === 'development') {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      errorCode: error.errorCode || null,
      stack: error.stack,
      error: error
    });
  }

  // Production: Respond without stack traces
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      errorCode: error.errorCode || null
    });
  }

  // Unknown/unexpected errors — log and return generic message
  console.error('💥 UNHANDLED ERROR:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  return res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred. Our team has been notified.',
    errorCode: 'INTERNAL_SERVER_ERROR'
  });
};

/**
 * Async error handler wrapper.
 * Eliminates the need for try/catch blocks in async route handlers.
 * Automatically forwards errors to the global error handler.
 *
 * Usage:
 *   router.get("/", asyncHandler(async (req, res) => { ... }));
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Not Found Handler — catches requests to undefined routes
 */
export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route '${req.originalUrl}' not found on this server.`, 404, 'ROUTE_NOT_FOUND'));
};
