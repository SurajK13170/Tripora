/**
 * Error Handling Middleware
 * Async wrapper and global error handler
 */

/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 * 
 * Usage: router.post('/endpoint', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global Error Handler Middleware
 * Must be registered LAST in middleware stack
 * 
 * Usage: app.use(globalErrorHandler);
 */
const globalErrorHandler = (err, req, res, next) => {
  console.error('Global Error:', err);
  
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  asyncHandler,
  globalErrorHandler,
};
