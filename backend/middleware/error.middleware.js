const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  // Default error response
  const errorResponse = {
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Determine status code
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json(errorResponse);
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorMiddleware,
  AppError
};