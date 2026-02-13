'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/auth/login');
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-4">⟳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Clawdbot Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-2">Authorization Status</h3>
            <p className="text-3xl font-bold text-green-600">Active</p>
            <p className="text-sm text-gray-600 mt-2">Your account is fully authorized</p>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-2">Security Score</h3>
            <p className="text-3xl font-bold text-blue-600">92%</p>
            <p className="text-sm text-gray-600 mt-2">Excellent security posture</p>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-2">Recent Activity</h3>
            <p className="text-3xl font-bold text-purple-600">3</p>
            <p className="text-sm text-gray-600 mt-2">Last 24 hours</p>
          </Card>
        </div>

        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Button onClick={() => router.push('/dashboard/profile')} className="w-full">
              Update Profile
            </Button>
            <Button variant="secondary" onClick={() => router.push('/dashboard/settings')} className="w-full">
              Security Settings
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
