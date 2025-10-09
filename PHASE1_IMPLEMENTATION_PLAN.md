# Phase 1: Minimum Viable Security
## 2-Week Implementation Plan

**Goal:** Transform the TMS from "demo" to "safely testable with real users"

**Timeline:** 10 business days
**Team Size:** 1 developer (you)
**Outcome:** App secured enough for limited production use

---

## Week 1: Authentication + Validation

### Day 1-2: Backend Validation ✅ STARTED

**What:** Prevent malicious/invalid data from entering the system

**Files Created:**
- ✅ `apps/backend/src/validation/schemas.ts` - All Zod schemas
- ✅ `apps/backend/src/middleware/validate.ts` - Validation middleware
- ✅ Updated `apps/backend/src/routes/participants.ts` - Example implementation

**Tasks Remaining:**
- [ ] Update all other routes with validation:
  - `routes/programs.ts`
  - `routes/users.ts`
  - `routes/locations.ts`
  - `routes/schedules.ts`
  - `routes/cohortEnrollments.ts`
- [ ] Test validation with invalid data (Postman/curl)
- [ ] Update frontend to handle validation errors

**Testing Checklist:**
```bash
# Test invalid email
curl -X POST http://localhost:4000/api/participants \
  -H "Content-Type: application/json" \
  -d '{"email": "not-an-email", "firstName": "John", "lastName": "Doe"}'
# Expected: 400 error with field-specific message

# Test missing required fields
curl -X POST http://localhost:4000/api/participants \
  -H "Content-Type: application/json" \
  -d '{"email": "john@test.com"}'
# Expected: 400 error listing missing fields

# Test valid data
curl -X POST http://localhost:4000/api/participants \
  -H "Content-Type: application/json" \
  -d '{"email": "john@test.com", "firstName": "John", "lastName": "Doe"}'
# Expected: 201 success
```

**Estimated Time:** 8-10 hours

---

### Day 3-4: Authentication System

**What:** Implement JWT-based authentication

#### Step 1: Install Dependencies

```bash
cd apps/backend
pnpm add jsonwebtoken
pnpm add -D @types/jsonwebtoken
```

#### Step 2: Create Auth Service

**Create:** `apps/backend/src/services/authService.ts`

```typescript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // 7 days

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(email: string, password: string, name: string, role: string) {
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  /**
   * Login existing user
   */
  static async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Generate JWT token
   */
  private static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }
}
```

#### Step 3: Create Auth Middleware

**Create:** `apps/backend/src/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';

// Extend Express Request to include user
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
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Verify token
    const payload = AuthService.verifyToken(token);

    // Attach user to request
    req.user = payload;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

/**
 * Middleware to require specific roles
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    next();
  };
};
```

#### Step 4: Create Auth Controller

**Create:** `apps/backend/src/controllers/authController.ts`

```typescript
import { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    const { user, token } = await AuthService.register(email, password, name, role);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Registration failed',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await AuthService.login(email, password);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || 'Login failed',
    });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    // Fetch fresh user data
    const { prisma } = await import('../lib/prisma.js');
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch user',
    });
  }
};
```

#### Step 5: Create Auth Routes

**Create:** `apps/backend/src/routes/auth.ts`

```typescript
import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { validateBody } from '../middleware/validate.js';
import { loginSchema, createUserSchema } from '../validation/schemas.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  validateBody(createUserSchema),
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  validateBody(loginSchema),
  authController.login
);

// GET /api/auth/me - Get current user
router.get('/me', requireAuth, authController.me);

export default router;
```

#### Step 6: Update Main Index

**Edit:** `apps/backend/src/index.ts`

```typescript
// Add this import near the top
import authRoutes from './routes/auth.js';

// Add this route BEFORE other routes
app.use('/api/auth', authRoutes);
```

#### Step 7: Add Environment Variable

