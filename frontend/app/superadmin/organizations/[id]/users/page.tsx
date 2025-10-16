'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  status: string;
  createdAt: string;
}

interface Organization {
  id: string;
  name: string;
  email: string;
}

export default function OrganizationUsersPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    roleId: 'admin',
  });
  const [saveLoading, setSaveLoading] = useState(false);

  // Redirect non-superadmin users
  useEffect(() => {
    if (user && !user.isSuperAdmin) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const orgData = await api.getOrganization(params.id as string);
        setOrganization(orgData);

        // Fetch users for this organization
        const usersData = await api.getUsers(params.id as string);
        setUsers(usersData as User[]);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);

    try {
      await api.createUser({
        ...formData,
        organizationId: params.id as string,
      });

      alert(`✅ User "${formData.email}" created successfully!`);

      // Reset form and close modal
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        roleId: 'admin',
      });
      setIsAddModalOpen(false);

      // Refresh users list
      const usersData = await api.getUsers(params.id as string);
      setUsers(usersData as User[]);
    } catch (err: any) {
      alert(`❌ Failed to create user: ${err.message || 'Unknown error'}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEditUser = (u: User) => {
    setSelectedUser(u);
    setFormData({
      email: u.email,
      password: '',
      firstName: u.firstName,
      lastName: u.lastName,
      roleId: u.roleId || 'admin',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSaveLoading(true);

    try {
      await api.updateUser(selectedUser.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        roleId: formData.roleId,
        status: 'active',
      });

      alert(`✅ User "${formData.email}" updated successfully!`);

      // Reset form and close modal
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        roleId: 'admin',
      });
      setSelectedUser(null);
      setIsEditModalOpen(false);

      // Refresh users list
      const usersData = await api.getUsers(params.id as string);
      setUsers(usersData as User[]);
    } catch (err: any) {
      alert(`❌ Failed to update user: ${err.message || 'Unknown error'}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteUser = async (userToDelete: User) => {
    if (!confirm(`Are you sure you want to delete user "${userToDelete.email}"?`)) {
      return;
    }

    try {
      await api.deleteUser(userToDelete.id);
      alert(`✅ User "${userToDelete.email}" deleted successfully!`);

      // Refresh users list
      const usersData = await api.getUsers(params.id as string);
      setUsers(usersData as User[]);
    } catch (err: any) {
      alert(`❌ Failed to delete user: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireSuperAdmin>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireSuperAdmin>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/superadmin')}
              className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Users - {organization?.name}
            </h1>
            <p className="text-gray-600 mt-2">
              Create and manage users for this organization
            </p>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Users ({users.length})</h2>
              <button
                onClick={() => {
                  setFormData({
                    email: '',
                    password: '',
                    firstName: '',
                    lastName: '',
                    roleId: 'admin',
                  });
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
              >
                + Add User
              </button>
            </div>

            {users.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No users found. Create one to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {u.firstName} {u.lastName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {u.roleId || 'No Role'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              u.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => handleEditUser(u)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
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
        </div>

        {/* Add User Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add New User</h2>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="technician">Technician</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    disabled={saveLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    disabled={saveLoading}
                  >
                    {saveLoading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {isEditModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Edit User</h2>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="technician">Technician</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setSelectedUser(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    disabled={saveLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    disabled={saveLoading}
                  >
                    {saveLoading ? 'Updating...' : 'Update User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
