# Deployment Guide - Clawdbot Full Stack

## Overview

This guide covers deploying both the Next.js frontend and Node.js backend on Railway, with full synchronization and security.

## Backend Deployment (Railway)

### Prerequisites
- Railway account (railway.app)
- Git repository connected to Railway
- Environment variables configured

### Step 1: Configure Backend Environment

Set these variables in Railway dashboard:

```env
NODE_ENV=production
PORT=3000
OPENCLAW_GATEWAY_TOKEN=your_gateway_token_here
```

### Step 2: Deploy Backend

1. Connect your repository to Railway
2. Select the main project directory
3. Railway auto-detects `package.json` and deploys Node.js app
4. Service starts on `https://your-app.railway.app`
5. Note the public URL (needed for frontend)

### Step 3: Verify Backend Health

```bash
curl https://your-app.railway.app/api/health
# Should return 200 OK
```

## Frontend Deployment (Vercel or Railway)

### Option A: Deploy on Vercel (Recommended)

**Advantages**: Automatic deployments, built-in analytics, instant global CDN

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Frontend ready for deployment"
   git push origin main
   ```

2. **Import on Vercel**
   - Go to vercel.com/new
   - Select this repository
   - Choose `frontend` as the root directory
   - Add environment variable:
     - `NEXT_PUBLIC_API_URL`: `https://your-app.railway.app`
   - Deploy

3. **Verify Deployment**
   ```bash
   curl https://your-vercel-app.vercel.app
   # Should return Next.js app HTML
   ```

### Option B: Deploy on Railway

1. **Create Frontend Service on Railway**
   - Create new project
   - Select "Deploy from GitHub"
   - Choose this repository
   - Set the root directory to `frontend`

2. **Configure Environment**
   - Add `NEXT_PUBLIC_API_URL`: `https://your-backend.railway.app`
   - Add `NODE_ENV`: `production`

3. **Configure Dockerfile** (railway will auto-detect)
   - Uses `frontend/Dockerfile`
   - Installs dependencies
   - Builds Next.js app
   - Starts production server

4. **Domain Setup**
   - Railway auto-generates a domain
   - Or configure custom domain in settings

## Integration Checklist

### Backend Checklist
- [ ] Backend running on Railway
- [ ] API health check passes
- [ ] All auth endpoints implemented
- [ ] CORS configured for frontend URL
- [ ] Database migrations completed
- [ ] Error responses standardized

### Frontend Checklist
- [ ] `NEXT_PUBLIC_API_URL` set correctly
- [ ] Frontend deployed and running
- [ ] Login page loads
- [ ] API calls include Authorization headers
- [ ] 401 errors redirect to login
- [ ] Protected routes work correctly

### Cross-Domain Testing
- [ ] Frontend → Backend login works
- [ ] Tokens persist after page reload
- [ ] Dashboard loads user data correctly
- [ ] Logout clears auth state
- [ ] Protected routes block unauthenticated users

## Monitoring & Debugging

### Backend Logs
```bash
# View Railway logs for backend
# Via Railway dashboard: Project → Service → Logs
```

### Frontend Logs
```bash
# View Vercel/Railway deployment logs
# Also check browser DevTools → Console for [v0] prefixed messages
```

### Test Auth Flow
```bash
# 1. Create account via frontend UI
# 2. Check Network tab for POST /api/auth/signup
# 3. Verify response includes token
# 4. Check localStorage has authToken
# 5. Verify subsequent requests have Authorization header
```

### Common Issues

**Issue**: Frontend can't reach backend
- **Fix**: Check `NEXT_PUBLIC_API_URL` is correct
- **Fix**: Verify backend is running (health check)
- **Fix**: Check CORS headers in backend response

**Issue**: Login fails with 401
- **Fix**: Verify credentials are correct
- **Fix**: Check backend `/api/auth/login` endpoint exists
- **Fix**: Review backend logs for errors

**Issue**: Protected routes redirect to login
- **Fix**: Verify token is in localStorage
- **Fix**: Check token isn't expired
- **Fix**: Verify backend returns user in `/api/auth/me`

## Environment Variables Summary

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app
```

### Backend (.env)
```env
NODE_ENV=production
PORT=3000
OPENCLAW_GATEWAY_TOKEN=your_token
# Add other backend-specific vars
```

## Scaling & Performance

### Frontend Optimization
- Next.js automatically code-splits pages
- Images are optimized with next/image
- CSS is purged for production
- Deploy multiple regions with Vercel

### Backend Optimization
- Implement database connection pooling
- Add Redis caching layer if needed
- Use Railway's auto-scaling features
- Monitor response times

## Security Checklist

- [ ] JWT tokens stored only in localStorage
- [ ] HTTPS enforced on both frontend and backend
- [ ] CORS restricted to known domains
- [ ] Environment variables not committed to git
- [ ] API validates all input
- [ ] Passwords hashed on backend
- [ ] Sensitive data not logged

## Post-Deployment

1. **Monitor Logs**
   - Watch for errors in first 24 hours
   - Review performance metrics

2. **Load Testing**
   - Test with multiple concurrent users
   - Monitor backend resource usage

3. **Error Tracking**
   - Setup error monitoring (Sentry recommended)
   - Track failed API calls

4. **Backup & Recovery**
   - Setup database backups
   - Document recovery procedures

## Rollback Procedures

### Frontend (Vercel)
1. Go to Deployments
2. Select previous stable deployment
3. Click "Promote to Production"

### Frontend (Railway)
1. Go to Deploys
2. Select previous working deploy
3. Redeploy

### Backend (Railway)
1. Go to Deploys
2. Select previous working version
3. Redeploy from previous build

---

## Quick Start Command

```bash
# From project root
cd frontend
npm install
NEXT_PUBLIC_API_URL=https://your-backend.railway.app npm run build
npm start
```

Your application is now ready for production!
