# SSO Setup Guide
Training Management System - Single Sign-On Configuration

## Overview

The TMS now supports **enterprise SSO via SAML 2.0**, compatible with:
- Azure Active Directory (Microsoft Entra ID)
- Okta
- Ping Identity
- OneLogin
- Any SAML 2.0 compliant identity provider

### Architecture

```
User → Frontend → Backend (Passport SAML) → IdP (Azure AD/Okta) → Backend → JWT Cookie → Frontend
```

- **Session Store**: Redis (for Passport sessions)
- **Auth Tokens**: JWT (8-hour expiry) stored in HTTP-only cookies
- **Fallback**: Local JWT authentication still works for development

---

## Environment Variables

### Backend (.env)

```bash
# Server Configuration
PORT=4000
NODE_ENV=development # or production
API_URL=http://localhost:4000 # or https://your-api-domain.com
FRONTEND_URL=http://localhost:5173 # or https://your-frontend-domain.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tms_dev

# JWT Tokens
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
SESSION_SECRET=your-super-secret-session-key-min-32-chars

# Redis (for sessions)
REDIS_URL=redis://localhost:6379

# SAML SSO Configuration
SAML_ENABLED=true # Set to 'true' to enable SSO
SAML_ENTRY_POINT=https://login.microsoftonline.com/{tenant-id}/saml2 # IdP SSO URL
SAML_ISSUER=urn:tms:app # Your application identifier
SAML_CERT="-----BEGIN CERTIFICATE-----
MIIDdTCCAl2gAwIBAgILBAAAAAABFUtaw5QwDQYJKoZIhvcNAQEFBQAwVzELMAkGA1UEBhMCQkUx
... (full certificate here)
-----END CERTIFICATE-----"

# Optional: If IdP requires signed requests
# SAML_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend-domain.com
```

### Frontend (.env)

```bash
# API Configuration
VITE_API_URL=http://localhost:4000 # or https://your-api-domain.com

# Auth Provider ('self-hosted' or 'auth0')
VITE_AUTH_PROVIDER=self-hosted

# SAML Configuration
VITE_SAML_ENABLED=true # Match backend setting
```

---

## Step-by-Step Setup

### 1. Install Redis Locally (Development)

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Windows (via WSL or Docker):**
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

### 2. Configure Your Identity Provider

#### Azure AD (Microsoft Entra ID)

1. **Go to Azure Portal** → Azure Active Directory → Enterprise Applications
2. **Create new application** → "Non-gallery application"
3. **Set up Single Sign-On** → Choose **SAML**
4. **Basic SAML Configuration:**
   - **Identifier (Entity ID)**: `urn:tms:app`
   - **Reply URL (ACS URL)**: `http://localhost:4000/auth/saml/callback` (or your production URL)
5. **User Attributes & Claims:**
   - Ensure `emailaddress`, `givenname`, `surname`, and `groups` are included
6. **Download Certificate (Base64)** → Copy contents to `SAML_CERT` environment variable
7. **Copy Login URL** → This is your `SAML_ENTRY_POINT`

#### Okta

1. **Go to Okta Admin Console** → Applications → Create App Integration
2. **Choose SAML 2.0**
3. **General Settings:**
   - App name: "Training Management System"
4. **Configure SAML:**
   - **Single sign on URL**: `http://localhost:4000/auth/saml/callback`
   - **Audience URI (SP Entity ID)**: `urn:tms:app`
   - **Name ID format**: EmailAddress
   - **Application username**: Email
5. **Attribute Statements** (optional):
   - `firstName` → `user.firstName`
   - `lastName` → `user.lastName`
   - `email` → `user.email`
6. **Group Attribute Statements**:
   - `groups` → Matches regex `.*` (or specific groups: `TMS-Admin`, `TMS-HR`, etc.)
7. **Finish** → View Setup Instructions → Copy **Identity Provider metadata** → Extract:
   - **SSO URL** → `SAML_ENTRY_POINT`
   - **X.509 Certificate** → `SAML_CERT`

### 3. Run Database Migration

```bash
cd apps/backend
pnpm db:push # Apply Prisma schema changes
```

This adds SSO fields to the User model:
- `ssoProvider`
- `ssoId`
- `lastLoginAt`

### 4. Start the Application

**Terminal 1 (Backend):**
```bash
cd apps/backend
pnpm dev
```

**Terminal 2 (Frontend):**
```bash
cd apps/frontend
pnpm dev
```

**Terminal 3 (Redis - if not running as service):**
```bash
redis-server
```

### 5. Test SSO Login

1. Open browser: `http://localhost:5173/login`
2. Click **"Sign in with SSO"**
3. You'll be redirected to your IdP (Azure AD/Okta)
4. Log in with your IdP credentials
5. You'll be redirected back to TMS with authentication

---

## Role Mapping

The system maps IdP groups to TMS roles:

| IdP Group Pattern | TMS Role |
|-------------------|----------|
| `*admin*` or `TMS-Admin` | `ADMIN` |
| `*coordinator*` or `TMS-Coordinator` | `COORDINATOR` |
| `*hr*` or `TMS-HR` | `HR` |
| Default (no match) | `FACILITATOR` |

