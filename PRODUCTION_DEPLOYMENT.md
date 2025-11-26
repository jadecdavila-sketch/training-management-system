# 🚀 Production Deployment Checklist

This document provides a comprehensive checklist for deploying the Training Management System to production.

## Table of Contents
1. [Pre-Deployment Setup](#pre-deployment-setup)
2. [Security Configuration](#security-configuration)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Post-Deployment](#post-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Setup

### ✅ System Requirements
- [ ] Node.js 18+ installed on server
- [ ] pnpm 8+ installed
- [ ] PostgreSQL 14+ database available
- [ ] Redis instance available (if using SSO)
- [ ] SSL/TLS certificate for HTTPS
- [ ] Domain name configured

### ✅ Code Preparation
- [ ] All tests passing locally
- [ ] Code reviewed and approved
- [ ] Git repository up to date
- [ ] Build tested locally: `pnpm build`
- [ ] Type checking passes: `pnpm type-check`

---

## Security Configuration

### ✅ Generate Production Secrets

Run the secrets generator:
```bash
./scripts/generate-secrets.sh
```

Copy the output and store it securely (use a password manager or secret management service).

### ✅ Security Checklist
- [ ] JWT_SECRET: Generated with `openssl rand -base64 48` (at least 32 chars)
- [ ] SESSION_SECRET: Generated with `openssl rand -base64 48` (at least 32 chars)
- [ ] CSRF_SECRET: Generated with `openssl rand -base64 48` (at least 32 chars)
- [ ] All secrets are unique (different from each other)
- [ ] Secrets stored in deployment platform's secret manager
- [ ] Secrets NOT committed to git
- [ ] `.env` file added to `.gitignore`

### ✅ Environment Security
- [ ] `NODE_ENV=production` set
- [ ] `BYPASS_AUTH=false` (or removed entirely)
- [ ] `LOG_LEVEL=warn` or `error` (not debug)
- [ ] Database uses SSL/TLS connection
- [ ] CORS configured for production domains only

---

## Database Setup

### ✅ Production Database

1. **Create Production Database**
   ```sql
   CREATE DATABASE tms_production;
   CREATE USER tms_user WITH ENCRYPTED PASSWORD 'strong-password-here';
   GRANT ALL PRIVILEGES ON DATABASE tms_production TO tms_user;
   ```

2. **Configure Connection String**
   ```bash
   DATABASE_URL="postgresql://tms_user:password@db-host:5432/tms_production?ssl=true&sslmode=require"
   ```

3. **Run Migrations**
   ```bash
   cd apps/backend
   pnpm prisma migrate deploy
   ```

4. **Verify Migration**
   ```bash
   pnpm prisma db seed  # Optional: Add seed data
   ```

### ✅ Database Checklist
- [ ] Production database created
- [ ] Database user created with appropriate permissions
- [ ] SSL/TLS enabled for database connections
- [ ] Migrations applied successfully
- [ ] Database backups configured (see scripts/backup-db.sh)
- [ ] Connection pooling configured (if using external service)

---

## Environment Configuration

### ✅ Backend Environment Variables

Create production `.env` file in `apps/backend/`:

```bash
# Required
NODE_ENV=production
PORT=4000
DATABASE_URL=<your-production-db-url>
JWT_SECRET=<generated-secret>
SESSION_SECRET=<generated-secret>
CSRF_SECRET=<generated-secret>
ALLOWED_ORIGINS=https://your-domain.com

# Optional (SSO)
REDIS_URL=<your-redis-url>
SAML_ENABLED=false
# ... SSO config if needed
```

### ✅ Frontend Environment Variables

Create production `.env` file in `apps/frontend/`:

```bash
VITE_API_URL=https://api.your-domain.com
```

### ✅ Environment Checklist
- [ ] All required environment variables set
- [ ] API_URL points to production API
- [ ] FRONTEND_URL points to production frontend
- [ ] ALLOWED_ORIGINS includes only production domains
- [ ] Database URL uses production database
- [ ] Redis URL configured (if using SSO)
- [ ] Logging configured appropriately

---

## Testing

### ✅ Pre-Deployment Testing

Test locally with production build:

```bash
# Backend
cd apps/backend
pnpm build
NODE_ENV=production node dist/index.js

# Frontend
cd apps/frontend
pnpm build
pnpm preview
```

### ✅ Test Checklist
- [ ] Build completes without errors
- [ ] Server starts successfully
- [ ] Health check endpoint responds: `curl http://localhost:4000/health`
- [ ] Database connection works
- [ ] Authentication works (register + login)
- [ ] RBAC permissions enforced
- [ ] CSRF protection works
- [ ] Rate limiting functions correctly
- [ ] Audit logging captures events
- [ ] Frontend connects to backend
- [ ] All critical user flows tested:
  - [ ] User registration/login
  - [ ] Create program with cohorts
  - [ ] Import participants (CSV)
  - [ ] Assign facilitators/locations
  - [ ] Generate schedules
  - [ ] View audit logs

---

## Deployment

### ✅ Deployment Methods

Choose your deployment platform:

#### Option A: Render.com (Recommended for beginners)
```bash
# Already configured in render.yaml
# Just connect your GitHub repo and deploy
```

#### Option B: Docker
```bash
# Build and push
docker build -t tms-backend ./apps/backend
docker build -t tms-frontend ./apps/frontend

# Run
docker-compose up -d
```

#### Option C: Traditional Server
```bash
# Install dependencies
pnpm install --frozen-lockfile

# Build
pnpm build

# Start with PM2
pm2 start apps/backend/dist/index.js --name tms-backend
pm2 serve apps/frontend/dist 3000 --name tms-frontend
pm2 save
```

### ✅ Deployment Checklist
- [ ] Application deployed to production environment
- [ ] HTTPS/SSL configured and working
- [ ] Domain name pointed to server
- [ ] Health check endpoint accessible
- [ ] Static assets served correctly
- [ ] Backend API accessible from frontend
- [ ] Database migrations run successfully
- [ ] Logs visible and accessible

---

## Post-Deployment

### ✅ Verification Steps

1. **Health Check**
   ```bash
   curl https://api.your-domain.com/health
   # Should return: {"status":"healthy"}
   ```

2. **Authentication Test**
   ```bash
   # Register first admin user
   curl -X POST https://api.your-domain.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"SecurePassword123!","name":"Admin User","role":"ADMIN"}'
   ```

3. **Login Test**
   ```bash
   curl -X POST https://api.your-domain.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"SecurePassword123!"}'
   ```

4. **Frontend Test**
   - Open https://your-domain.com
   - Login with admin credentials
   - Navigate through main pages
   - Create a test program
   - Verify all features work

### ✅ Post-Deployment Checklist
- [ ] Health check passes
- [ ] First admin user created
- [ ] Login works from frontend
- [ ] All pages load correctly
- [ ] API requests succeed
- [ ] Database queries work
- [ ] Audit logs are being created
- [ ] Error logging functional
- [ ] Performance acceptable (page load < 3s)

---

## Monitoring & Maintenance

### ✅ Set Up Monitoring

#### Application Monitoring
- [ ] Error tracking configured (recommended: Sentry)
  ```bash
  # Add to backend
  npm install @sentry/node
  ```

- [ ] Application performance monitoring (APM)
  - [ ] Request/response times tracked
  - [ ] Database query performance monitored
  - [ ] Error rates tracked

#### Infrastructure Monitoring
- [ ] Server health monitoring
- [ ] Database monitoring
- [ ] Disk space alerts
- [ ] Memory usage alerts
- [ ] CPU usage alerts

#### Logs
- [ ] Application logs centralized
- [ ] Log retention policy set
- [ ] Log rotation configured
- [ ] Searchable log platform (e.g., ELK, CloudWatch)

### ✅ Backup Strategy
- [ ] Database backups automated (daily)
  ```bash
  # Use provided script
  ./apps/backend/scripts/backup-db.sh
  ```
- [ ] Backup retention: 30 days
- [ ] Backup restoration tested
- [ ] Backup monitoring/alerts

### ✅ Maintenance Tasks

**Daily:**
- [ ] Check error logs
- [ ] Monitor system health

**Weekly:**
- [ ] Review application metrics
- [ ] Check database performance
- [ ] Review security logs
- [ ] Check backup success

**Monthly:**
- [ ] Update dependencies
- [ ] Review and rotate logs
- [ ] Test backup restoration
- [ ] Security audit

---

## Rollback Plan

### If Something Goes Wrong

1. **Immediate Rollback**
   ```bash
   # Revert to previous deployment
   git revert <commit-hash>
   # Redeploy previous version
   ```

2. **Database Rollback**
   ```bash
   # Restore from backup
   ./apps/backend/scripts/restore-db.sh backup-YYYYMMDD-HHMMSS.sql
   ```

3. **Communication**
   - Notify users of downtime (if applicable)
   - Document what went wrong
   - Plan fix for next deployment

---

## Production URLs

Document your production URLs here:

- **Frontend:** https://your-domain.com
- **Backend API:** https://api.your-domain.com
- **Health Check:** https://api.your-domain.com/health
- **Admin Panel:** https://your-domain.com/admin

---

## Support Contacts

- **DevOps:** [email/slack]
- **Database Admin:** [email/slack]
- **On-Call:** [phone/pager]
- **Incident Response:** [process/link]

---

## Troubleshooting

### Common Issues

#### 1. Server Won't Start
```bash
# Check logs
pm2 logs tms-backend
# Or
docker logs tms-backend

# Common causes:
# - DATABASE_URL not set
# - JWT_SECRET too short
# - Port already in use
```

#### 2. Database Connection Failed
```bash
# Test connection
psql "$DATABASE_URL"

# Check:
# - Database running
# - Credentials correct
# - SSL settings
# - Network connectivity
```

#### 3. CORS Errors
```bash
# Check ALLOWED_ORIGINS environment variable
# Must include your frontend domain
```

#### 4. Authentication Not Working
```bash
# Verify:
# - JWT_SECRET is set
# - JWT_SECRET is at least 32 characters
# - Cookie settings if using SSO
```

---

## Success Criteria

Your deployment is successful when:

✅ All checklist items above are complete
✅ Health check returns 200 OK
✅ Users can register and login
✅ Programs can be created
✅ Participants can be imported
✅ All RBAC roles function correctly
✅ No errors in logs
✅ Performance meets requirements
✅ Monitoring and alerts configured
✅ Backup strategy implemented

---

## Next Steps After Deployment

1. **User Onboarding**
   - Create user accounts
   - Assign roles
   - Import participant data
   - Set up locations and facilitators

2. **Training**
   - Train administrators
   - Create user documentation
   - Set up support process

3. **Optimization**
   - Monitor performance
   - Optimize slow queries
   - Tune caching if needed
   - Scale as needed

---

## Questions or Issues?

- Check the troubleshooting section above
- Review application logs
- Contact the development team
- Create an issue in the repository

**Last Updated:** [Date]
**Deployed By:** [Name]
**Version:** [Git commit hash]
