# Deployment Guide

This guide covers deploying the Training Management System to Vercel (frontend) and Railway (backend).

## Prerequisites

- GitHub account with this repository
- Vercel account (free at vercel.com)
- Railway account (free at railway.app)

---

## Backend Deployment (Railway)

### 1. Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `training-management-system` repository
4. Choose the `apps/backend` directory as the root

### 2. Add PostgreSQL Database

1. In your Railway project, click "New" → "Database" → "PostgreSQL"
2. Railway will automatically set the `DATABASE_URL` environment variable

### 3. Add Redis (for sessions)

1. Click "New" → "Database" → "Redis"
2. Railway will set the `REDIS_URL` environment variable

### 4. Configure Environment Variables

In Railway, go to your backend service → "Variables" and add:

```
NODE_ENV=production
JWT_SECRET=<generate-a-secure-random-string>
SESSION_SECRET=<generate-another-secure-random-string>
CORS_ORIGIN=https://your-frontend-domain.vercel.app
PORT=4000
```

### 5. Deploy

Railway will automatically build and deploy when you push to main.

Your backend URL will be something like: `https://your-app.up.railway.app`

---

## Frontend Deployment (Vercel)

### 1. Import Project

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New" → "Project"
3. Import `training-management-system` repository
4. Set the **Root Directory** to `apps/frontend`

### 2. Configure Build Settings

Vercel should auto-detect these, but verify:
- **Framework Preset**: Vite
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

### 3. Configure Environment Variables

Add these environment variables in Vercel:

```
VITE_API_URL=https://your-backend.up.railway.app
VITE_AUTH_PROVIDER=self-hosted
```

### 4. Deploy

Click "Deploy" and Vercel will build and deploy your frontend.

Your frontend URL will be something like: `https://your-app.vercel.app`

---

## Post-Deployment

### Update CORS

After both are deployed, update your Railway backend's `CORS_ORIGIN` to match your Vercel frontend URL.

### Run Database Migrations

In Railway, open the backend service terminal and run:

```bash
pnpm prisma migrate deploy
pnpm prisma db seed
```

### Verify Deployment

1. Visit your Vercel frontend URL
2. Try logging in with seeded credentials
3. Check the health endpoint: `https://your-backend.up.railway.app/health`

---

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Railway
1. Go to Service Settings → Networking → Custom Domain
2. Add your domain and configure DNS

---

## Troubleshooting

### Backend not connecting
- Check `CORS_ORIGIN` matches your frontend URL exactly
- Verify `DATABASE_URL` and `REDIS_URL` are set

### Frontend API errors
- Verify `VITE_API_URL` points to your Railway backend
- Check browser console for CORS errors

### Database issues
- Run `pnpm prisma migrate deploy` in Railway terminal
- Check PostgreSQL logs in Railway dashboard
