# Pre-Deployment Testing Guide

This guide provides detailed test cases to run before deploying to production. Complete all sections to ensure a safe deployment.

## Table of Contents
1. [Environment Validation](#environment-validation)
2. [Build Verification](#build-verification)
3. [Backend API Tests](#backend-api-tests)
4. [Frontend Integration Tests](#frontend-integration-tests)
5. [Security Tests](#security-tests)
6. [Performance Tests](#performance-tests)
7. [Error Handling Tests](#error-handling-tests)
8. [Sign-Off Checklist](#sign-off-checklist)

---

## Environment Validation

### Test 1: Production Environment Variables

**Purpose**: Ensure all required environment variables are set and valid.

**Steps**:
```bash
cd apps/backend

# Test with production-like environment
cp .env .env.backup
cp .env.example .env

# Fill in production values (use dummy but valid secrets for testing)
# DO NOT use actual production secrets for local testing
```

**Expected Result**:
- Server should fail to start with helpful error messages if any variables are invalid
- Error messages should clearly indicate which variables need fixing
- Server should start successfully when all variables are properly configured

**Test Cases**:
```bash
# Test 1.1: Missing JWT_SECRET
unset JWT_SECRET
pnpm dev
# Expected: Error message about missing JWT_SECRET

# Test 1.2: Weak JWT_SECRET
JWT_SECRET="short" pnpm dev
# Expected: Error about JWT_SECRET being too short

# Test 1.3: Invalid DATABASE_URL
DATABASE_URL="invalid-url" pnpm dev
# Expected: Error about invalid database URL format

# Test 1.4: BYPASS_AUTH in production
NODE_ENV=production BYPASS_AUTH=true pnpm dev
# Expected: Error preventing BYPASS_AUTH in production

# Test 1.5: Valid configuration
# All variables properly set
pnpm dev
# Expected: "✅ Environment validation passed"
```

---

## Build Verification

### Test 2: Production Build

**Purpose**: Ensure code compiles without errors for production.

**Steps**:
```bash
# From project root
pnpm install --frozen-lockfile
pnpm build
```

**Expected Result**:
- ✅ Backend builds without TypeScript errors
- ✅ Frontend builds without errors or warnings
- ✅ Build output exists in `apps/backend/dist` and `apps/frontend/dist`

**Verification**:
```bash
# Check backend build
ls -lh apps/backend/dist/index.js
# Should show compiled JavaScript file

# Check frontend build
ls -lh apps/frontend/dist/index.html
ls -lh apps/frontend/dist/assets/
# Should show index.html and compiled assets
```

### Test 3: Type Checking

**Purpose**: Verify TypeScript types are correct throughout.

**Steps**:
```bash
pnpm type-check
```

**Expected Result**:
- ✅ No TypeScript errors in backend
- ✅ No TypeScript errors in frontend
- ✅ All strict mode checks pass

---

## Backend API Tests

### Test 4: Server Startup

**Purpose**: Verify server starts correctly with production build.

**Steps**:
```bash
cd apps/backend
pnpm build
NODE_ENV=production node dist/index.js
```

**Expected Result**:
- ✅ Environment validation passes
- ✅ Database connection successful
- ✅ Server listening on specified PORT
- ✅ No errors in console
- ✅ Log messages show proper structured logging (JSON format)

**Look For**:
```
✅ Environment validation passed
{"level":"info","message":"Server running on port 4000",...}
```

### Test 5: Health Check

**Purpose**: Verify health check endpoint works.

**Steps**:
```bash
# With server running
curl http://localhost:4000/health
```

**Expected Result**:
```json
{"status":"ok"}
```

### Test 6: Database Connectivity

**Purpose**: Verify database connection and migrations are current.

**Steps**:
```bash
cd apps/backend

# Check migration status
pnpm prisma migrate status

# Run any pending migrations
pnpm prisma migrate deploy
```

**Expected Result**:
- ✅ All migrations applied
- ✅ No pending migrations
- ✅ Database schema matches Prisma schema

### Test 7: Authentication Flow

**Purpose**: Test complete authentication workflow.

**Test 7.1: User Registration**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User",
    "role": "ADMIN"
  }'
```

**Expected Result**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "name": "Test User",
      "role": "ADMIN"
    },
    "token": "eyJhbGc..."
  }
}
```

**Test 7.2: User Login**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

**Expected Result**:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGc..."
  }
}
```

**Test 7.3: Protected Endpoint**
```bash
# Extract token from login response
TOKEN="your-token-here"

curl http://localhost:4000/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result**:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "role": "ADMIN"
  }
}
```

**Test 7.4: Invalid Token**
```bash
curl http://localhost:4000/api/users/me \
  -H "Authorization: Bearer invalid-token"
```

**Expected Result**:
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

### Test 8: RBAC Authorization

**Purpose**: Verify role-based access control works correctly.

**Test 8.1: ADMIN Access**
```bash
# Login as ADMIN (from Test 7.2)
# Access admin-only endpoint
curl http://localhost:4000/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Result**: ✅ Success (200 OK)

**Test 8.2: Non-ADMIN Denied**
```bash
# Register as HR user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hr@example.com",
    "password": "HRPassword123!",
    "name": "HR User",
    "role": "HR"
  }'

# Try to access admin endpoint
curl http://localhost:4000/api/users \
  -H "Authorization: Bearer $HR_TOKEN"
```

**Expected Result**: ❌ 403 Forbidden
```json
{
  "success": false,
  "error": "Insufficient permissions",
  "requiredRoles": ["ADMIN"],
  "userRole": "HR"
}
```

### Test 9: Input Validation

**Purpose**: Verify Zod validation rejects invalid inputs.

**Test 9.1: Invalid Email**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "password": "TestPassword123!",
    "name": "Test User",
    "role": "ADMIN"
  }'
```

**Expected Result**: ❌ 400 Bad Request with validation errors

**Test 9.2: Weak Password**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "weak",
    "name": "Test User",
    "role": "ADMIN"
  }'
```

**Expected Result**: ❌ 400 Bad Request
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "message": "Password must be at least 12 characters",
      ...
    }
  ]
}
```

**Test 9.3: Invalid Role**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test3@example.com",
    "password": "TestPassword123!",
    "name": "Test User",
    "role": "SUPERUSER"
  }'
```

