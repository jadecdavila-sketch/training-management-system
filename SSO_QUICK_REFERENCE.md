# SSO Quick Reference Card

## 🚀 Start Development

```bash
# 1. Install Redis
brew install redis && brew services start redis

# 2. Setup environment
cd apps/backend && cp .env.example .env
cd ../frontend && cp .env.example .env

# 3. Apply database changes
cd apps/backend && pnpm db:push

# 4. Start services
# Terminal 1:
cd apps/backend && pnpm dev

# Terminal 2:
cd apps/frontend && pnpm dev
```

## 🔑 Key Environment Variables

**Backend (.env):**
```bash
SAML_ENABLED=true
SAML_ENTRY_POINT=https://login.microsoftonline.com/{tenant}/saml2
SAML_ISSUER=urn:tms:app
SAML_CERT="-----BEGIN CERTIFICATE-----..."
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-32-char-secret
SESSION_SECRET=your-32-char-secret
```

**Frontend (.env):**
```bash
VITE_AUTH_PROVIDER=self-hosted
VITE_SAML_ENABLED=true
VITE_API_URL=http://localhost:4000
```

## 📍 Key Endpoints

```
GET  /auth/saml/login       → Initiate SSO
POST /auth/saml/callback    → IdP redirects here
GET  /auth/saml/metadata    → Metadata for IdP config
POST /auth/saml/logout      → Logout

GET  /api/auth/me           → Get current user
POST /api/auth/login        → Fallback JWT login
```

## 🏗️ File Locations

**Backend:**
- `src/config/passport.ts` → SAML config & role mapping
- `src/config/session.ts` → Redis session store
- `src/routes/saml-auth.ts` → SSO routes
- `src/middleware/auth.ts` → Auth middleware (cookie + bearer)

**Frontend:**
- `src/lib/auth/types.ts` → AuthProvider interface
- `src/lib/auth/SelfHostedAuthProvider.ts` → SSO implementation
- `src/contexts/AuthContext.tsx` → React auth context
- `src/components/common/ProtectedRoute.tsx` → Route guards

## 🔄 Switching to Auth0

```bash
# 1. Install SDK
pnpm add @auth0/auth0-react

# 2. Implement Auth0Provider.ts (see comments in file)

# 3. Update .env
VITE_AUTH_PROVIDER=auth0
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id

# 4. Deploy (no code changes!)
```

## 🧪 Testing

**Check Redis:**
```bash
redis-cli ping  # Should return "PONG"
```

**Test SSO:**
```bash
# 1. Visit: http://localhost:5173/login
# 2. Click "Sign in with SSO"
# 3. Login at IdP
# 4. Should redirect back to /admin/programs
```

**Test Fallback Auth:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tms.com","password":"admin123"}'
```

## 🐛 Common Issues

| Error | Fix |
|-------|-----|
| "SAML not enabled" | Set `SAML_ENABLED=true` in `.env` |
| Redis connection error | `brew services start redis` |
| "Email not provided" | Check IdP sends email claim |
| Invalid SAML signature | Verify `SAML_CERT` matches IdP |

## 📚 Documentation

- **Full Setup Guide:** [SSO_SETUP.md](SSO_SETUP.md)
- **Implementation Summary:** [SSO_IMPLEMENTATION_SUMMARY.md](SSO_IMPLEMENTATION_SUMMARY.md)
- **PRD Security Section:** [PRD.md#security-architecture](PRD.md#security-architecture)

## 🎯 Role Mapping

Customize in `src/config/passport.ts:24`:

```typescript
function mapRoleFromGroups(groups: string[]) {
  if (groups.includes('TMS-Admin')) return 'ADMIN';
  if (groups.includes('TMS-HR')) return 'HR';
  // ... your logic
}
```

## 🔐 Protected Routes

```tsx
<ProtectedRoute allowedRoles={['ADMIN', 'COORDINATOR']}>
  <ProgramsPage />
</ProtectedRoute>
```

## 📊 Database Schema

New User fields:
- `ssoProvider` (string?) - 'saml', 'oidc', null
- `ssoId` (string?) - IdP user ID
- `lastLoginAt` (DateTime?)

---

**Need help?** See full docs: [SSO_SETUP.md](SSO_SETUP.md)
