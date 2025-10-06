'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Organization {
  id: string;
  name: string;
  tier: string;
  status: string;
  users: number;
  activeModules: number;
}

export default function SuperadminPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch organizations from API
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const data = await api.getOrganizations();
        setOrganizations(data);
      } catch (err) {
        console.error('Failed to fetch organizations:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch organizations');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'starter': return 'bg-gray-100 text-gray-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'enterprise_plus': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute requireSuperAdmin>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">🔐 Superadmin Dashboard</h1>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Logout
            </button>
          </div>
        </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Organizations</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{organizations.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Active Users</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">
              {organizations.reduce((sum, org) => sum + org.users, 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Modules Active</div>
            <div className="text-3xl font-bold text-purple-600 mt-2">
              {organizations.reduce((sum, org) => sum + org.activeModules, 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Monthly Revenue</div>
            <div className="text-3xl font-bold text-green-600 mt-2">₱245K</div>
          </div>
        </div>

        {/* Organizations */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Organizations</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold">
              + Add Organization
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : organizations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No organizations found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Active Modules
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {organizations.map((org) => (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{org.name}</div>
                        <div className="text-xs text-gray-500">{org.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTierColor(org.tier)}`}>
                          {org.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {org.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{org.users}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{org.activeModules}</td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => router.push(`/superadmin/organizations/${org.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Manage Modules
                        </button>
                        <button className="text-gray-600 hover:text-gray-800">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-3">📦</div>
            <h3 className="font-semibold text-gray-900 mb-2">Module Requests</h3>
            <p className="text-sm text-gray-600 mb-4">Review pending module requests</p>
            <button
              onClick={() => router.push('/superadmin/requests')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View Requests →
            </button>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Usage Analytics</h3>
            <p className="text-sm text-gray-600 mb-4">Monitor module usage and adoption</p>
            <button
              onClick={() => router.push('/superadmin/usage')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View Analytics →
            </button>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-3">🔔</div>
            <h3 className="font-semibold text-gray-900 mb-2">Expiring Licenses</h3>
            <p className="text-sm text-gray-600 mb-4">Modules expiring in next 30 days</p>
            <button
              onClick={() => router.push('/superadmin/expirations')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View Expirations →
            </button>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-semibold text-gray-900 mb-2">Billing Overview</h3>
            <p className="text-sm text-gray-600 mb-4">Revenue and subscription status</p>
            <button
              onClick={() => router.push('/superadmin/billing')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View Billing →
            </button>
          </div>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
