/**
 * Request Validation Schemas
 * All validation schemas using Zod
 */

const { z } = require('zod');

/**
 * Auth - Register validation schema
 */
const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .trim(),
    
    email: z
      .string()
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim(),
    
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

/**
 * Auth - Verify OTP validation schema
 */
const verifyOTPSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim(),
    
    otp: z
      .string()
      .min(6, 'OTP must be 6 digits')
      .max(6, 'OTP must be 6 digits')
      .regex(/^\d+$/, 'OTP must contain only numbers'),
  }),
});

/**
 * Auth - Resend OTP validation schema
 */
const resendOTPSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim(),
  }),
});

/**
 * Auth - Login validation schema
 */
const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim(),
    
    password: z
      .string()
      .min(1, 'Password is required'),
  }),
});

/**
 * User - Update profile validation schema
 */
const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .trim()
      .optional(),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .optional(),

    confirmPassword: z.string().optional(),
  })
  .refine((data) => data.name || data.password, {
    message: 'At least one field is required',
    path: ['body'],
  })
  .refine((data) => {
    if (!data.password && !data.confirmPassword) return true;
    return data.password === data.confirmPassword;
  }, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

/**
 * Validation middleware creator
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Validate the request
      const validatedData = schema.parse({
        body: req.body,
      });

      // Replace request body with validated data
      req.body = validatedData.body;
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          error: 'Validation Error',
          details: formattedErrors,
          timestamp: new Date().toISOString(),
        });
      }

      next(error);
    }
  };
};

module.exports = {
  registerSchema,
  verifyOTPSchema,
  resendOTPSchema,
  loginSchema,
  updateProfileSchema,
  validateRequest,
};
