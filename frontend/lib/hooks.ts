'use client';

import useSWR, { SWRConfiguration } from 'swr';
import apiClient from './api';
import { API_ENDPOINTS, User } from './api-config';

/**
 * Data Fetching Utilities with SWR
 * Provides hooks for fetching and caching data from the backend
 * Handles loading, error states, and automatic revalidation
 */

// SWR fetcher function
const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

// Default SWR configuration
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60000, // 1 minute
  focusThrottleInterval: 300000, // 5 minutes
  errorRetryCount: 3,
  errorRetryInterval: 5000,
};

/**
 * Hook: useFetchUser
 * Fetches current authenticated user data
 */
export function useFetchUser(enabled = true) {
  const { data, error, isLoading, mutate } = useSWR(
    enabled ? API_ENDPOINTS.auth.me : null,
    fetcher,
    {
      ...defaultConfig,
      revalidateOnFocus: true,
    }
  );

  return {
    user: data?.user as User | undefined,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook: useFetchProfile
 * Fetches user profile information
 */
export function useFetchProfile() {
  const { data, error, isLoading, mutate } = useSWR(
    API_ENDPOINTS.users.profile,
    fetcher,
    defaultConfig
  );

  return {
    profile: data?.user as User | undefined,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook: useFetchOnboardingStatus
 * Fetches onboarding progress
 */
export function useFetchOnboardingStatus() {
  const { data, error, isLoading, mutate } = useSWR(
    API_ENDPOINTS.onboarding.status,
    fetcher,
    defaultConfig
  );

  return {
    onboardingStatus: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook: useFetchSecuritySettings
 * Fetches user security settings
 */
export function useFetchSecuritySettings() {
  const { data, error, isLoading, mutate } = useSWR(
    API_ENDPOINTS.users.securitySettings,
    fetcher,
    defaultConfig
  );

  return {
    securitySettings: data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook: useGenericFetch
 * Generic hook for fetching any endpoint
 */
export function useGenericFetch<T = any>(endpoint: string | null, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR(
    endpoint,
    fetcher,
    {
      ...defaultConfig,
      ...config,
    }
  );

  return {
    data: data as T,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Real-time Sync Manager
 * Ensures data consistency across components
 */
export class DataSyncManager {
  private static listeners = new Map<string, Set<(data: any) => void>>();

  static subscribe(key: string, callback: (data: any) => void) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  static notify(key: string, data: any) {
    this.listeners.get(key)?.forEach(callback => callback(data));
  }

  static clear() {
    this.listeners.clear();
  }
}

/**
 * Hook: useSyncedData
 * Syncs data across components in real-time
 */
export function useSyncedData<T = any>(key: string, initialData?: T) {
  const [data, setData] = React.useState<T | undefined>(initialData);

  React.useEffect(() => {
    const unsubscribe = DataSyncManager.subscribe(key, setData);
    return unsubscribe;
  }, [key]);

  return data;
}

// Re-export React for convenience
import React from 'react';
