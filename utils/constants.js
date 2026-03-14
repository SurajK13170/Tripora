
const HTTP_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

const AUTH_TYPES = {
  EMAIL: 'email',
  GOOGLE: 'google',
  APPLE: 'apple',
};

const USER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
};

const OTP_LENGTH = parseInt(process.env.OTP_LENGTH || 6);
const OTP_EXPIRY = parseInt(process.env.OTP_EXPIRY || 300); // 5 minutes in seconds

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100;

const JWT_EXPIRY = process.env.JWT_EXPIRE || '7d';

module.exports = {
  HTTP_STATUS,
  AUTH_TYPES,
  USER_STATUS,
  OTP_LENGTH,
  OTP_EXPIRY,
  PASSWORD_REGEX,
  EMAIL_REGEX,
  RATE_LIMIT_WINDOW,
  RATE_LIMIT_MAX_REQUESTS,
  JWT_EXPIRY,
};
