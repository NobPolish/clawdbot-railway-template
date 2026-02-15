'use client';

import { useState, useCallback } from 'react';
import apiClient from '@/lib/api';
import { apiEndpoints } from '@/lib/constants';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials extends LoginCredentials {
  name: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<AuthResponse>(apiEndpoints.auth.login, credentials);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('[v0] Login successful');
      return userData;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      console.error('[v0] Login error:', message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<AuthResponse>(apiEndpoints.auth.signup, credentials);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('[v0] Signup successful');
      return userData;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Signup failed';
      setError(message);
      console.error('[v0] Signup error:', message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    console.log('[v0] Logout successful');
  }, []);

  return { user, isLoading, error, login, signup, logout };
}