**Edit:** `apps/backend/.env` (create if doesn't exist)

```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
```

**⚠️ IMPORTANT:** Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Step 8: Protect Existing Routes

**Example:** `apps/backend/src/routes/participants.ts`

```typescript
import { requireAuth, requireRole } from '../middleware/auth.js';

// Protect all routes - require authentication
router.use(requireAuth);

// GET /api/participants - Admin or HR can view
router.get(
  '/',
  requireRole(['ADMIN', 'HR']),
  validateQuery(paginationSchema.merge(searchSchema)),
  participantController.getAll
);

// POST /api/participants - Admin or HR can create
router.post(
  '/',
  requireRole(['ADMIN', 'HR']),
  validateBody(createParticipantSchema),
  participantController.create
);

// DELETE - Admin only
router.delete(
  '/:id',
  requireRole(['ADMIN']),
  participantController.remove
);
```

**Do the same for all routes** with appropriate role restrictions.

**Testing:**
```bash
# Register a new user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "SecurePass123!",
    "name": "Admin User",
    "role": "ADMIN"
  }'
# Save the token from response

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "SecurePass123!"}'
# Save the token

# Test protected route WITHOUT token
curl http://localhost:4000/api/participants
# Expected: 401 Unauthorized

# Test protected route WITH token
curl http://localhost:4000/api/participants \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
# Expected: 200 success
```

**Estimated Time:** 12-16 hours

---

### Day 5: Rate Limiting

**What:** Prevent brute force attacks and API abuse

#### Step 1: Install Dependencies

```bash
cd apps/backend
pnpm add express-rate-limit
```

#### Step 2: Configure Rate Limiting

**Edit:** `apps/backend/src/index.ts`

```typescript
import rateLimit from 'express-rate-limit';

// ... existing imports

// Authentication rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 requests per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/health';
  },
});

// Apply rate limiters
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);
```

**Testing:**
```bash
# Try to login 6 times in a row with wrong password
for i in {1..6}; do
  curl -X POST http://localhost:4000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@test.com", "password": "wrong"}'
done
# 6th request should be blocked with 429 status
```

**Estimated Time:** 2 hours

---

## Week 2: Infrastructure + Monitoring

### Day 6: Database Indexes

**What:** Make queries fast at scale

**Edit:** `apps/backend/prisma/schema.prisma`

```prisma
model Participant {
  id         String   @id @default(cuid())
  email      String   @unique
  firstName  String
  lastName   String
  jobTitle   String?
  department String?
  location   String?
  hireDate   DateTime?
  status     String   @default("active")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  cohorts    CohortParticipant[]

  // Add these indexes
  @@index([email])
  @@index([hireDate])
  @@index([location])
  @@index([department])
  @@index([location, hireDate]) // Composite for filtering
  @@map("participants")
}

model Schedule {
  id            String   @id @default(cuid())
  cohortId      String
  sessionId     String
  facilitatorId String?
  locationId    String?
  startTime     DateTime
  endTime       DateTime
  status        String   @default("scheduled")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  cohort        Cohort       @relation(fields: [cohortId], references: [id], onDelete: Cascade)
  session       Session      @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  facilitator   Facilitator? @relation(fields: [facilitatorId], references: [id])
  location      Location?    @relation(fields: [locationId], references: [id])

  // Add these indexes
  @@index([cohortId])
  @@index([facilitatorId])
  @@index([locationId])
  @@index([startTime])
  @@index([cohortId, startTime]) // Composite for schedule queries
  @@map("schedules")
}

model Program {
  id          String   @id @default(cuid())
  name        String
  description String?
  duration    Int
  objectives  String[]
  formData    Json?
  archived    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  sessions    Session[]
  cohorts     Cohort[]

  // Add these indexes
  @@index([archived])
  @@index([createdAt])
  @@map("programs")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      UserRole
  password  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  facilitatorProfile Facilitator?

  // Add these indexes
  @@index([email])
  @@index([role])
  @@map("users")
}

model CohortParticipant {
  cohortId      String
  participantId String
  enrolledAt    DateTime @default(now())

  cohort        Cohort      @relation(fields: [cohortId], references: [id], onDelete: Cascade)
  participant   Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)

  @@id([cohortId, participantId])
  @@index([cohortId]) // Add this
  @@index([participantId]) // Add this
  @@map("cohort_participants")
}
```

**Run Migration:**
```bash
cd apps/backend
pnpm prisma migrate dev --name add_indexes
```

**Testing:**
```sql
-- Check indexes were created
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Estimated Time:** 2 hours

---

### Day 7: Structured Logging

**What:** Replace console.log with proper logging

#### Step 1: Install Winston

```bash
cd apps/backend
pnpm add winston
```

#### Step 2: Create Logger

**Create:** `apps/backend/src/lib/logger.ts`

```typescript
import winston from 'winston';

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'tms-backend',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: isDevelopment
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        : winston.format.json(),
    }),
  ],
});

export default logger;
```

#### Step 3: Replace console.log

**Before:**
```typescript
console.log('CORS Configuration:', config);
console.error('Failed to fetch programs:', error);
```

**After:**
```typescript
import logger from '../lib/logger.js';

