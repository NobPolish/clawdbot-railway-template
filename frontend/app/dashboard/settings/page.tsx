'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    twoFactorAuth: true,
    emailNotifications: true,
    apiAccessLog: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      console.log('[v0] Settings saved:', settings);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Security Settings</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Security Options</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Require a code in addition to your password</p>
              </div>
              <input
                type="checkbox"
                checked={settings.twoFactorAuth}
                onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                className="w-6 h-6 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-600">Get alerts for important account activity</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-6 h-6 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">API Access Log</h3>
                <p className="text-sm text-gray-600">Keep detailed logs of API access</p>
              </div>
              <input
                type="checkbox"
                checked={settings.apiAccessLog}
                onChange={(e) => setSettings({ ...settings, apiAccessLog: e.target.checked })}
                className="w-6 h-6 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button onClick={handleSave} isLoading={isSaving}>
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
