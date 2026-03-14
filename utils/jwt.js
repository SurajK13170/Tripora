
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
const EXPIRY = process.env.JWT_EXPIRE || '7d';


const generateToken = (userId, email) => {
  try {
    const token = jwt.sign(
      {
        id: userId,
        email: email,
      },
      SECRET,
      {
        expiresIn: EXPIRY,
        algorithm: 'HS256',
      }
    );
    return token;
  } catch (error) {
    console.error('❌ Token generation error:', error.message);
    throw new Error('Failed to generate token');
  }
};


const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, SECRET, {
      algorithms: ['HS256'],
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return {
        valid: false,
        message: 'Token expired',
        error: error.name,
      };
    }
    if (error.name === 'JsonWebTokenError') {
      return {
        valid: false,
        message: 'Invalid token',
        error: error.name,
      };
    }
    return {
      valid: false,
      message: 'Token verification failed',
      error: error.message,
    };
  }
};


const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};


const getTokenExpiry = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const expiryDate = new Date(decoded.exp * 1000);
      return {
        expiresAt: expiryDate,
        expiresIn: Math.floor((decoded.exp * 1000 - Date.now()) / 1000), // seconds
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  getTokenExpiry,
};