**Expected Result**: ❌ 400 Bad Request with "Invalid role" error

### Test 10: Rate Limiting

**Purpose**: Verify rate limiting prevents abuse.

**Test 10.1: Auth Rate Limit**
```bash
# Send 6 login requests rapidly (limit is 5 per 15 minutes)
for i in {1..6}; do
  curl -X POST http://localhost:4000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo "Request $i"
done
```

**Expected Result**:
- First 5 requests: 401 Unauthorized (wrong password)
- 6th request: 429 Too Many Requests

**Test 10.2: API Rate Limit**
```bash
# Send 101 requests rapidly (limit is 100 per 15 minutes)
for i in {1..101}; do
  curl http://localhost:4000/health
done
```

**Expected Result**:
- First 100 requests: 200 OK
- 101st request: 429 Too Many Requests

### Test 11: CSRF Protection

**Purpose**: Verify CSRF protection is working.

**Test 11.1: Get CSRF Token**
```bash
curl -c cookies.txt http://localhost:4000/api/csrf-token
```

**Expected Result**:
```json
{"csrfToken":"..."}
```
Cookie file should contain `csrf_token` cookie.

**Test 11.2: Request Without CSRF Token (should fail)**
```bash
curl -X POST http://localhost:4000/api/programs \
  -b cookies.txt \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Program"}'
```

**Expected Result**: ❌ 403 Forbidden (CSRF token required)

**Test 11.3: Request With CSRF Token (should succeed)**
```bash
# Extract CSRF token from previous response
CSRF_TOKEN="your-csrf-token"

curl -X POST http://localhost:4000/api/programs \
  -b cookies.txt \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Program", ...}'
```

**Expected Result**: ✅ Success (if all required fields provided)

### Test 12: Program Creation Workflow

