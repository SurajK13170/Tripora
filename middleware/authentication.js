/**
 * Authentication Middleware
 * Verifies JWT token and protects routes
 */

const jwtService = require('../utils/jwt');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Verify JWT token middleware
 * Attaches user info to req.user if valid
 * 
 * Usage: router.get('/protected', verifyAuth, (req, res) => { ... })
 */
const verifyAuth = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'Missing token',
        message: 'Authorization token is required. Use: Authorization: Bearer <token>',
        timestamp: new Date().toISOString(),
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = jwtService.verifyToken(token);

    // Check if token is valid
    if (decoded && !decoded.error) {
      req.user = decoded;
      return next();
    }

    // Token verification failed
    let statusCode = HTTP_STATUS.UNAUTHORIZED;
    let message = decoded.message || 'Token verification failed';

    if (decoded.error === 'TokenExpiredError') {
      statusCode = HTTP_STATUS.UNAUTHORIZED;
      message = 'Token has expired. Please login again.';
    }

    return res.status(statusCode).json({
      error: 'Invalid token',
      message: message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: 'Authentication error',
      message: 'An error occurred during authentication',
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = {
  verifyAuth,
};
