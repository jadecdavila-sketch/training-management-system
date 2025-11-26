import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import passport from './config/passport.js';
import { sessionConfig } from './config/session.js';
import { validateEnvironment } from './config/validateEnv.js';
import authRoutes from './routes/auth.js';
import samlAuthRoutes from './routes/saml-auth.js';
import participantRoutes from './routes/participants.js';
import userRoutes from './routes/users.js';
import locationRoutes from './routes/locations.js';
import programRoutes from './routes/programs.js';
import scheduleRoutes from './routes/schedules.js';
import cohortEnrollmentRoutes from './routes/cohortEnrollments.js';
import seedRoutes from './routes/seed.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { logger } from './lib/logger.js';
import { requestLogger } from './middleware/requestLogger.js';
import { getCsrfToken, setCsrfToken } from './middleware/csrf.js';

// Load environment variables
dotenv.config();

// Validate environment configuration before starting server
validateEnvironment();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(requestLogger);

// Log CORS configuration and normalize origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']).map(origin => {
  // Add https:// if missing
  const trimmed = origin.trim();
  if (trimmed && !trimmed.startsWith('http')) {
    return `https://${trimmed}`;
  }
  return trimmed;
});
logger.info('CORS Configuration', {
  allowedOrigins,
  nodeEnv: process.env.NODE_ENV,
});

app.use(cors({
  origin: (origin, callback) => {
    logger.debug('CORS request', { origin });
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked origin', { origin, allowedOrigins });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));
app.use(express.json());
app.use(cookieParser());

// Session middleware (for SSO)
app.use(sessionConfig);

// Initialize Passport for SSO
app.use(passport.initialize());
app.use(passport.session());

// Apply general API rate limiting to all routes
app.use('/api', apiLimiter);

// CSRF token endpoint (should be called before authenticated requests)
app.get('/api/csrf-token', setCsrfToken, getCsrfToken);

// Routes
app.use('/api/auth', authRoutes); // Original JWT auth (register/login)
app.use('/auth/saml', samlAuthRoutes); // SAML SSO routes
app.use('/api/participants', participantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/cohort-enrollments', cohortEnrollmentRoutes);
app.use('/api/seed', seedRoutes);

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, {
    port: PORT,
    nodeEnv: process.env.NODE_ENV,
  });
});