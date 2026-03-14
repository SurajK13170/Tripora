const passport = require('passport');
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
require('../services/passport_auth'); // Import the passport configuration


const db = require('../db');
const jwtService = require('../utils/jwt');
const { HTTP_STATUS } = require('../utils/constants');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateRequest, registerSchema, verifyOTPSchema, resendOTPSchema, loginSchema } = require('../middleware/validation');
const emailService = require('../services/emailService');
const otpService = require('../services/otpService');

router.post('/register', validateRequest(registerSchema), asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await db.getOne('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      error: 'Email already registered',
      message: 'This email is already associated with an account. Please login or use a different email.',
      timestamp: new Date().toISOString(),
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const pendingUser = {
    name,
    email,
    password: hashedPassword,
    auth_type: 'email',
  };

  try {
    const otp = await otpService.generateAndStoreOTP(email, pendingUser);
    await emailService.sendOTPEmail(email, otp);

    res.status(HTTP_STATUS.CREATED).json({
      message: 'User registration initiated. Check your email for OTP to complete registration.',
      email: email,
      nextStep: 'verify-otp',
      otpExpirySeconds: parseInt(process.env.OTP_EXPIRY || 300),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await otpService.clearOTP(email);
    
    return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: 'Failed to send OTP',
      message: 'Could not send OTP to your email. Please try again.',
      timestamp: new Date().toISOString(),
    });
  }
}));

router.post('/verify-otp', validateRequest(verifyOTPSchema), asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  let user = await db.getOne('SELECT id, is_email_verified FROM users WHERE email = $1', [email]);
  const pendingUser = await otpService.getPendingUser(email);

  if (!user && !pendingUser) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      error: 'Registration expired or not found',
      message: 'No pending registration found with this email. Please register again.',
      timestamp: new Date().toISOString(),
    });
  }
  if (user && user.is_email_verified) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      error: 'Email already verified',
      message: 'This email is already verified. Please login to continue.',
      timestamp: new Date().toISOString(),
    });
  }

  const otpResult = await otpService.verifyOTP(email, otp);
  
  if (!otpResult.valid) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: 'Invalid OTP',
      message: otpResult.message,
      timestamp: new Date().toISOString(),
    });
  }

  if (!user && otpResult.pendingUser) {
    const { name, password, auth_type } = otpResult.pendingUser;
    await db.query(
      'INSERT INTO users (name, email, password, auth_type, is_email_verified) VALUES ($1, $2, $3, $4, $5)',
      [name, email, password, auth_type, false]
    );
    user = await db.getOne('SELECT id, name FROM users WHERE email = $1', [email]);
  }

  await db.query('UPDATE users SET is_email_verified = TRUE WHERE id = $1', [user.id]);
  await otpService.clearOTP(email);

  await emailService.sendWelcomeEmail(email, user.name);

  res.status(HTTP_STATUS.SUCCESS).json({
    message: 'Email verified successfully',
    email: email,
    timestamp: new Date().toISOString(),
  });
}));

router.post('/resend-otp', validateRequest(resendOTPSchema), asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await db.getOne('SELECT id, is_email_verified FROM users WHERE email = $1', [email]);
  const pendingUser = await otpService.getPendingUser(email);

  if (!user && !pendingUser) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      error: 'Registration expired or not found',
      message: 'No account or pending registration found. Please register again.',
      timestamp: new Date().toISOString(),
    });
  }

  // Check if already verified
  if (user && user.is_email_verified) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      error: 'Email already verified',
      message: 'This email is already verified. Please login.',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const result = await otpService.resendOTP(email);
    
    if (!result.success) {
      return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        error: 'Rate limit',
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    }

    await emailService.sendOTPEmail(email, result.otp);

    res.status(HTTP_STATUS.SUCCESS).json({
      message: 'OTP resent successfully',
      email: email,
      otpExpirySeconds: parseInt(process.env.OTP_EXPIRY || 300),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: 'Failed to resend OTP',
      message: 'Could not send OTP to your email. Please try again.',
      timestamp: new Date().toISOString(),
    });
  }
}));


router.post('/test-email', asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      error: 'Forbidden',
      message: 'This endpoint is only available in development mode',
      timestamp: new Date().toISOString(),
    });
  }

  const { email } = req.body;
  
  if (!email) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: 'Bad request',
      message: 'Email is required: { email: "yourmail@example.com" }',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const success = await emailService.sendTestEmail(email);
    
    if (!success) {
      return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
        error: 'Failed to send test email',
        message: 'Check console logs for detailed error information',
        timestamp: new Date().toISOString(),
      });
    }

    res.status(HTTP_STATUS.SUCCESS).json({
      message: 'Test email sent successfully! Check your inbox.',
      email: email,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: 'Email test failed',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}));


router.post('/login', validateRequest(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await db.getOne('SELECT * FROM users WHERE email = $1', [email]);
  if (!user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: 'Invalid credentials',
      message: 'Email or password is incorrect.',
      timestamp: new Date().toISOString(),
    });
  }

  // Check auth type
  if (user.auth_type !== 'email') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: 'Authentication method mismatch',
      message: `This account is registered with ${user.auth_type}. Please use that method to login.`,
      timestamp: new Date().toISOString(),
    });
  }

  // Check if email verified
  if (!user.is_email_verified) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: 'Email not verified',
      message: 'Please verify your email before login. Check your inbox for the OTP.',
      timestamp: new Date().toISOString(),
    });
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: 'Invalid credentials',
      message: 'Email or password is incorrect.',
      timestamp: new Date().toISOString(),
    });
  }

  // Generate JWT token
  const token = jwtService.generateToken(user.id, user.email);
  const tokenExpiry = jwtService.getTokenExpiry(token);

  res.status(HTTP_STATUS.SUCCESS).json({
    message: 'Login successful',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      auth_type: user.auth_type,
    },
    token: token,
    expiresAt: tokenExpiry.expiresAt,
    expiresIn: tokenExpiry.expiresIn,
    timestamp: new Date().toISOString(),
  });
}));


router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const { user, token } = req.user;

  res.status(HTTP_STATUS.SUCCESS).json({
    message: 'Google login successful',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      auth_type: user.auth_type,
    },
    token: token,
    timestamp: new Date().toISOString(),
  });
});


module.exports = router;
