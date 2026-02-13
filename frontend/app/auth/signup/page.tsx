'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [formError, setFormError] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (formData.password && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    setFormError(errors);

    if (Object.keys(errors).length === 0) {
      try {
        await signup({ name: formData.name, email: formData.email, password: formData.password });
        router.push('/onboarding/welcome');
      } catch {
        console.error('[v0] Signup submission error');
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Clawdbot</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            label="Full Name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formError.name}
            disabled={isLoading}
          />

          <Input
            type="email"
            label="Email Address"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={formError.email}
            disabled={isLoading}
          />

          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={formError.password}
            helpText="At least 8 characters"
            disabled={isLoading}
          />

          <Input
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={formError.confirmPassword}
            disabled={isLoading}
          />

          <Button 
            type="submit" 
            isLoading={isLoading}
            className="w-full"
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
