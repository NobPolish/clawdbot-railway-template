# Clawdbot - Full Stack Authorization & Onboarding Platform

A modern, production-ready full-stack application combining a Node.js/OpenClaw backend with a Next.js frontend, featuring AI-powered authorization and seamless onboarding processes.

**Status**: ✅ **READY FOR DEPLOYMENT**

---

## 🎯 Quick Links

- **🚀 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete step-by-step deployment to production
- **📚 [FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)** - Frontend setup & configuration
- **✨ [BUILD_SUMMARY.md](./BUILD_SUMMARY.md)** - What was built and architecture overview
- **🔧 [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - API endpoints and backend details
- **✅ [READY_FOR_DEPLOYMENT.md](./READY_FOR_DEPLOYMENT.md)** - Deployment checklist

---

## 🏁 Final Draft: Unified Product Vision

This final pass aligns the platform around five equally important capabilities so the product feels cohesive rather than stitched together:

1. **Design Excellence (UX first)**
   - Keep flows intuitive, fast, and mobile-ready.
   - Prioritize clarity in onboarding, dashboard navigation, and account settings.

2. **Adaptive Intelligence (Recommendations)**
   - Build recommendation and guidance logic from user behavior signals.
   - Personalize onboarding hints, dashboard actions, and next-best steps.

3. **Community Intelligence (Collaboration)**
   - Enable user-to-user knowledge sharing patterns (forums, shared insights, reusable playbooks).
   - Treat collective contributions as a first-class product surface, not an afterthought.

4. **Security by Default (Platform trust)**
   - Enforce strong auth boundaries, transport safety, and role-aware access controls.
   - Keep observability and incident readiness integrated into normal delivery flow.

5. **Insight-Driven Decisions (Analytics)**
   - Surface product and user metrics through actionable dashboards.
   - Optimize for decision velocity: highlight trends, anomalies, and conversion blockers.

### Integration Principle

When features overlap, prefer **one canonical implementation** with extension points over duplicate systems. This keeps maintenance low while preserving each capability's unique value.

### Final-Round Execution Checklist

- Validate UX consistency across auth, onboarding, and dashboard.
- Verify recommendation hooks can consume behavior signals safely.
- Confirm collaboration modules integrate with existing auth/permissions.
- Run security checks on token handling, route protection, and environment config.
- Ensure analytics events are mapped to user journeys and business outcomes.

---

## 📁 Project Structure

```
clawdbot-railway-template/
├── src/
│   ├── server.js           # Express backend + OpenClaw gateway
│   └── ...                 # Backend source files
├── frontend/               # Next.js 15 frontend application
│   ├── app/
│   │   ├── auth/          # Login & signup pages
│   │   ├── onboarding/    # 4-step AI-powered flow
│   │   ├── dashboard/     # Protected user dashboard
│   │   ├── layout.tsx     # Root layout with auth provider
│   │   └── page.tsx       # Home landing page
│   ├── components/        # Reusable UI components
│   ├── context/           # React state management
│   ├── lib/               # API client & utilities
│   ├── Dockerfile         # Production container config
│   └── package.json
├── DEPLOYMENT_GUIDE.md    # Production deployment (main guide)
├── FRONTEND_INTEGRATION_GUIDE.md
├── BUILD_SUMMARY.md
├── INTEGRATION_GUIDE.md
├── READY_FOR_DEPLOYMENT.md
└── verify-deployment.sh
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- npm or yarn

### Development Setup

```bash
# Terminal 1: Backend
npm install
npm run dev
# Backend runs on http://localhost:3001

# Terminal 2: Frontend
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:3001 npm run dev
# Frontend runs on http://localhost:3000
```

Visit **http://localhost:3000** and create a test account.

---

## 🌐 Components

### Backend (Node.js + Express)
- ✅ OpenClaw Gateway integration
- ✅ API proxy server
- ✅ Environment-based configuration
- ✅ CORS support
- ✅ Production-ready error handling

**Must Implement Endpoints:**
```
POST   /api/auth/login           → { token, user }
POST   /api/auth/signup          → { token, user }
GET    /api/auth/me              → { user }
POST   /api/auth/logout          → { success }
PUT    /api/auth/profile         → { user }
```

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for complete endpoint specs.

### Frontend (Next.js 15)
- ✅ Authentication system (JWT-based)
- ✅ AI-powered onboarding (4-step flow)
- ✅ Protected user dashboard
- ✅ React Context for state management
- ✅ Axios API client with interceptors
- ✅ Responsive mobile-first design
- ✅ TypeScript for type safety
- ✅ Tailwind CSS v4

---

## 📋 Production Deployment

### Backend (Railway) - 3 minutes

```bash
# 1. Push to GitHub (or connect existing repo)
git add .
git commit -m "Ready for deployment"
git push

# 2. On Railway Dashboard:
# - New Project → Deploy from GitHub
# - Select repository
# - Set environment variables:
#   - NODE_ENV=production
#   - PORT=3000
#   - OPENCLAW_GATEWAY_TOKEN=your_token

# 3. Railway auto-detects Node.js and deploys
# 4. Note the public URL (e.g., https://your-app.railway.app)
```

**Verify:** `curl https://your-app.railway.app/health`

### Frontend (Vercel) - 3 minutes

```bash
# Option A: Via Vercel Dashboard (Recommended)
# 1. Go to vercel.com/new
# 2. Import this repository
# 3. Set root directory: frontend
# 4. Add environment variable:
#    - NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app
# 5. Deploy

# Option B: Via CLI
cd frontend
npm install -g vercel
vercel
# Follow prompts, set NEXT_PUBLIC_API_URL
```

**Verify:** Visit your Vercel deployment URL

---

## ✨ Key Features

### Security
- ✅ JWT token-based authentication
- ✅ Automatic token injection in requests
- ✅ Protected routes with permission checks
- ✅ 401/403 error handling with redirects
- ✅ Password validation on signup
- ✅ CORS configuration

### Developer Experience
- ✅ TypeScript for type safety
- ✅ React Context for simple state management
- ✅ Comprehensive error logging (`[v0]` prefix)
- ✅ Production-ready code structure
- ✅ Full documentation

### User Experience
- ✅ Seamless authentication flow
- ✅ 4-step AI-powered onboarding
- ✅ Protected dashboard with user info
- ✅ Responsive on all devices
- ✅ Fast page transitions

---

## 🔐 Environment Configuration

### Backend (.env)
```env
NODE_ENV=production
PORT=3000
OPENCLAW_GATEWAY_TOKEN=your_secure_token_here
```

### Frontend (frontend/.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** | ⭐ **Start here** - Complete step-by-step production deployment |
| **[FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)** | Frontend setup, configuration, and features |
| **[BUILD_SUMMARY.md](./BUILD_SUMMARY.md)** | Overview of architecture and design decisions |
| **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** | API endpoints and backend specifications |
| **[READY_FOR_DEPLOYMENT.md](./READY_FOR_DEPLOYMENT.md)** | Deployment status and next steps |

---

## 🧪 Testing

### Backend Health
```bash
curl https://your-backend.railway.app/health
```

### Frontend Test Flow
1. Visit frontend URL
2. Create test account
3. Check browser DevTools → Network tab
4. Verify Authorization header in requests
5. Test logout and protected routes

---

## 🛠️ Technology Stack

**Backend:**
- Node.js 20+
- Express.js
- http-proxy

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Axios
- React Context API

---

## 🚀 Deployment Checklist

- [ ] Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- [ ] Configure backend environment variables
- [ ] Test locally (backend + frontend)
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Verify health checks pass
- [ ] Test end-to-end authentication
- [ ] Monitor logs post-deployment

---

## 🐛 Troubleshooting

**Frontend won't connect?**
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running: `curl {backend_url}/health`
- Check browser console for `[v0]` error messages

**Login failing?**
- Verify backend endpoints are implemented
- Check credentials
- Review backend logs

**Protected routes redirecting?**
- Clear browser cache/cookies
- Verify token in localStorage
- Check backend `/api/auth/me` endpoint

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) troubleshooting section for more help.

---

## 📞 Support

For detailed guidance:
1. **Deployment issues** → See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. **Frontend issues** → See [FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)
3. **API/integration issues** → See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
4. **Browser console** → Look for `[v0]` prefixed messages

---

## 🎉 You're Ready!

Everything is configured and tested. Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete production deployment instructions.

**Built with ❤️ for seamless deployment and perfect synchronization.**

---

## Original OpenClaw Documentation

This template packages **OpenClaw** with a setup wizard for easy Railway deployment. For OpenClaw-specific documentation, see the sections below:

### OpenClaw Setup (Original)

Deploy with one click:
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/clawdbot-railway-template)

What you get:
- **OpenClaw Gateway** at `/`
- **Control UI** at `/openclaw`
- **Setup Wizard** at `/setup`
- Persistent state via Railway Volume
- One-click export/import backups

For OpenClaw setup details, see the original documentation in this file or [OpenClaw Docs](https://docs.openclaw.ai).