logger.info('CORS Configuration', { config });
logger.error('Failed to fetch programs', { error: error.message, stack: error.stack });
```

**Search and replace:**
```bash
cd apps/backend/src
grep -r "console.log" . --include="*.ts"
# Replace each with appropriate logger.info(), logger.error(), etc.
```

**Estimated Time:** 3-4 hours

---

### Day 8: Error Handling

**What:** Consistent error responses and proper status codes

#### Step 1: Custom Error Classes

**Create:** `apps/backend/src/errors/AppError.ts`

```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
  }
}
```

#### Step 2: Update Error Handler

**Edit:** `apps/backend/src/middleware/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import logger from '../lib/logger.js';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Default to 500 server error
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  // Check if it's our custom error
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Log error
  if (statusCode >= 500) {
    logger.error('Server error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      statusCode,
    });
  } else {
    logger.warn('Client error', {
      error: err.message,
      path: req.path,
      method: req.method,
      statusCode,
    });
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err,
    }),
  });
};

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection', { reason: reason.message, stack: reason.stack });
  // Optionally exit process in production
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Catch uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  // Exit process - app is in unknown state
  process.exit(1);
});
```

#### Step 3: Use Custom Errors in Controllers

**Example:**
```typescript
import { NotFoundError, ConflictError } from '../errors/AppError.js';

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const participant = await prisma.participant.findUnique({ where: { id } });

  if (!participant) {
    throw new NotFoundError('Participant not found');
  }

  res.json({ success: true, data: participant });
};

export const create = async (req: Request, res: Response) => {
  const { email } = req.body;

  // Check if exists
  const existing = await prisma.participant.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictError('Participant with this email already exists');
  }

  const participant = await prisma.participant.create({ data: req.body });

  res.status(201).json({ success: true, data: participant });
};
```

**Estimated Time:** 4-5 hours

---

### Day 9: Database Backups + CSRF Protection

**What:** Protect data + prevent CSRF attacks

#### Task 1: Database Backups (Render)

1. Go to Render Dashboard → tms-database
2. Click "Backups" tab
3. Enable daily backups (if not on free tier, upgrade to Starter $7/month)
4. Test manual backup: Click "Create Backup Now"
5. Test restore: Create test participant, delete it, restore from backup

**Alternative (Free):** Manual backups via cron job
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backups/backup_$DATE.sql
# Keep only last 7 backups
ls -t backups/backup_*.sql | tail -n +8 | xargs rm -f
EOF

chmod +x backup.sh

# Run daily via cron (on your local machine or server)
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

#### Task 2: CSRF Protection

```bash
cd apps/backend
pnpm add csurf cookie-parser
```

**Edit:** `apps/backend/src/index.ts`

```typescript
import cookieParser from 'cookie-parser';
import csrf from 'csurf';

// Add after express.json()
app.use(cookieParser());

// CSRF protection for state-changing methods
const csrfProtection = csrf({ cookie: true });

// Apply to specific routes (not GET requests)
app.use('/api', (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Apply CSRF protection
  csrfProtection(req, res, next);
});

// Endpoint to get CSRF token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

**Frontend Update:** `apps/frontend/src/services/api.ts`

```typescript
// Get CSRF token on app load
let csrfToken: string | null = null;

async function getCsrfToken() {
  if (!csrfToken) {
    const response = await fetch(`${API_BASE}/csrf-token`, {
      credentials: 'include', // Send cookies
    });
    const data = await response.json();
    csrfToken = data.csrfToken;
  }
  return csrfToken;
}

// Update fetchApi function
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  // Get CSRF token for non-GET requests
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (options?.method && !['GET', 'HEAD'].includes(options.method)) {
    const token = await getCsrfToken();
    headers['X-CSRF-Token'] = token;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include', // Send cookies
    headers,
  });

  // ... rest of function
}
```

**Estimated Time:** 3-4 hours

---

### Day 10: Frontend Error Handling + Testing

**What:** Add error boundary, test everything

#### Task 1: Error Boundary

**Create:** `apps/frontend/src/components/ErrorBoundary.tsx`

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              An unexpected error occurred. Please refresh the page or contact support.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {this.state.error?.stack}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Edit:** `apps/frontend/src/main.tsx`

```typescript
import { ErrorBoundary } from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
```

#### Task 2: Comprehensive Testing

**Create test checklist:**

