import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { z } from 'zod';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
  name: z.string().min(1, 'Name required').max(200),
  role: z.enum(['ADMIN', 'COORDINATOR', 'HR', 'FACILITATOR']).optional().default('FACILITATOR'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(1, 'Password required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required'),
});

// Public routes with strict rate limiting
router.post('/register', authLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);
router.post('/refresh', authLimiter, validateBody(refreshSchema), authController.refresh);

// Protected routes
router.get('/me', requireAuth, authController.me);
router.post('/logout', requireAuth, authController.logout);

export default router;
