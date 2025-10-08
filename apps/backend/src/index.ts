import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import participantRoutes from './routes/participants.js';
import userRoutes from './routes/users.js';
import locationRoutes from './routes/locations.js';
import programRoutes from './routes/programs.js';
import scheduleRoutes from './routes/schedules.js';
import cohortEnrollmentRoutes from './routes/cohortEnrollments.js';
import seedRoutes from './routes/seed.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());

// Log CORS configuration and normalize origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']).map(origin => {
  // Add https:// if missing
  if (origin && !origin.startsWith('http')) {
    return `https://${origin}`;
  }
  return origin;
});
console.log('CORS Configuration:', {
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  allowedOrigins,
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Routes
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
  console.log(`Server running on port ${PORT}`);
});