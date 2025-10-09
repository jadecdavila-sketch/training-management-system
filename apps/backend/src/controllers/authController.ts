import { Request, Response } from 'express';
import { authService } from '../services/authService.js';

export const authController = {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req: Request, res: Response) {
    try {
      const { email, password, name, role } = req.body;

      const result = await authService.register(email, password, name, role);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'User already exists') {
        return res.status(409).json({
          success: false,
          error: error.message,
        });
      }

      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to register user',
      });
    }
  },

  /**
   * POST /api/auth/login
   * Login with email and password
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        return res.status(401).json({
          success: false,
          error: error.message,
        });
      }

      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to login',
      });
    }
  },

  /**
   * POST /api/auth/refresh
   * Refresh access token using refresh token
   */
  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token required',
        });
      }

      const result = await authService.refreshAccessToken(refreshToken);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid refresh token') {
        return res.status(401).json({
          success: false,
          error: error.message,
        });
      }

      console.error('Refresh error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to refresh token',
      });
    }
  },

  /**
   * GET /api/auth/me
   * Get current user info (requires authentication)
   */
  async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const user = await authService.getUserById(req.user.userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user',
      });
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
