'use client';

import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Widget, ProgressCard } from '@/components/DashboardWidgets';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(false);

    try {
      await updateProfile(formData);
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to update profile');
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Profile</h1>
            <p className="text-gray-600">Manage your account information and preferences</p>
          </div>

          {/* Success Alert */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              Profile updated successfully
            </div>
          )}

          {/* Error Alert */}
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {submitError}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="md:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                  <Button
                    variant={isEditing ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      type="text"
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={isLoading}
                    />
                    <Input
                      type="email"
                      label="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isLoading}
                    />
                    <Button type="submit" isLoading={isLoading} className="w-full">
                      Save Changes
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Full Name</p>
                      <p className="text-lg font-medium text-gray-900">{user?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email Address</p>
                      <p className="text-lg font-medium text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">User ID</p>
                      <p className="text-sm font-mono text-gray-500">{user?.id}</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <Widget title="Account Status">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="text-sm font-semibold text-green-600">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Onboarding</span>
                    <span className={`text-sm font-semibold ${user?.onboardingComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                      {user?.onboardingComplete ? 'Complete' : 'In Progress'}
                    </span>
                  </div>
                </div>
              </Widget>

              <Widget title="Security">
                <Link href="/dashboard/settings" className="text-blue-600 hover:underline text-sm">
                  View Security Settings
                </Link>
              </Widget>
            </div>
          </div>

          {/* Additional Sections */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            {/* Preferences */}
            <Widget title="Preferences">
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 border border-gray-300 rounded" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Email notifications</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 border border-gray-300 rounded" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Newsletter</span>
                </label>
              </div>
            </Widget>

            {/* Danger Zone */}
            <Widget title="Danger Zone" className="border-red-200">
              <p className="text-sm text-gray-600 mb-4">
                Irreversible actions to manage your account
              </p>
              <Button variant="secondary" className="w-full text-red-600 border-red-300 hover:bg-red-50">
                Delete Account
              </Button>
            </Widget>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
