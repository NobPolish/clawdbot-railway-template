# Frontend-Backend Integration Guide

## Overview

This guide demonstrates how to seamlessly integrate the modern Clawdbot frontend with your existing Railway-hosted backend. The frontend is built with Next.js 15 and implements production-ready authentication with AI-powered onboarding features.

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API running (Railway deployment or local)
- Git (for version control)

## Project Structure

```
frontend/
├── app/                          # Next.js app router pages
│   ├── auth/                    # Authentication pages (login/signup)
│   ├── onboarding/              # AI-powered onboarding flow
│   ├── dashboard/               # Protected user dashboard
│   ├── layout.tsx               # Root layout with AuthProvider
│   └── page.tsx                 # Home page
├── components/                   # Reusable UI components
│   ├── ProtectedRoute.tsx        # Route protection wrapper
│   ├── Button.tsx               # Button component
│   ├── Input.tsx                # Form input component
│   └── Card.tsx                 # Card component
├── context/                      # React Context providers
│   └── AuthContext.tsx           # Authentication state management
├── hooks/                        # Custom React hooks
│   └── useAuth.ts               # (Legacy - use AuthContext instead)
├── lib/                          # Utilities and helpers
│   ├── api.ts                   # Axios API client with interceptors
│   ├── api-config.ts            # API endpoints and configuration
│   └── constants.ts             # Application constants
├── public/                       # Static assets
└── package.json                 # Dependencies

```

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
# or
yarn install
# or
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```bash
# Backend API URL - configure to point to your Railway backend
NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app

# Optional: For development, use local backend
# NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm start
```

## Backend Integration

### Expected API Endpoints

Your backend must implement the following endpoints. Ensure your Railway backend has these routes configured:

#### Authentication Endpoints

```
POST   /api/auth/login           - User login
POST   /api/auth/signup          - User registration
GET    /api/auth/me              - Get current user
POST   /api/auth/logout          - User logout
PUT    /api/auth/profile         - Update user profile
POST   /api/auth/password-reset  - Request password reset
```

#### Onboarding Endpoints

```
GET    /api/onboarding/status    - Get onboarding status
POST   /api/onboarding/complete  - Complete onboarding step
POST   /api/onboarding/verify-email - Email verification
```

#### User Endpoints

```
GET    /api/users/profile        - Get user profile
PUT    /api/users/settings       - Update user settings
POST   /api/users/2fa/enable     - Enable 2FA
POST   /api/users/2fa/verify     - Verify 2FA code
GET    /api/users/security       - Get security settings
```

#### Health Check

```
GET    /api/health               - Backend health check
```

### Request/Response Format

All API requests should use JSON with the following structure:

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer {token}  (included in protected routes)
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "onboardingComplete": false
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error explanation"
}
```

## Authentication Flow

### 1. Login Flow

```
User enters credentials
    ↓
Frontend POST to /api/auth/login
    ↓
Backend validates credentials, returns JWT token
    ↓
Frontend stores token in localStorage
    ↓
Frontend sets Authorization header automatically
    ↓
Redirect to /dashboard
```

### 2. Signup & Onboarding

```
User creates account
    ↓
Frontend POST to /api/auth/signup
    ↓
Backend creates user, returns JWT token
    ↓
Frontend stores token in localStorage
    ↓
Redirect to /onboarding/welcome
    ↓
User completes onboarding steps (profile, verification)
    ↓
Complete button redirects to /dashboard
```

### 3. Protected Routes

All routes in `/dashboard` and `/onboarding` use the `ProtectedRoute` component, which:

- Checks if user is authenticated
- Shows loading state while verifying token
- Redirects to login if not authenticated
- Automatically refreshes user state on auth context initialization

## API Client Usage

The frontend includes an intelligent API client with built-in:

- **Automatic Token Injection**: Token is automatically added to all requests
- **Error Handling**: Specific handling for 401/403 errors
- **Request/Response Logging**: Debug logging for development
- **Timeout Management**: 30-second default timeout
- **CORS Support**: Configured for cross-origin requests

### Manual API Calls

```typescript
import apiClient from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api-config';

// Make authenticated request
const response = await apiClient.get(API_ENDPOINTS.users.profile);

// Handle errors
try {
  await apiClient.post(API_ENDPOINTS.auth.login, { email, password });
} catch (error) {
  console.error('API Error:', error.response?.status);
}
```

## Deployment on Vercel

### 1. Connect GitHub Repository

```bash
git push origin main
```

### 2. Import Project on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Select `frontend/` as root directory

### 3. Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL = https://your-railway-backend.railway.app
```

### 4. Deploy

Click "Deploy" - Vercel will automatically:
- Install dependencies
- Build the Next.js application
- Deploy to edge network

## Deployment on Railway

### 1. Using Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

### 2. Railway Configuration

1. Connect GitHub repository to Railway
2. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend URL
3. Set start command: `npm start`
4. Deploy

## Troubleshooting

### CORS Errors

**Issue**: "Access to XMLHttpRequest has been blocked by CORS policy"

**Solution**: Ensure backend has CORS enabled:

```javascript
// Backend should have CORS middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend.vercel.app'],
  credentials: true
}));
```

### 401 Unauthorized on Protected Routes

**Issue**: Token is invalid or expired

**Solution**: 
1. Check token is being sent: Open DevTools → Network, verify `Authorization` header
2. Verify token format: Should be `Bearer {token}`
3. Clear localStorage and re-login

### Backend Connection Issues

**Issue**: "Backend may be offline" error

**Solution**:
1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check backend is running: `curl {API_URL}/api/health`
3. Verify CORS settings on backend
4. Check network connectivity

### Environment Variables Not Loading

**Solution**: Ensure `.env.local` is in `frontend/` directory and restart dev server.

## Security Considerations

1. **Token Storage**: JWT tokens are stored in localStorage (consider sessionStorage for enhanced security)
2. **HTTPS Only**: Always use HTTPS in production
3. **Token Refresh**: Implement token refresh logic if tokens have short expiration
4. **Input Validation**: Frontend validates inputs; backend must also validate
5. **Rate Limiting**: Configure rate limiting on backend for auth endpoints

## Performance Optimization

1. **Code Splitting**: Next.js automatically code-splits routes
2. **Image Optimization**: Use Next.js Image component for images
3. **Caching**: Browser caching is configured via headers
4. **API Response Caching**: Consider implementing cache headers on backend

## Development Tips

### Enable Debug Logging

All API calls are logged with `[v0]` prefix. Check browser console:

```
[v0] Request with token: /api/auth/login
[v0] Response: 200 /api/auth/login
[v0] Login successful
```

### Test API Endpoints

```bash
# Test backend health
curl http://localhost:3001/api/health

# Test login endpoint
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Mock Backend Responses

For development without a backend, implement mock responses in `lib/api.ts` using API mocking libraries like `msw` or `json-server`.

## Next Steps

1. Implement remaining onboarding pages
2. Add password reset functionality
3. Implement 2FA setup flow
4. Add user profile editing
5. Integrate with AI services for enhanced features
6. Setup analytics and monitoring

## Support

For issues or questions:
- Check debug logs in browser console
- Review API responses in Network tab
- Verify backend endpoints are implemented correctly
- Check environment variables are set correctly
