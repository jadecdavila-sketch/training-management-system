import session from 'express-session';
import { RedisStore } from 'connect-redis'; // Named export
import Redis from 'ioredis';

// Redis client for session storage
export const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  // Connection will auto-reconnect on failure
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redisClient.on('connect', () => {
  console.log('✓ Redis connected for session storage');
});

// Session configuration
export const sessionConfig = session({
  store: new RedisStore({
    client: redisClient,
    prefix: 'tms:sess:', // Namespace sessions
  }),
  secret: process.env.SESSION_SECRET || 'change-me-in-production-please',
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something stored
  name: 'tms.sid', // Custom session cookie name
  cookie: {
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax', // CSRF protection ('strict' would break SAML callback)
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  },
  rolling: true, // Reset expiry on each request
});