**Purpose**: Test complex multi-step program creation.

**Steps**:
```bash
# Create complete program with cohorts and sessions
curl -X POST http://localhost:4000/api/programs \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "programName": "Leadership Training 2025",
    "description": "Comprehensive leadership development program",
    "sessions": [
      {
        "name": "Leadership Fundamentals",
        "description": "Core leadership concepts",
        "duration": 120,
        "participantTypes": ["Manager"],
        "facilitatorSkills": ["Leadership"],
        "locationTypes": ["Classroom"],
        "requiresFacilitator": true,
        "groupSizeMin": 5,
        "groupSizeMax": 20
      }
    ],
    "cohortDetails": [
      {
        "id": "cohort-1",
        "name": "Q1 2025 Cohort",
        "maxParticipants": 20,
        "participantFilters": {
          "employeeStartDateFrom": "2024-01-01",
          "employeeStartDateTo": "2024-12-31"
        }
      }
    ],
    "scheduledSessions": []
  }'
```

**Expected Result**:
- ✅ 201 Created
- ✅ Response includes created program with ID
- ✅ Program, sessions, and cohort created atomically
- ✅ Audit log entry created

**Verify in Database**:
```bash
# Check program was created
cd apps/backend
pnpm prisma studio
# Navigate to Program table and verify entry
```

---

## Frontend Integration Tests

### Test 13: Frontend Build

**Purpose**: Verify frontend builds and runs correctly.

**Steps**:
```bash
cd apps/frontend
pnpm build
pnpm preview
```

**Expected Result**:
- ✅ Build completes without errors
- ✅ Preview server starts
- ✅ Application accessible at preview URL

### Test 14: Login Flow (Manual)

**Purpose**: Test complete user authentication flow.

**Steps**:
1. Open frontend in browser
2. Navigate to login page
3. Enter credentials: `test@example.com` / `TestPassword123!`
4. Click "Login"

**Expected Result**:
- ✅ Login successful
- ✅ Redirected to dashboard
- ✅ User name displayed in header
- ✅ Auth token stored (check browser DevTools → Application → Cookies/LocalStorage)

### Test 15: Protected Routes (Manual)

**Purpose**: Verify route protection works.

**Test 15.1: Access Without Login**
1. Clear browser cookies/storage
2. Navigate directly to `/admin/users`

**Expected Result**: ✅ Redirected to login page

**Test 15.2: Access After Login**
1. Login as ADMIN
2. Navigate to `/admin/users`

**Expected Result**: ✅ Users page loads

**Test 15.3: Access Denied for Wrong Role**
1. Login as HR user
2. Try to access admin-only route

**Expected Result**: ✅ Access denied message or redirect

### Test 16: Program Creation (Manual)

**Purpose**: Test complete program creation wizard.

**Steps**:
1. Login as ADMIN or COORDINATOR
2. Navigate to "Create Program"
3. Complete all wizard steps:
   - Step 1: Program details (name, description)
   - Step 2: Sessions (add at least 2 sessions)
   - Step 3: Scheduling (set dates/times)
   - Step 4: Cohorts (define cohort groups)
   - Step 5: Assignments (assign facilitators/locations)
4. Submit program

**Expected Result**:
- ✅ All steps validate correctly
- ✅ Cannot proceed with invalid data
- ✅ Success message on completion
- ✅ Program appears in programs list
- ✅ All related data (sessions, cohorts) created

### Test 17: CSV Import (Manual)

**Purpose**: Test participant bulk import.

**Test Data** (`test-participants.csv`):
```csv
email,firstName,lastName,jobTitle,department,location,hireDate
alice@company.com,Alice,Smith,Manager,Engineering,NYC,2024-01-15
bob@company.com,Bob,Jones,Developer,Engineering,SF,2024-02-20
charlie@company.com,Charlie,Brown,Analyst,Sales,NYC,2024-03-10
```

**Steps**:
1. Login as ADMIN or HR
2. Navigate to "Participants"
3. Click "Import CSV"
4. Upload test file
5. Review preview
6. Confirm import

