const { z } = require('zod');

const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const registerSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50),
  email: z.string().email('Invalid email format'),
  password: passwordSchema,
});

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: passwordSchema,
});

module.exports = { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema };