
const { OTP_EXPIRY, OTP_LENGTH, OTP_RESEND_COOLDOWN } = require('../utils/constants');

const otpStore = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (value.expiresAt < now) {
      otpStore.delete(key);
    }
  }
}, 60000); // Check every minute

const generateOTP = () => {
  const length = OTP_LENGTH;
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

const generateAndStoreOTP = async (email, pendingUser = null) => {
  try {
    const otp = generateOTP();
    const expirySeconds = OTP_EXPIRY;
    const expiresAt = Date.now() + (expirySeconds * 1000);
    const existingData = otpStore.get(`otp:${email}`);
    
    // Store OTP in memory
    otpStore.set(`otp:${email}`, {
      otp,
      user: pendingUser ?? existingData?.user ?? null,
      expiresAt,
      lastSentAt: Date.now(),
    });
    
    console.log(`✅ OTP generated for ${email}: ${otp}`);
    return otp;
  } catch (error) {
    console.error('❌ Failed to generate OTP:', error.message);
    throw new Error('Failed to generate OTP');
  }
};

const verifyOTP = async (email, providedOTP) => {
  try {
    const key = `otp:${email}`;
    const storedData = otpStore.get(key);
    
    if (!storedData || storedData.expiresAt < Date.now()) {
      if (storedData) otpStore.delete(key); // Cleanup expired OTP
      return {
        valid: false,
        message: 'OTP expired or not found',
      };
    }
    
    if (storedData.otp.toString() !== providedOTP.toString()) {
      return {
        valid: false,
        message: 'Invalid OTP',
      };
    }
    
    const pendingUser = storedData.user;
    
    return {
      valid: true,
      message: 'OTP verified successfully',
      pendingUser
    };
  } catch (error) {
    console.error('❌ OTP verification error:', error.message);
    throw new Error('Failed to verify OTP');
  }
};

const resendOTP = async (email) => {
  try {
    const key = `otp:${email}`;
    const storedData = otpStore.get(key);

    if (!storedData) {
      return {
        success: false,
        message: 'OTP expired or not found',
      };
    }

    const now = Date.now();
    const resendCooldownMs = OTP_RESEND_COOLDOWN * 1000;
    const nextAllowedAt = (storedData.lastSentAt || 0) + resendCooldownMs;

    if (nextAllowedAt > now) {
      return {
        success: false,
        message: 'Please wait before requesting a new OTP',
        retryAfterSeconds: Math.ceil((nextAllowedAt - now) / 1000),
      };
    }

    const pendingUser = storedData.user || null;
    const otp = await generateAndStoreOTP(email, pendingUser);
    
    return {
      success: true,
      message: 'OTP resent successfully',
      otp,
    };
  } catch (error) {
    console.error('❌ Resend OTP error:', error.message);
    throw new Error('Failed to resend OTP');
  }
};


const clearOTP = async (email) => {
  try {
    const key = `otp:${email}`;
    otpStore.delete(key);
    return true;
  } catch (error) {
    console.error('❌ Failed to clear OTP:', error.message);
    throw error;
  }
};

const getPendingUser = async (email) => {
  const key = `otp:${email}`;
  const storedData = otpStore.get(key);
  if (storedData && storedData.expiresAt > Date.now()) {
    return storedData.user;
  }
  return null;
};

module.exports = {
  generateOTP,
  generateAndStoreOTP,
  verifyOTP,
  resendOTP,
  clearOTP,
  getPendingUser
  
};