**Expected Result**:
- ✅ CSV parsed correctly
- ✅ Preview shows all 3 participants
- ✅ Import succeeds
- ✅ Success message with count (3 participants imported)
- ✅ Participants appear in list
- ✅ All fields populated correctly

### Test 18: Error Display (Manual)

**Purpose**: Verify error handling provides good UX.

**Test 18.1: Network Error**
1. Stop backend server
2. Try to login from frontend

**Expected Result**: ✅ User-friendly error message (not raw error)

**Test 18.2: Validation Error**
1. Create program with invalid data (e.g., empty name)

**Expected Result**: ✅ Inline validation errors shown

**Test 18.3: Permission Error**
1. Login as HR
2. Try to delete a user

**Expected Result**: ✅ "Insufficient permissions" message

---

## Security Tests

### Test 19: SQL Injection Prevention

**Purpose**: Verify inputs are properly sanitized.

**Test**:
```bash
# Try SQL injection in login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com\" OR \"1\"=\"1",
    "password": "anything"
  }'
```

**Expected Result**: ❌ Login fails (not vulnerable to SQL injection)

### Test 20: XSS Prevention

**Purpose**: Verify XSS attacks are prevented.

**Test**:
```bash
# Try XSS in program name
curl -X POST http://localhost:4000/api/programs \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "programName": "<script>alert(\"XSS\")</script>",
    ...
  }'
```

**Expected Result**:
- ✅ Program created (or validation error for other reasons)
- ✅ When displayed in frontend, script tags are escaped/sanitized
- ✅ No JavaScript execution in browser

### Test 21: JWT Token Security

**Purpose**: Verify token handling is secure.

**Test 21.1: Expired Token**
1. Login and get token
2. Wait for token to expire (or manually set short expiration)
3. Use expired token

**Expected Result**: ❌ 401 Unauthorized

**Test 21.2: Tampered Token**
```bash
# Modify token payload
TOKEN="eyJhbGc...modified..."

curl http://localhost:4000/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result**: ❌ 401 Unauthorized (signature verification fails)

### Test 22: Password Security

**Purpose**: Verify passwords are hashed and not logged.

**Test 22.1: Check Database**
```bash
cd apps/backend
pnpm prisma studio
# Navigate to User table
```

**Expected Result**:
- ✅ Password field contains bcrypt hash (starts with `$2b$`)
- ✅ NOT plaintext password

**Test 22.2: Check Logs**
```bash
# Check application logs
cat apps/backend/logs/combined.log | grep -i password
```

**Expected Result**: ✅ No plaintext passwords in logs

### Test 23: HTTPS Enforcement (Production)

**Purpose**: Verify HTTPS is enforced in production.

**Steps**: Deploy to staging with HTTPS
```bash
# Try HTTP request
curl http://your-domain.com/health

# Expected: Redirect to HTTPS
# Or: Connection refused (HTTP disabled)
```

**Expected Result**: ✅ HTTPS enforced, HTTP either redirects or is disabled

---

## Performance Tests

### Test 24: Bulk Import Performance

**Purpose**: Verify bulk operations perform well.

**Test**:
```bash
# Generate large CSV file (1000 participants)
# Import via frontend or API
```

**Expected Result**:
- ✅ Import completes in reasonable time (<10 seconds for 1000 participants)
- ✅ No timeout errors
- ✅ Database handles batch insert efficiently
- ✅ No N+1 query issues

**Verify**: Check logs for batch insert confirmation

### Test 25: Concurrent Users

**Purpose**: Test system under load.

**Tools**: Apache Bench or similar
```bash
# 100 concurrent requests to health check
ab -n 1000 -c 100 http://localhost:4000/health

# 50 concurrent auth requests
ab -n 500 -c 50 -p login.json -T application/json \
  http://localhost:4000/api/auth/login
```

**Expected Result**:
- ✅ No 500 errors
- ✅ Rate limiting kicks in appropriately
- ✅ Response times acceptable (<500ms for p95)
- ✅ Server remains stable

### Test 26: Database Query Performance

**Purpose**: Verify queries are optimized.

**Test**:
```bash
# Enable Prisma query logging
# Check slow query log