```markdown
# Phase 1 Testing Checklist

## Authentication
- [ ] Register new user (valid data)
- [ ] Register duplicate email (expect 409 error)
- [ ] Register with weak password (expect 400 error)
- [ ] Login with correct credentials
- [ ] Login with wrong password (expect 401 error)
- [ ] Access protected route without token (expect 401)
- [ ] Access protected route with valid token (expect 200)
- [ ] Access protected route with expired token (expect 401)
- [ ] HR user tries to delete program (expect 403 Forbidden)

## Validation
- [ ] Create participant with invalid email (expect 400)
- [ ] Create participant with missing required fields (expect 400)
- [ ] Create participant with valid data (expect 201)
- [ ] Create program with no sessions (expect 400)
- [ ] Import 1001 participants (expect 400 - exceeds limit)

## Rate Limiting
- [ ] Make 6 login attempts in < 15 min (6th should be 429)
- [ ] Make 101 API requests in < 15 min (101st should be 429)
- [ ] Wait 15 minutes, verify rate limit resets

## Database
- [ ] Query participants with hire date filter (check performance)
- [ ] Verify indexes exist: `\d+ participants` in psql
- [ ] Create 1000 participants, query by location (should be < 100ms)

## CSRF
- [ ] GET request without CSRF token (should work)
- [ ] POST request without CSRF token (should fail 403)
- [ ] POST request with valid CSRF token (should work)

## Error Handling
- [ ] Cause a server error, verify logs are structured JSON
- [ ] Trigger validation error, verify user-friendly message
- [ ] Access non-existent resource, verify 404 response
- [ ] Break React component, verify ErrorBoundary catches it

## Security
- [ ] Verify JWT_SECRET is not default value in production
- [ ] Verify passwords are hashed in database (not plain text)
- [ ] Verify CORS only allows your frontend domain
- [ ] Verify sensitive data not logged (passwords, tokens)
```

**Estimated Time:** 6-8 hours

---

## Deployment

### Pre-Deployment Checklist

- [ ] All tests passing locally
- [ ] Environment variables configured in Render:
  ```
  JWT_SECRET=<generated-secure-secret>
  NODE_ENV=production
  DATABASE_URL=<render-postgres-url>
  ALLOWED_ORIGINS=https://tms-frontend-nnh5.onrender.com
  ```
- [ ] Database backups enabled
- [ ] Structured logging working
- [ ] Rate limiting tested

### Deploy Steps

1. **Commit and push:**
```bash
git add -A
git commit -m "feat(security): Phase 1 - Authentication, validation, rate limiting, logging

- Add Zod validation schemas for all endpoints
- Implement JWT authentication with role-based access control
- Add rate limiting for auth (5/15min) and API (100/15min)
- Replace console.log with Winston structured logging
- Add custom error classes with proper HTTP status codes
- Implement CSRF protection for state-changing requests
- Add database indexes for performance
- Add frontend error boundary
- Set up database backup strategy

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push
```

2. **Monitor deployment:**
   - Watch Render logs for errors
   - Check health endpoint: `curl https://tms-backend-pbto.onrender.com/health`
   - Test login: POST to `/api/auth/login`

3. **Smoke test production:**
```bash
# Set backend URL
BACKEND=https://tms-backend-pbto.onrender.com

# Login
curl -X POST $BACKEND/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tms.com","password":"admin123"}'

# Save token, then test protected route
curl $BACKEND/api/participants \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Success Criteria

By end of Week 2, you should have:

✅ **Security:**
- JWT authentication working
- RBAC enforced (Admin/HR/Facilitator roles)
- Rate limiting active
- CSRF protection enabled
- Input validation on all endpoints
- Passwords hashed with bcrypt

✅ **Reliability:**
- Custom error classes with proper status codes
- Structured logging (Winston)
- Error boundary in React
- Database backups configured

✅ **Performance:**
- Database indexes on all filtered fields
- Query times < 100ms for common operations

✅ **Deployment:**
- Production environment variables set
- No console.log in production
- Monitoring/logging working

---

## What's Still Missing (For Later)

This gets you to **"safely testable"** but NOT fully enterprise-ready:

**Phase 2 (Weeks 3-6):**
- SSO (Azure AD, Okta)
- Redis caching
- Horizontal scaling
- APM monitoring (Datadog)
- Audit logging

**Phase 3 (Weeks 7-10):**
- Outlook calendar integration
- Service layer refactor
- Load testing
- Disaster recovery plan

**Phase 4 (Weeks 11-12):**
- Penetration testing
- Security audit
- SOC 2 prep

---

## Resources

**Documentation to read:**
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

**Tools:**
- [JWT.io](https://jwt.io/) - Debug JWTs
- [Postman](https://www.postman.com/) - API testing
- [Render Docs](https://render.com/docs) - Deployment

---

## Getting Help

If you get stuck:

1. **Check logs:** `apps/backend` - Winston will show structured logs
2. **Test in isolation:** Use curl/Postman to test individual endpoints
3. **Rollback if needed:** `git revert HEAD` to undo last commit

---

**Ready to start?** Begin with Day 1-2 (Backend Validation) - the foundation is already laid with the files I created above!
