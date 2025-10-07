'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface ModuleRequest {
  id: string;
  organizationId: string;
  organization: {
    name: string;
    tier: string;
  };
  requestedBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  moduleCode: string;
  requestType: string;
  justification: string | null;
  expectedUsage: string | null;
  status: string;
  createdAt: string;
}

export default function ModuleRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ModuleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ModuleRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if user is superadmin
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;

    if (!user || !user.isSuperAdmin) {
      router.push('/login');
      return;
    }

    fetchPendingRequests();
  }, [router]);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getPendingModuleRequests();
      setRequests(data as ModuleRequest[]);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId: string, status: 'approved' | 'rejected') => {
    setSubmitting(true);
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      if (!user) {
        router.push('/login');
        return;
      }

      await api.reviewModuleRequest(requestId, {
        reviewedById: user.id,
        status,
        reviewNotes: reviewNotes || undefined,
      });

      // If approved, activate the module
      if (status === 'approved' && selectedRequest) {
        const expiresAt = selectedRequest.requestType === 'trial'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
          : undefined;

        await api.activateModule({
          organizationId: selectedRequest.organizationId,
          moduleCode: selectedRequest.moduleCode,
          activatedById: user.id,
          expiresAt,
        });
      }

      alert(`Request ${status} successfully!`);
      setSelectedRequest(null);
      setReviewNotes('');
      fetchPendingRequests();
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';

      // Handle dependency errors more gracefully
      if (errorMessage.includes('requires') && errorMessage.includes('to be activated first')) {
        alert(`❌ Cannot activate module:\n\n${errorMessage}\n\nPlease activate the required dependencies first from the organization's module management page.`);
      } else {
        alert(`Failed to ${status === 'approved' ? 'approve' : 'reject'} request: ${errorMessage}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const moduleNames: Record<string, string> = {
    preventive_maintenance: 'Preventive Maintenance',
    inventory_management: 'Inventory Management',
    predictive_maintenance: 'Predictive Maintenance',
    calibration_management: 'Calibration Management',
    mobile_cmms: 'Mobile CMMS',
    reports_analytics: 'Reports & Analytics',
    enterprise_api: 'Enterprise API',
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Module Requests</h1>
            <p className="text-gray-600">Review and approve module activation requests from organizations</p>
          </div>
          <button
            onClick={() => router.push('/superadmin')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Pending Requests</h3>
              <span className="text-2xl">⏳</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Trial Requests</h3>
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {requests.filter(r => r.requestType === 'trial').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Purchase Requests</h3>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {requests.filter(r => r.requestType === 'purchase').length}
            </p>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending Requests</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Loading requests...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No pending requests
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.organization.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{request.organization.tier} Tier</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {moduleNames[request.moduleCode] || request.moduleCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          request.requestType === 'trial'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {request.requestType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.requestedBy.firstName} {request.requestedBy.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{request.requestedBy.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                onClick={() => setSelectedRequest(null)}
              ></div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Review Module Request</h3>
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <span className="text-2xl">&times;</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Organization</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRequest.organization.name}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Module</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {moduleNames[selectedRequest.moduleCode] || selectedRequest.moduleCode}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Request Type</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{selectedRequest.requestType}</p>
                    </div>

                    {selectedRequest.justification && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Justification</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedRequest.justification}</p>
                      </div>
                    )}

                    {selectedRequest.expectedUsage && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Expected Usage</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedRequest.expectedUsage}</p>
                      </div>
                    )}

                    <div>
                      <label htmlFor="reviewNotes" className="block text-sm font-medium text-gray-700 mb-2">
                        Review Notes (Optional)
                      </label>
                      <textarea
                        id="reviewNotes"
                        rows={3}
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Add notes about your decision..."
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => handleReview(selectedRequest.id, 'rejected')}
                      disabled={submitting}
                      className="flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      onClick={() => handleReview(selectedRequest.id, 'approved')}
                      disabled={submitting}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Processing...' : 'Approve & Activate'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