# Fetch programs list with relations
curl http://localhost:4000/api/programs?page=1&pageSize=20 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result**:
- ✅ No N+1 queries in logs
- ✅ Proper use of includes/selects
- ✅ Indexes being used (check PostgreSQL EXPLAIN)
- ✅ Response time <1 second

---

## Error Handling Tests

### Test 27: Database Connection Failure

**Purpose**: Verify graceful handling of database errors.

**Test**:
```bash
# Stop PostgreSQL
sudo systemctl stop postgresql
# Or: pg_ctl stop

# Try to start server
cd apps/backend
pnpm dev
```

**Expected Result**:
- ✅ Clear error message about database connection
- ✅ Server doesn't crash silently
- ✅ Error logged properly

### Test 28: Invalid Input Handling

**Purpose**: Verify all invalid inputs are caught.

**Test 28.1: Malformed JSON**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{invalid json'
```

**Expected Result**: ❌ 400 Bad Request with clear error

**Test 28.2: Missing Required Fields**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Expected Result**: ❌ 400 Bad Request listing missing fields

**Test 28.3: Type Mismatch**
```bash
curl -X POST http://localhost:4000/api/locations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Room A",
    "capacity": "not-a-number"
  }'
```

**Expected Result**: ❌ 400 Bad Request with validation error

### Test 29: Edge Cases

**Test 29.1: Empty String**
```bash
# Create program with empty name
curl -X POST http://localhost:4000/api/programs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"programName": "", ...}'
```

**Expected Result**: ❌ Validation error (name required)

**Test 29.2: Very Long Input**
```bash
# Create participant with 1000-character name
LONG_NAME=$(python3 -c "print('A' * 1000)")

curl -X POST http://localhost:4000/api/participants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"firstName\": \"$LONG_NAME\", ...}"
```

**Expected Result**: ❌ Validation error (max length exceeded)

**Test 29.3: Special Characters**
```bash
# Create participant with special characters in name
curl -X POST http://localhost:4000/api/participants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "José",
    "lastName": "O'\''Brien-Smith"
  }'
```

**Expected Result**: ✅ Success (properly handles Unicode and special chars)

---

## Sign-Off Checklist

Before deploying to production, verify all tests pass:

### ✅ Environment & Build
- [ ] Environment validation passes with production config
- [ ] Backend builds without errors (`pnpm build`)
- [ ] Frontend builds without errors (`pnpm build`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] All tests pass (`pnpm test`)

### ✅ Backend API
- [ ] Server starts successfully
- [ ] Health check endpoint responds
- [ ] Database connection works
- [ ] Migrations applied successfully
- [ ] User registration works
- [ ] User login works
- [ ] JWT authentication works
- [ ] Protected routes require auth
- [ ] RBAC authorization enforced
- [ ] Input validation working
- [ ] Rate limiting functional
- [ ] CSRF protection working
- [ ] Program creation workflow works
- [ ] Audit logging captures events

### ✅ Frontend
- [ ] Build completes successfully
- [ ] Preview/production mode works
- [ ] Login flow works
- [ ] Protected routes redirect to login
- [ ] Role-based access control works
- [ ] Program creation wizard works
- [ ] CSV import works
- [ ] Error messages are user-friendly
- [ ] Loading states display correctly
- [ ] Success/error toasts appear

### ✅ Security
- [ ] SQL injection prevented
- [ ] XSS attacks prevented
- [ ] JWT tokens secure (signed, expiring)
- [ ] Passwords hashed in database
- [ ] No secrets in logs
- [ ] HTTPS enforced in production
- [ ] CORS configured correctly
- [ ] CSRF protection enabled

### ✅ Performance
- [ ] Bulk import performs well (1000+ records)
- [ ] No N+1 query issues
- [ ] Database indexes being used
- [ ] Concurrent users handled
- [ ] Response times acceptable
- [ ] Rate limiting prevents abuse

### ✅ Error Handling
- [ ] Database errors handled gracefully
- [ ] Invalid inputs rejected with clear errors
- [ ] Edge cases handled (empty, long, special chars)
- [ ] Network errors show user-friendly messages
- [ ] Permission errors display correctly

### ✅ Documentation
- [ ] README updated
- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Deployment guide complete
- [ ] Troubleshooting guide available

### ✅ Production Readiness
- [ ] Production secrets generated (see `/scripts/generate-secrets.sh`)
- [ ] `.env` configured with production values
- [ ] Database backups configured
- [ ] Monitoring/logging configured
- [ ] Rollback plan documented
- [ ] Support contacts updated

---

## Testing Report Template

Use this template to document your testing results:

```markdown
# Pre-Deployment Testing Report

