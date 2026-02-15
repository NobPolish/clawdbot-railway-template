export const routes = {
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    logout: '/auth/logout',
  },
  onboarding: {
    welcome: '/onboarding/welcome',
    profile: '/onboarding/profile',
    verification: '/onboarding/verification',
    complete: '/onboarding/complete',
  },
  dashboard: {
    home: '/dashboard',
    settings: '/dashboard/settings',
    profile: '/dashboard/profile',
  },
};

export const apiEndpoints = {
  auth: {
    login: '/api/auth/login',
    signup: '/api/auth/signup',
    verify: '/api/auth/verify',
    refresh: '/api/auth/refresh',
  },
  user: {
    profile: '/api/user/profile',
    update: '/api/user/update',
  },
  ai: {
    chat: '/api/ai/chat',
    verify: '/api/ai/verify',
  },
};
