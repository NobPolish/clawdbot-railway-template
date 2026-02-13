'use client';

import { useAuthContext } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

export default function DashboardPage() {
  const { user, logout } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Clawdbot Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
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
              <h3 className="font-semibold text-gray-900 mb-2">Onboarding</h3>
              <p className="text-3xl font-bold text-purple-600">
                {user?.onboardingComplete ? '100%' : 'In Progress'}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {user?.onboardingComplete ? 'Complete' : 'Complete your profile'}
              </p>
            </Card>
          </div>

          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Button className="w-full">
                View Settings
              </Button>
              <Button variant="secondary" className="w-full">
                Security Options
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </ProtectedRoute>
  );
}