**Customize** role mapping in [backend/src/config/passport.ts:24](apps/backend/src/config/passport.ts#L24):

```typescript
function mapRoleFromGroups(groups: string[] = []): UserRole {
  if (groups.includes('YourCompany-TMS-Admins')) return 'ADMIN';
  // ... your custom logic
}
```

---

## Troubleshooting

### "SAML SSO is not enabled"

**Problem:** Frontend shows this error when clicking SSO login.

**Solution:**
- Set `SAML_ENABLED=true` in backend `.env`
- Set `VITE_SAML_ENABLED=true` in frontend `.env`
- Restart both servers

### "Email not provided by IdP"

**Problem:** SAML callback fails with this error.

**Solution:**
- Check IdP configuration includes `emailaddress` claim
- Azure AD: Ensure "User Attributes & Claims" includes email
- Okta: Set "Application username" to "Email"

### "Invalid SAML response signature"

**Problem:** SAML authentication fails due to signature verification.

**Solution:**
- Verify `SAML_CERT` matches IdP's certificate exactly
- Ensure certificate includes `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----`
- No extra spaces or line breaks in the middle of the certificate string

### Redis Connection Error

**Problem:** `Redis connection error: ECONNREFUSED`

**Solution:**
```bash
# Check if Redis is running
redis-cli ping
# Should return "PONG"

# If not running, start Redis:
brew services start redis  # macOS
sudo systemctl start redis  # Linux
```

### User Not Created After SSO Login

**Problem:** Login succeeds but user doesn't appear in database.

**Solution:**
- Check backend logs for errors
- Verify database connection: `pnpm prisma studio`
- Ensure `JWT_SECRET` is set (users can't be created without it)

---

## Production Deployment

### Environment Checklist

Backend:
- [ ] `NODE_ENV=production`
- [ ] `API_URL` set to production domain (e.g., `https://api.tms.company.com`)
- [ ] `FRONTEND_URL` set to production domain (e.g., `https://tms.company.com`)
- [ ] `SAML_ENTRY_POINT` uses production IdP configuration
- [ ] `SAML_CERT` from production IdP app registration
- [ ] `REDIS_URL` points to production Redis (e.g., Render, Upstash, AWS ElastiCache)
- [ ] `JWT_SECRET` and `SESSION_SECRET` are strong random strings (32+ characters)
- [ ] `ALLOWED_ORIGINS` includes only production frontend URL

Frontend:
- [ ] `VITE_API_URL` set to production API
- [ ] `VITE_SAML_ENABLED=true`
- [ ] Build optimized: `pnpm build`

IdP Configuration:
- [ ] ACS URL updated to production: `https://api.tms.company.com/auth/saml/callback`
- [ ] Logout URL updated (if applicable)
- [ ] Test with real users before rollout

### Redis Hosting Options

**Free Tier:**
- Render Redis: 25MB free
- Upstash: 10,000 commands/day free

**Production:**
- Render Redis: $15/month (256MB)
- AWS ElastiCache: ~$15/month (cache.t2.micro)
- Upstash: Pay-per-use

---

## Switching to Auth0 (Future)

If you decide to use Auth0 instead of self-hosted SSO:

### Steps:

1. **Install Auth0 SDK:**
   ```bash
   cd apps/frontend
   pnpm add @auth0/auth0-react
   ```

2. **Implement Auth0Provider:**
   - Edit [apps/frontend/src/lib/auth/Auth0Provider.ts](apps/frontend/src/lib/auth/Auth0Provider.ts)
   - Follow the commented example code

3. **Update Environment Variables:**
   ```bash
   # Frontend .env
   VITE_AUTH_PROVIDER=auth0
   VITE_AUTH0_DOMAIN=your-tenant.auth0.com
   VITE_AUTH0_CLIENT_ID=your-client-id
   VITE_AUTH0_AUDIENCE=https://api.tms.company.com
   ```

4. **Migrate Users:**
   - Export from PostgreSQL: `pnpm prisma db export`
   - Import to Auth0 via Management API

5. **Test & Deploy:**
   - No code changes needed in app components (thanks to abstraction)!
   - Just switch environment variable and redeploy

**Cost:** ~$30k-60k/year for 100k users

---

## Security Notes

1. **HTTP-only Cookies:** JWT tokens are stored in HTTP-only cookies (not accessible via JavaScript) to prevent XSS attacks.

2. **CSRF Protection:** `sameSite: 'lax'` cookie attribute prevents CSRF. Consider adding CSRF tokens for state-changing requests.

3. **Token Expiry:** Access tokens expire after 8 hours. Users must re-authenticate.

4. **Session Storage:** Sessions stored in Redis for distributed deployments.

5. **Password Fallback:** Original `/api/auth/login` endpoint still works for local development or fallback admin accounts.

---

## API Endpoints

### SSO Endpoints

```
GET  /auth/saml/login       - Initiate SAML login (redirects to IdP)
POST /auth/saml/callback    - SAML callback from IdP
GET  /auth/saml/metadata    - SAML metadata XML for IdP configuration
POST /auth/saml/logout      - Logout and clear session
```

### JWT Auth Endpoints (Fallback)

```
POST /api/auth/register     - Register new user (password-based)
POST /api/auth/login        - Login with email/password
POST /api/auth/refresh      - Refresh access token
GET  /api/auth/me           - Get current user
POST /api/auth/logout       - Logout (JWT-based)
```

---

## Support

For issues or questions:
- Check logs: Backend console will show detailed SAML errors
- Enable debug mode: `DEBUG=passport:saml node src/index.js`
- Review [Passport-SAML docs](https://github.com/node-saml/passport-saml)

---

**Last Updated:** October 9, 2025
**TMS Version:** 1.0.0 (Pre-Release)
