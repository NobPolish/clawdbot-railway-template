'use client';

import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Widget, AlertBanner, StatsGrid, ActivityFeed } from '@/components/DashboardWidgets';
import Link from 'next/link';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
}

export default function AdminPage() {
  const { user } = useAuthContext();
  const [users, setUsers] = useState<AdminUser[]>([
    {
      id: '1',
      email: 'user1@example.com',
      name: 'User One',
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  // Check if current user is admin
  const isAdmin = user?.id === 'admin-user-id'; // Replace with actual admin check

  const handleSuspendUser = async (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: 'suspended' } : u
    ));
    setShowSuspendModal(false);
  };

  const stats = [
    { title: 'Total Users', value: users.length, subtitle: 'Active accounts' },
    { title: 'Pending Approvals', value: users.filter(u => u.status === 'pending').length },
    { title: 'Suspended', value: users.filter(u => u.status === 'suspended').length },
    { title: 'System Health', value: '99.9%', subtitle: 'Uptime' },
  ];

  const activities = [
    {
      id: '1',
      action: 'New user registration',
      timestamp: 'Just now',
      status: 'success' as const,
    },
    {
      id: '2',
      action: 'User account suspended',
      timestamp: '5 minutes ago',
      status: 'warning' as const,
    },
  ];

  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-md p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">You do not have permission to access this page.</p>
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              Return to Dashboard
            </Link>
          </Card>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage users and moderate content</p>
          </div>

          {/* Stats Grid */}
          <div className="mb-8">
            <StatsGrid stats={stats} columns={4} />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Users Table */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">User Management</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="text-left text-sm font-semibold text-gray-700 pb-3">User</th>
                        <th className="text-left text-sm font-semibold text-gray-700 pb-3">Email</th>
                        <th className="text-left text-sm font-semibold text-gray-700 pb-3">Role</th>
                        <th className="text-left text-sm font-semibold text-gray-700 pb-3">Status</th>
                        <th className="text-left text-sm font-semibold text-gray-700 pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="py-3 text-sm text-gray-900">{u.name}</td>
                          <td className="py-3 text-sm text-gray-600">{u.email}</td>
                          <td className="py-3 text-sm text-gray-900 capitalize">{u.role}</td>
                          <td className="py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              u.status === 'active' ? 'bg-green-100 text-green-800' :
                              u.status === 'suspended' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3 text-sm">
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setShowSuspendModal(true);
                              }}
                              className="text-red-600 hover:underline"
                            >
                              Suspend
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Moderation Queue */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Moderation Queue</h2>
                <p className="text-gray-600 text-sm">No items requiring moderation</p>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <Widget title="Recent Activity">
                <ActivityFeed items={activities} maxItems={3} />
              </Widget>

              {/* System Status */}
              <Widget title="System Status">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      Healthy
                    </span>
                  </div>
                </div>
              </Widget>

              {/* Quick Actions */}
              <Widget title="Quick Actions">
                <div className="space-y-2">
                  <Button variant="secondary" className="w-full text-sm">
                    View Logs
                  </Button>
                  <Button variant="secondary" className="w-full text-sm">
                    System Settings
                  </Button>
                </div>
              </Widget>
            </div>
          </div>

          {/* Suspend Modal */}
          {showSuspendModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="max-w-md w-full p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Suspend User</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to suspend <strong>{selectedUser.name}</strong>?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={() => handleSuspendUser(selectedUser.id)}
                    className="flex-1"
                  >
                    Suspend
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSuspendModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
