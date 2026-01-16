import session from 'express-session';

// Only use Redis for session storage when SAML/SSO is enabled
// For JWT-only auth, we don't need persistent sessions
const isSamlEnabled = process.env.SAML_ENABLED === 'true';

let sessionStore: session.Store | undefined;

if (isSamlEnabled) {
  // Dynamically import Redis only when needed
  const { RedisStore } = await import('connect-redis');
  const Redis = (await import('ioredis')).default;

  const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  });

  redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  redisClient.on('connect', () => {
    console.log('✓ Redis connected for session storage');
  });

  sessionStore = new RedisStore({
    client: redisClient,
    prefix: 'tms:sess:',
  });
}

// Session configuration
export const sessionConfig = session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'change-me-in-production-please',
  resave: false,
  saveUninitialized: false,
  name: 'tms.sid',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  },
  rolling: true,
});
