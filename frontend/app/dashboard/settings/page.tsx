'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/context/AuthContext';
import { useFetchSecuritySettings } from '@/lib/hooks';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { Widget, AlertBanner, CardSkeleton } from '@/components/DashboardWidgets';
import apiClient from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api-config';

export default function SettingsPage() {
  const { user } = useAuthContext();
  const { securitySettings, isLoading, mutate } = useFetchSecuritySettings();
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    emailNotifications: true,
    activityLog: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showTwoFASetup, setShowTwoFASetup] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await apiClient.put(API_ENDPOINTS.users.updateSettings, settings);
      await mutate();
      setSuccess('Security settings updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.users.enable2FA);
      console.log('[v0] 2FA setup initiated:', response.data);
      setShowTwoFASetup(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to enable 2FA');
    }
  };

  const handleVerify2FA = async () => {
    try {
      await apiClient.post(API_ENDPOINTS.users.verify2FA, { code: twoFACode });
      setSettings({ ...settings, twoFactorEnabled: true });
      setShowTwoFASetup(false);
      setTwoFACode('');
      setSuccess('Two-Factor Authentication enabled successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify 2FA code');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Security Settings</h1>
            <div className="space-y-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account security and privacy preferences</p>
          </div>

          {/* Alerts */}
          {success && <AlertBanner type="success" title="Success" message={success} onClose={() => setSuccess(null)} />}
          {error && <AlertBanner type="error" title="Error" message={error} onClose={() => setError(null)} />}

          <div className="space-y-6">
            {/* Two-Factor Authentication */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Two-Factor Authentication</h2>
                  <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${settings.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>

              {showTwoFASetup ? (
                <div className="space-y-4 border-t pt-6">
                  <p className="text-sm text-gray-600">Enter the 6-digit code from your authenticator app:</p>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value.slice(0, 6))}
                    maxLength={6}
                  />
                  <div className="flex gap-3">
                    <Button onClick={handleVerify2FA}>Verify & Enable</Button>
                    <Button variant="outline" onClick={() => setShowTwoFASetup(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleEnable2FA}
                  variant={settings.twoFactorEnabled ? 'outline' : 'primary'}
                >
                  {settings.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                </Button>
              )}
            </Card>

            {/* Email Notifications */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Email Notifications</h2>
              <div className="space-y-4">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    className="w-5 h-5 border border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Security Alerts</p>
                    <p className="text-sm text-gray-600">Get notified of suspicious activity and login attempts</p>
                  </div>
                </label>
              </div>
            </Card>

            {/* Activity Tracking */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Activity Tracking</h2>
              <div className="space-y-4">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.activityLog}
                    onChange={(e) => setSettings({ ...settings, activityLog: e.target.checked })}
                    className="w-5 h-5 border border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Keep Activity Log</p>
                    <p className="text-sm text-gray-600">Maintain detailed logs of all account activities and API calls</p>
                  </div>
                </label>
              </div>
            </Card>

            {/* Recent Login Activity */}
            <Widget title="Recent Activity" description="Last 5 login attempts from this account">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Successful Login</p>
                    <p className="text-sm text-gray-600">Today at {new Date().toLocaleTimeString()}</p>
                  </div>
                  <span className="text-green-600 text-sm font-semibold">✓</span>
                </div>
              </div>
            </Widget>

            {/* Save Button */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSaveSettings} isLoading={isSaving}>
                Save Security Settings
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
