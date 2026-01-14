import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import { auditService } from '../services/auditService.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware to require authentication
 * Supports both:
 * 1. JWT from Authorization header (for API clients)
 * 2. JWT from cookie (for browser sessions after SSO)
 *
 * In development, if BYPASS_AUTH=true, bypasses auth with a test user
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // DEVELOPMENT: Bypass authentication if enabled
    // Multiple safeguards to prevent accidental use in production
    if (
      process.env.BYPASS_AUTH === 'true' &&
      process.env.NODE_ENV === 'development' &&
      !process.env.DATABASE_URL?.includes('prod') &&
      !process.env.DATABASE_URL?.includes('railway') &&
      !process.env.DATABASE_URL?.includes('render')
    ) {
      req.user = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'ADMIN',
      };
      return next();
    }

    let token: string | undefined;

    // Strategy 1: Check Authorization header (API clients)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Strategy 2: Check cookie (browser after SSO login)
    if (!token && req.cookies?.auth_token) {
      token = req.cookies.auth_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    // Verify token
    const decoded = authService.verifyToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

/**
 * Middleware to require specific role(s)
 * Must be used after requireAuth middleware
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      // Log authorization denial
      auditService.logAuthorizationDenied(req, allowedRoles, req.user.role);

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole: req.user.role,
      });
    }

    next();
  };
};

/**
 * Optional auth middleware
 * Attaches user if token is valid, but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = authService.verifyToken(token);

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    // Token is invalid, but that's okay for optional auth
    next();
  }
};
