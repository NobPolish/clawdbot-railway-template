/**
 * Backend Integration Configuration
 * ================================
 * This file defines the API endpoints that the frontend expects from the backend.
 * Configure your backend to match these endpoints and response formats.
 */

export const BACKEND_CONFIG = {
  // Backend server base URL - set via environment variable
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  
  // Request timeout in milliseconds
  timeout: 30000,
  
  // Enable credentials for cross-origin requests
  withCredentials: false,
};

/**
 * API Endpoints Structure
 */
export const API_ENDPOINTS = {
  // Authentication Endpoints
  auth: {
    // POST: Login user
    // Request: { email: string, password: string }
    // Response: { token: string, user: User }
    login: '/api/auth/login',
    
    // POST: Create new user account
    // Request: { email: string, password: string, name: string }
    // Response: { token: string, user: User }
    signup: '/api/auth/signup',
    
    // GET: Get current authenticated user
    // Response: { user: User }
    me: '/api/auth/me',
    
    // POST: Logout user
    // Response: { success: boolean }
    logout: '/api/auth/logout',
    
    // PUT: Update user profile
    // Request: Partial<User>
    // Response: { user: User }
    updateProfile: '/api/auth/profile',
    
    // POST: Request password reset
    // Request: { email: string }
    // Response: { message: string }
    requestPasswordReset: '/api/auth/password-reset',
    
    // POST: Reset password with token
    // Request: { token: string, password: string }
    // Response: { message: string }
    resetPassword: '/api/auth/password-reset/confirm',
  },

  // Onboarding Endpoints
  onboarding: {
    // GET: Get onboarding status
    // Response: { completed: boolean, currentStep: string }
    status: '/api/onboarding/status',
    
    // POST: Complete onboarding step
    // Request: { step: string, data: any }
    // Response: { success: boolean, nextStep?: string }
    completeStep: '/api/onboarding/complete',
    
    // POST: Verify email
    // Request: { code: string }
    // Response: { verified: boolean }
    verifyEmail: '/api/onboarding/verify-email',
  },

  // User Endpoints
  users: {
    // GET: Get user profile
    // Response: { user: User }
    profile: '/api/users/profile',
    
    // PUT: Update user settings
    // Request: Partial<User>
    // Response: { user: User }
    updateSettings: '/api/users/settings',
    
    // POST: Enable 2FA
    // Response: { qrCode: string, secret: string }
    enable2FA: '/api/users/2fa/enable',
    
    // POST: Verify 2FA code
    // Request: { code: string }
    // Response: { verified: boolean }
    verify2FA: '/api/users/2fa/verify',
    
    // GET: Get security settings
    // Response: { twoFactorEnabled: boolean, lastLogin: string, ... }
    securitySettings: '/api/users/security',
  },

  // Health Check Endpoint
  health: {
    // GET: Check backend health
    // Response: { status: 'ok', timestamp: string }
    check: '/api/health',
  },
};

/**
 * User Type Definition
 * Ensure your backend returns user objects matching this structure
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  onboardingComplete: boolean;
  twoFactorEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * API Response Wrapper
 * All API responses should follow this structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