**Date**: YYYY-MM-DD
**Tester**: [Your Name]
**Version**: [Git commit hash]
**Environment**: [staging/pre-production]

## Summary
- Total Tests: X
- Passed: Y
- Failed: Z
- Skipped: W

## Test Results

### Environment Validation
- [ ] PASS/FAIL - Test 1: Production Environment Variables
  - Notes: [Any issues or observations]

### Build Verification
- [ ] PASS/FAIL - Test 2: Production Build
- [ ] PASS/FAIL - Test 3: Type Checking

[Continue for all tests...]

## Failed Tests
[List any failed tests with details and remediation plan]

## Performance Observations
[Note any performance concerns or improvements needed]

## Security Findings
[Document any security issues found]

## Recommendations
[Any recommendations before deployment]

## Sign-Off
I confirm that all critical tests have passed and the application is ready for production deployment.

**Signature**: _______________
**Date**: _______________
```

---

## Automated Testing Script

Save this script to run automated tests:

```bash
#!/bin/bash
# File: test-deployment.sh

set -e

echo "🧪 Running Pre-Deployment Tests..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

function test_step() {
  echo -e "${YELLOW}▶ $1${NC}"
}

function test_pass() {
  echo -e "${GREEN}✅ $1${NC}"
  ((PASSED++))
}

function test_fail() {
  echo -e "${RED}❌ $1${NC}"
  ((FAILED++))
}

# 1. Environment Validation
test_step "Checking environment variables..."
if [ -f "apps/backend/.env" ]; then
  test_pass "Environment file exists"
else
  test_fail "Environment file missing"
fi

# 2. Build Backend
test_step "Building backend..."
cd apps/backend
if pnpm build > /dev/null 2>&1; then
  test_pass "Backend build successful"
else
  test_fail "Backend build failed"
fi
cd ../..

# 3. Build Frontend
test_step "Building frontend..."
cd apps/frontend
if pnpm build > /dev/null 2>&1; then
  test_pass "Frontend build successful"
else
  test_fail "Frontend build failed"
fi
cd ../..

# 4. Type Check
test_step "Running type check..."
if pnpm type-check > /dev/null 2>&1; then
  test_pass "Type checking passed"
else
  test_fail "Type checking failed"
fi

# 5. Unit Tests
test_step "Running tests..."
if pnpm test > /dev/null 2>&1; then
  test_pass "Tests passed"
else
  test_fail "Tests failed"
fi

# Summary
echo ""
echo "=============================="
echo "Test Summary"
echo "=============================="
echo -e "${GREEN}Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}Failed: $FAILED${NC}"
else
  echo -e "${GREEN}Failed: $FAILED${NC}"
fi

if [ $FAILED -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ All tests passed! Ready for deployment.${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}❌ Some tests failed. Fix issues before deploying.${NC}"
  exit 1
fi
```

Make it executable:
```bash
chmod +x test-deployment.sh
./test-deployment.sh
```

---

## Next Steps

After completing all tests:

1. ✅ Document results in Testing Report
2. ✅ Fix any failed tests
3. ✅ Get sign-off from team lead
4. ✅ Proceed with deployment (see [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md))
5. ✅ Monitor logs after deployment
6. ✅ Run smoke tests in production

---

**Last Updated**: [Date]
**Version**: [Git commit hash]
