'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { getRoleDisplayName, getRoleColor, canPerformAction } from '@/lib/rolePermissions';
import RoleGuard from '@/components/RoleGuard';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId?: string;
  role?: string;
  status: string;
  createdAt: string;
}

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [inviteData, setInviteData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'technician',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.organizationId) return;

      try {
        const data = await api.getUsers(user.organizationId);
        setUsers(data as any[]);
      } catch (err: any) {
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.inviteUser({
        email: inviteData.email,
        firstName: inviteData.firstName,
        lastName: inviteData.lastName,
        roleId: inviteData.role,
        organizationId: user?.organizationId || '',
      });

      // Refresh users list
      if (user?.organizationId) {
        const data = await api.getUsers(user.organizationId);
        setUsers(data as any[]);
      }

      setIsInviteModalOpen(false);
      setInviteData({ email: '', firstName: '', lastName: '', role: 'technician' });
    } catch (err: any) {
      setError(err.message || 'Failed to invite user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user?')) return;

    try {
      await api.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const getRoleDescription = (role: string) => {
    const descriptions: Record<string, string> = {
      admin: 'Full access to all modules and settings. Can manage users and organization.',
      manager: 'Access to work orders, assets, inventory, reports, and team management.',
      technician: 'Access to work orders, assets, and field operations tools.',
      viewer: 'Read-only access to reports, assets, and work orders.',
    };
    return descriptions[role.toLowerCase()] || 'Basic user access';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canCreate = canPerformAction(user?.roleId || null, 'create');
  const canEdit = canPerformAction(user?.roleId || null, 'edit');
  const canDelete = canPerformAction(user?.roleId || null, 'delete');

  return (
    <RoleGuard requiredModule="users">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage team members and their permissions</p>
          </div>
          {canCreate && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              + Invite User
            </button>
          )}
        </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.status === 'Active').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Pending Invites</div>
          <div className="text-2xl font-bold text-yellow-600">
            {users.filter(u => u.status === 'Pending').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Admins</div>
          <div className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.role === 'Admin').length}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
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
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold mr-3">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {u.firstName} {u.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{u.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(u.role || null)}`}>
                        {u.role || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(u.status)}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {canEdit && (
                        <button className="text-blue-600 hover:text-blue-800 mr-3">
                          Edit
                        </button>
                      )}
                      {canDelete && u.id !== user?.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                      {!canEdit && !canDelete && (
                        <span className="text-gray-400 text-xs">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite User Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setIsInviteModalOpen(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleInviteUser}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Invite New User</h3>
                    <button
                      type="button"
                      onClick={() => setIsInviteModalOpen(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <span className="text-2xl">&times;</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={inviteData.email}
                        onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        required
                        placeholder="user@example.com"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={inviteData.firstName}
                          onChange={(e) => setInviteData({ ...inviteData, firstName: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={inviteData.lastName}
                          onChange={(e) => setInviteData({ ...inviteData, lastName: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role *
                      </label>
                      <select
                        value={inviteData.role}
                        onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                        required
                      >
                        <option value="technician">Technician</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {getRoleDescription(inviteData.role)}
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        An invitation email will be sent to {inviteData.email || 'the user'} with instructions to set up their account.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                  >
                    {loading ? 'Sending...' : 'Send Invite'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition mt-3 sm:mt-0"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </RoleGuard>
  );
}
