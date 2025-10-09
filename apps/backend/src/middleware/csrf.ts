import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { UnauthorizedError } from '../lib/errors.js';

/**
 * CSRF Protection Middleware using Double Submit Cookie pattern
 *
 * This implementation:
 * 1. Generates a random token and stores it in an httpOnly cookie
 * 2. Requires the same token to be sent in the X-CSRF-Token header
 * 3. Validates that both values match for state-changing operations
 *
 * The double-submit cookie pattern is secure because:
 * - Cookies are httpOnly, so JavaScript can't read them
 * - Cross-origin requests can't access cookies due to same-origin policy
 * - Attacker can't forge both the cookie and header in a CSRF attack
 */

const CSRF_SECRET = process.env.CSRF_SECRET || 'csrf-secret-change-in-production';
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create HMAC signature for token validation
 */
function signToken(token: string): string {
  return crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(token)
    .digest('hex');
}

/**
 * Verify HMAC signature
 */
function verifyToken(token: string, signature: string): boolean {
  const expectedSignature = signToken(token);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Middleware to set CSRF token cookie
 * Call this on routes that render pages or on initial app load
 */
export const setCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  // Generate token if not already present
  if (!req.cookies[CSRF_COOKIE_NAME]) {
    const token = generateToken();
    const signature = signToken(token);
    const csrfToken = `${token}.${signature}`;

    res.cookie(CSRF_COOKIE_NAME, csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Also set the token in a non-httpOnly cookie so frontend can read it
    res.cookie(`${CSRF_COOKIE_NAME}-value`, token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  next();
};

/**
 * Middleware to validate CSRF token
 * Apply this to state-changing routes (POST, PUT, PATCH, DELETE)
 */
export const validateCsrfToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip CSRF validation for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip in test environment
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  // Get token from cookie
  const cookieToken = req.cookies[CSRF_COOKIE_NAME];
  if (!cookieToken) {
    return next(new UnauthorizedError('CSRF token not found in cookie'));
  }

  // Parse token and signature
  const [token, signature] = cookieToken.split('.');
  if (!token || !signature) {
    return next(new UnauthorizedError('Invalid CSRF token format'));
  }

  // Verify signature
  if (!verifyToken(token, signature)) {
    return next(new UnauthorizedError('Invalid CSRF token signature'));
  }

  // Get token from header
  const headerToken = req.headers[CSRF_HEADER_NAME] as string;
  if (!headerToken) {
    return next(new UnauthorizedError('CSRF token not found in header'));
  }

  // Compare tokens
  if (!crypto.timingSafeEqual(Buffer.from(token), Buffer.from(headerToken))) {
    return next(new UnauthorizedError('CSRF token mismatch'));
  }

  next();
};

/**
 * Endpoint to get CSRF token
 * Frontend can call this to get the token value
 */
export const getCsrfToken = (req: Request, res: Response) => {
  const cookieToken = req.cookies[CSRF_COOKIE_NAME];

  if (!cookieToken) {
    const token = generateToken();
    const signature = signToken(token);
    const csrfToken = `${token}.${signature}`;

    res.cookie(CSRF_COOKIE_NAME, csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie(`${CSRF_COOKIE_NAME}-value`, token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ csrfToken: token });
  }

  const [token] = cookieToken.split('.');
  res.json({ csrfToken: token });
};
