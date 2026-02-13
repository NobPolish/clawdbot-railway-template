'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import { API_ENDPOINTS, User } from '@/lib/api-config';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          console.log('[v0] Initializing auth with token');
          const response = await apiClient.get(API_ENDPOINTS.auth.me);
          setUser(response.data.user);
          console.log('[v0] Auth initialized:', response.data.user.email);
        }
      } catch (err) {
        console.error('[v0] Auth initialization failed:', err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[v0] Attempting login for:', email);
      const response = await apiClient.post(API_ENDPOINTS.auth.login, { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('authToken', token);
      setUser(userData);
      console.log('[v0] Login successful');
      
      // Route to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      console.error('[v0] Login error:', message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[v0] Attempting signup for:', email);
      const response = await apiClient.post(API_ENDPOINTS.auth.signup, { 
        email, 
        password, 
        name 
      });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('authToken', token);
      setUser(userData);
      console.log('[v0] Signup successful');
      
      // Route to onboarding
      router.push('/onboarding/welcome');
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Signup failed';
      setError(message);
      console.error('[v0] Signup error:', message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      console.log('[v0] Logging out');
      await apiClient.post(API_ENDPOINTS.auth.logout);
    } catch (err) {
      console.error('[v0] Logout error:', err);
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
      setError(null);
      setIsLoading(false);
      router.push('/auth/login');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      console.log('[v0] Updating profile');
      const response = await apiClient.put(API_ENDPOINTS.auth.updateProfile, data);
      setUser(response.data.user);
      console.log('[v0] Profile updated');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Profile update failed';
      setError(message);
      console.error('[v0] Profile update error:', message);
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      error,
      login,
      signup,
      logout,
      updateProfile,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
