# Frontend & Backend Integration Guide

## Overview

This guide explains how to connect the modern Next.js frontend with the existing Railway-hosted Node.js backend for Clawdbot.

## Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│   Next.js Frontend  │◄────────┤  Railway Backend     │
│   (Vercel/Local)    │  REST   │  (Docker Container)  │
└─────────────────────┘         └──────────────────────┘
   - Auth Pages                     - Auth APIs
   - Onboarding Flow                - User Management
   - Dashboard UI                   - Authorization Logic
   - AI Integration                 - Database Access
```

## 1. Environment Configuration

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app
NEXT_PUBLIC_APP_NAME=Clawdbot
```

### Backend (Railway Dashboard)

Ensure these environment variables are set:
- `NODE_ENV=production`
- `PORT=3000` (or configured port)
- Database connection strings
- JWT secret key

## 2. API Endpoint Mapping

### Auth Endpoints

**Frontend Call:**
```typescript
// app/auth/login/page.tsx
const response = await apiClient.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});
```

**Backend Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### User Profile Endpoints

```typescript
// Get profile
const profile = await apiClient.get('/api/user/profile');

// Update profile
await apiClient.put('/api/user/update', {
  name: 'Jane Doe',
  company: 'Acme Corp'
});
```

### AI-Powered Features

```typescript
// AI verification
const verification = await apiClient.post('/api/ai/verify', {
  userId: 'user_123',
  verificationMethod: 'email'
});

// AI chat/queries
const aiResponse = await apiClient.post('/api/ai/chat', {
  message: 'Help me set up 2FA'
});
```

## 3. Token Management

### Storage Strategy

Tokens are stored in browser localStorage with automatic request injection:

```typescript
// Stored in localStorage
localStorage.setItem('authToken', token);

// Automatically added to requests via axios interceptor
// Authorization: Bearer {token}
```

### Token Refresh Flow

```typescript
// In lib/api.ts interceptor
if (response.status === 401) {
  // Call refresh endpoint
  const newToken = await refreshToken();
  // Retry original request with new token
}
```

## 4. CORS Configuration

### Backend CORS Setup

In your Railway backend (server.js):

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',           // Local dev
    'https://your-frontend-url.vercel.app'  // Production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 5. Authentication Flow

### Login Flow

```
1. User enters credentials → Signup/Login Page
2. Frontend sends POST /api/auth/login
3. Backend validates & creates token
4. Frontend stores token in localStorage
5. Token added to all subsequent requests
6. Redirect to /onboarding or /dashboard
```

### Onboarding Flow

```
1. After signup → /onboarding/welcome
2. Complete profile → /onboarding/profile
3. AI verification → /onboarding/verification
4. Onboarding complete → /onboarding/complete
5. Redirect to dashboard
```

### Protected Routes

```typescript
// Implement route protection middleware
'use client';

export function withAuth(Component: any) {
  return function ProtectedRoute(props: any) {
    const [isAuth, setIsAuth] = useState(false);
    
    useEffect(() => {
      const token = localStorage.getItem('authToken');
      setIsAuth(!!token);
    }, []);
    
    if (!isAuth) {
      return <Redirect to="/auth/login" />;
    }
    
    return <Component {...props} />;
  };
}
```

## 6. Error Handling

### API Error Responses

```typescript
// Consistent error format from backend
{
  "error": true,
  "message": "Invalid credentials",
  "code": "AUTH_INVALID_CREDS",
  "status": 401
}
```

### Frontend Error Handling

```typescript
try {
  const result = await login(credentials);
} catch (error) {
  const message = error.response?.data?.message || 'An error occurred';
  setFormError(message);
}
```

## 7. Database Integration

### User Data Model

Expected backend user schema:

```javascript
{
  id: String (UUID),
  email: String (unique),
  name: String,
  password: String (hashed),
  company: String,
  role: String,
  timezone: String,
  profileComplete: Boolean,
  verificationStatus: String,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

## 8. Deployment Strategy

### Option A: Vercel Frontend + Railway Backend

1. **Frontend Deployment**
   - Push to GitHub
   - Connect to Vercel
   - Set env vars
   - Auto-deploy on push

2. **Backend Deployment**
   - Already on Railway
   - Update CORS origins when frontend URL changes
   - Monitor logs in Railway dashboard

### Option B: Self-Hosted Frontend

```bash
# Build
npm run build

# Deploy to your server
npm start

# With PM2
pm2 start npm --name "clawdbot-frontend" -- start
```

## 9. Development Workflow

### Running Locally

**Terminal 1 - Frontend:**
```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

**Terminal 2 - Backend:**
```bash
# Your backend command
node src/server.js
# http://localhost:3001
```

### Testing the Integration

1. Visit `http://localhost:3000`
2. Click "Get Started"
3. Fill signup form
4. Verify API calls in Network tab
5. Check backend logs for requests
6. Confirm token storage in DevTools

## 10. Performance Optimization

### Frontend Optimizations

- Code splitting with Next.js
- Image optimization
- API response caching with SWR
- Lazy loading for routes
- CSS minification

### Backend Optimization

- Connection pooling
- Response compression
- Rate limiting
- Query optimization
- Caching strategies

## 11. Monitoring & Logging

### Frontend Monitoring

```typescript
// Add to lib/api.ts
apiClient.interceptors.response.use(
  response => {
    console.log('[API] Success:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('[API] Error:', error.response?.status, error.message);
    // Send to error tracking service (Sentry, etc.)
  }
);
```

### Backend Monitoring

- Railway dashboard logs
- Error tracking (Sentry, LogRocket)
- Performance monitoring (New Relic, DataDog)
- Database query logs

## 12. Security Checklist

- [ ] HTTPS enabled on backend
- [ ] CORS properly configured
- [ ] JWT secrets secure on backend
- [ ] Password hashing implemented (bcrypt)
- [ ] Rate limiting on auth endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection in frontend
- [ ] CSRF tokens for state-changing requests
- [ ] Secure cookie settings (HttpOnly, Secure, SameSite)
- [ ] Regular security audits

## Troubleshooting

### "CORS Error"
```
Solution: Check CORS configuration in backend, ensure frontend URL is whitelisted
```

### "401 Unauthorized"
```
Solution: Verify token is stored in localStorage, check token expiration
```

### "API Connection Failed"
```
Solution: Verify NEXT_PUBLIC_API_URL is correct, check backend is running
```

### "Infinite Redirect Loop"
```
Solution: Implement proper auth state management, avoid redirects in useEffect dependencies
```

## Support

For integration issues:
1. Check the Network tab in DevTools
2. Review backend logs in Railway dashboard
3. Verify environment variables
4. Check API response status codes
5. Review error messages in console

---

**Last Updated**: 2025-02-12
**Frontend Version**: 1.0.0
**Backend Compatibility**: Railway Node.js Template
