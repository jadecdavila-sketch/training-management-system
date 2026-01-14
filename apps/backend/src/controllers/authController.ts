import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';

export const authController = {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, role } = req.body;

      const result = await authService.register(email, password, name, role);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      // Pass error to error handler middleware
      next(error);
    }
  },

  /**
   * POST /api/auth/login
   * Login with email and password
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/refresh
   * Refresh access token using refresh token
   */
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      const result = await authService.refreshAccessToken(refreshToken);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/auth/me
   * Get current user info (requires authentication)
   */
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      // DEVELOPMENT: Return mock user if using BYPASS_AUTH
      if (process.env.BYPASS_AUTH === 'true' && process.env.NODE_ENV === 'development' && req.user.userId === 'test-user-id') {
        return res.json({
          success: true,
          data: {
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test Admin User',
            role: 'ADMIN',
          },
        });
      }

      const user = await authService.getUserById(req.user.userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/logout
   * Logout (client-side token deletion, server just acknowledges)
   */
  async logout(_req: Request, res: Response) {
    // With JWT, logout is handled client-side by deleting the token
    // This endpoint exists for consistency and future session management
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  },
};
