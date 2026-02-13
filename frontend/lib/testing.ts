/**
 * Testing & QA Utilities
 * Tools for testing API integration, data validation, and component testing
 */

import { API_ENDPOINTS, User } from './api-config';
import apiClient from './api';

/**
 * API Integration Tester
 * Validates backend endpoint responses
 */
export class APITester {
  private results: Map<string, any> = new Map();

  async testEndpoint(name: string, method: 'GET' | 'POST' | 'PUT', endpoint: string, data?: any) {
    try {
      console.log(`[v0] Testing ${method} ${endpoint}`);
      let response;

      if (method === 'GET') {
        response = await apiClient.get(endpoint);
      } else if (method === 'POST') {
        response = await apiClient.post(endpoint, data);
      } else if (method === 'PUT') {
        response = await apiClient.put(endpoint, data);
      }

      this.results.set(name, { status: 'pass', data: response?.data });
      console.log(`[v0] ✓ ${name} passed`);
      return true;
    } catch (error: any) {
      this.results.set(name, { status: 'fail', error: error.message });
      console.error(`[v0] ✗ ${name} failed:`, error.message);
      return false;
    }
  }

  async runAuthTests() {
    console.log('[v0] Running authentication tests...');
    
    await this.testEndpoint('GET /auth/me', 'GET', API_ENDPOINTS.auth.me);
  }

  async runOnboardingTests() {
    console.log('[v0] Running onboarding tests...');
    
    await this.testEndpoint('GET /onboarding/status', 'GET', API_ENDPOINTS.onboarding.status);
  }

  async runUserTests() {
    console.log('[v0] Running user tests...');
    
    await this.testEndpoint('GET /users/profile', 'GET', API_ENDPOINTS.users.profile);
    await this.testEndpoint('GET /users/security', 'GET', API_ENDPOINTS.users.securitySettings);
  }

  getResults() {
    return Object.fromEntries(this.results);
  }

  printReport() {
    console.log('[v0] === API Test Report ===');
    const results = this.getResults();
    let passed = 0;
    let failed = 0;

    for (const [name, result] of Object.entries(results)) {
      if (result.status === 'pass') {
        console.log(`✓ ${name}`);
        passed++;
      } else {
        console.log(`✗ ${name}: ${result.error}`);
        failed++;
      }
    }

    console.log(`\nTotal: ${passed} passed, ${failed} failed`);
  }
}

/**
 * Data Validation Tester
 * Validates data structures and types
 */
export class DataValidator {
  static validateUser(user: any): user is User {
    return (
      user &&
      typeof user.id === 'string' &&
      typeof user.email === 'string' &&
      typeof user.name === 'string' &&
      typeof user.onboardingComplete === 'boolean'
    );
  }

  static validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) errors.push('Password must be at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Password must contain number');
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('Password must contain special character');

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateUsername(username: string): boolean {
    return /^[a-zA-Z0-9_-]{3,20}$/.test(username);
  }
}

/**
 * Component Testing Utilities
 */
export function mockAuthContext() {
  return {
    user: {
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
      onboardingComplete: false,
    },
    isLoading: false,
    isAuthenticated: true,
    error: null,
    login: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
    clearError: jest.fn(),
  };
}

/**
 * Performance Testing Utility
 */
export class PerformanceTester {
  private marks: Map<string, number> = new Map();

  start(label: string) {
    this.marks.set(label, performance.now());
  }

  end(label: string): number {
    const startTime = this.marks.get(label);
    if (!startTime) {
      console.warn(`[v0] No start mark for ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    console.log(`[v0] ${label} took ${duration.toFixed(2)}ms`);
    return duration;
  }

  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    const result = await fn();
    this.end(label);
    return result;
  }

  measure<T>(label: string, fn: () => T): T {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  }

  reset() {
    this.marks.clear();
  }
}

/**
 * E2E Testing Helper
 */
export class E2ETester {
  async testAuthFlow() {
    console.log('[v0] Testing auth flow...');
    const tester = new APITester();
    
    try {
      await tester.testEndpoint('Login', 'POST', API_ENDPOINTS.auth.login, {
        email: 'test@example.com',
        password: 'TestPassword123!',
      });

      await tester.testEndpoint('Get User', 'GET', API_ENDPOINTS.auth.me);
      
      tester.printReport();
      return true;
    } catch (error) {
      console.error('[v0] Auth flow test failed:', error);
      return false;
    }
  }

  async testOnboardingFlow() {
    console.log('[v0] Testing onboarding flow...');
    const tester = new APITester();

    try {
      await tester.testEndpoint('Get Status', 'GET', API_ENDPOINTS.onboarding.status);
      await tester.testEndpoint('Complete Step', 'POST', API_ENDPOINTS.onboarding.completeStep, {
        step: 'profile',
        data: { name: 'Test User' },
      });

      tester.printReport();
      return true;
    } catch (error) {
      console.error('[v0] Onboarding flow test failed:', error);
      return false;
    }
  }
}

/**
 * Debug Logger
 */
export class DebugLogger {
  static enableDebugMode() {
    if (typeof window !== 'undefined') {
      (window as any).__DEBUG__ = true;
      console.log('[v0] Debug mode enabled');
    }
  }

  static log(message: string, data?: any) {
    if (typeof window !== 'undefined' && (window as any).__DEBUG__) {
      console.log(`[v0 DEBUG] ${message}`, data);
    }
  }

  static error(message: string, error?: any) {
    console.error(`[v0 ERROR] ${message}`, error);
  }

  static warn(message: string, data?: any) {
    console.warn(`[v0 WARN] ${message}`, data);
  }

  static group(label: string) {
    console.group(`[v0] ${label}`);
  }

  static groupEnd() {
    console.groupEnd();
  }
}
