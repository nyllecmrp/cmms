'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Organization {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  industry: string;
  tier: string;
  status: string;
  maxUsers: number;
  users: number;
  activeModules: number;
}

export default function SuperadminPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    industry: '',
    tier: 'starter',
    maxUsers: 10,
  });
  const [saveLoading, setSaveLoading] = useState(false);

  // Redirect non-superadmin users to regular dashboard
  useEffect(() => {
    if (user && !user.isSuperAdmin) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    // Fetch organizations from API
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const data = await api.getOrganizations();
        setOrganizations(data as Organization[]);
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

  const handleAddOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);

    try {
      // Create organization via API
      const result: any = await api.createOrganization({
        ...formData,
        country: 'Philippines', // Default to Philippines
      });

      const createdOrgId = result.organization?.id;

      // Ask if user wants to create admin account
      const createAdmin = confirm(`✅ Organization "${formData.name}" created!\n\nWould you like to create an admin user account for this organization?\n\nEmail: ${formData.email}`);

      if (createAdmin && createdOrgId) {
        const fullName = prompt('Enter admin full name (e.g., John Doe):');
        const password = prompt('Enter password for admin account:');

        if (fullName && password) {
          try {
            await api.createOrganizationAdmin(createdOrgId, password, fullName);
            alert(`✅ Admin user created successfully!\n\nEmail: ${formData.email}\nPassword: ${password}\n\nThe organization admin can now log in.`);
          } catch (adminErr: any) {
            alert(`❌ Failed to create admin user: ${adminErr.message}`);
          }
        }
      }

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        industry: '',
        tier: 'starter',
        maxUsers: 10,
      });
      setIsAddModalOpen(false);

      // Refresh organizations list
      const data = await api.getOrganizations();
      setOrganizations(data as Organization[]);
    } catch (err: any) {
      alert(`❌ Failed to create organization: ${err.message || 'Unknown error'}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEditOrganization = (org: Organization) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name || '',
      email: org.email || '',
      phone: org.phone || '',
      address: org.address || '',
      city: org.city || '',
      industry: org.industry || '',
      tier: org.tier || 'starter',
      maxUsers: org.maxUsers || 10,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;
    
    setSaveLoading(true);
    
    try {
      // Update organization via API
      await api.updateOrganization(selectedOrg.id, {
        ...formData,
        country: 'Philippines',
      });
      
      // Show success message
      alert(`✅ Organization "${formData.name}" updated successfully!`);

      // Reset and close modal
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        industry: '',
        tier: 'starter',
        maxUsers: 10,
      });
      setSelectedOrg(null);
      setIsEditModalOpen(false);

      // Refresh organizations list
      const data = await api.getOrganizations();
      setOrganizations(data as Organization[]);
    } catch (error: any) {
      alert(`❌ Failed to update organization: ${error.message}`);
      console.error('Update failed:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteOrganization = async (org: Organization) => {
    if (!confirm(`Are you sure you want to delete "${org.name}"? This will permanently delete all data including users, assets, and work orders.`)) {
      return;
    }

    try {
      await api.deleteOrganization(org.id);
      alert(`✅ Organization "${org.name}" deleted successfully!`);

      // Refresh organizations list
      const data = await api.getOrganizations();
      setOrganizations(data as Organization[]);
    } catch (error: any) {
      alert(`❌ Failed to delete organization: ${error.message}`);
      console.error('Delete failed:', error);
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
            <button
              onClick={() => {
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  address: '',
                  city: '',
                  industry: '',
                  tier: 'starter',
                  maxUsers: 10,
                });
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
            >
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
                        <button
                          onClick={() => router.push(`/superadmin/organizations/${org.id}/users`)}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Users
                        </button>
                        <button
                          onClick={() => handleEditOrganization(org)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteOrganization(org)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
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
            <p className="text-sm text-gray-600 mb-4">Subscription and payment management</p>
            <button
              onClick={() => router.push('/superadmin/billing')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View Billing →
            </button>
          </div>
        </div>

        {/* Add Organization Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Add New Organization</h2>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddOrganization} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Industry
                      </label>
                      <select
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      >
                        <option value="">Select Industry</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="facilities">Facilities</option>
                        <option value="fleet">Fleet Management</option>
                        <option value="hospitality">Hospitality</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tier *
                      </label>
                      <select
                        value={formData.tier}
                        onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                      >
                        <option value="starter">Starter</option>
                        <option value="professional">Professional</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="enterprise_plus">Enterprise Plus</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Users *
                      </label>
                      <input
                        type="number"
                        value={formData.maxUsers}
                        onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      disabled={saveLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                      disabled={saveLoading}
                    >
                      {saveLoading ? 'Creating...' : 'Create Organization'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Organization Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Organization</h2>
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setSelectedOrg(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleUpdateOrganization} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Industry
                      </label>
                      <select
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      >
                        <option value="">Select Industry</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="facilities">Facilities Management</option>
                        <option value="utilities">Utilities</option>
                        <option value="transportation">Transportation</option>
                        <option value="hospitality">Hospitality</option>
                        <option value="education">Education</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subscription Tier *
                      </label>
                      <select
                        value={formData.tier}
                        onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                      >
                        <option value="starter">Starter</option>
                        <option value="professional">Professional</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="enterprise_plus">Enterprise Plus</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Users *
                      </label>
                      <input
                        type="number"
                        value={formData.maxUsers}
                        onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditModalOpen(false);
                        setSelectedOrg(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      disabled={saveLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                      disabled={saveLoading}
                    >
                      {saveLoading ? 'Updating...' : 'Update Organization'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
    </ProtectedRoute>
  );
}
