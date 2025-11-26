import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ConflictError, UnauthorizedError, NotFoundError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';

// Validate JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
if (process.env.NODE_ENV === 'production' && JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production');
}
if (JWT_SECRET === 'your-secret-key-change-in-production' || JWT_SECRET === 'your-super-secret-jwt-key-change-this-min-32-characters') {
  throw new Error('JWT_SECRET must be changed from default value');
}

const JWT_EXPIRES_IN = '8h'; // Changed from 15m to 8h for better UX
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  /**
   * Register a new user
   */
  async register(email: string, password: string, name: string, role: 'ADMIN' | 'COORDINATOR' | 'HR' | 'FACILITATOR' = 'FACILITATOR') {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('User already exists');
    }

    // Hash password with bcrypt (work factor 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        password: hashedPassword,
      },
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  },

  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  },

  /**
   * Verify and decode JWT token
   */
  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  },

  /**
   * Generate access and refresh tokens
   */
  generateTokens(userId: string, email: string, role: string): AuthTokens {
    const payload: TokenPayload = {
      userId,
      email,
      role,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    return {
      accessToken,
      refreshToken,
    };
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.verifyToken(refreshToken);

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user.id, user.email, user.role);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        ...tokens,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid refresh token');
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        ssoProvider: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  },

  /**
   * Generate tokens from SSO user (after SAML authentication)
   */
  generateTokensFromSSOUser(user: any) {
    return this.generateTokens(user.id, user.email, user.role);
  },

  /**
   * Find or create SSO user (for external auth providers like Auth0)
   * This is for future Auth0 integration compatibility
   */
  async findOrCreateSSOUser(email: string, name: string, ssoProvider: string, ssoId: string, role: string = 'FACILITATOR') {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          role: role as any,
          ssoProvider,
          ssoId,
          lastLoginAt: new Date(),
        },
      });
    } else {
      // Update SSO info if changed
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          ssoProvider,
          ssoId,
          lastLoginAt: new Date(),
        },
      });
    }

    return user;
  },
};
