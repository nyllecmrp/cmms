'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface WorkRequest {
  id: string;
  requestNumber: string;
  title: string;
  description: string;
  requestedBy: string;
  department: string;
  assetId?: string;
  assetName?: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'repair' | 'maintenance' | 'inspection' | 'installation' | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'converted' | 'cancelled';
  requestDate: string;
  reviewedBy?: string;
  reviewDate?: string;
  workOrderId?: string;
  estimatedCost?: number;
  attachments?: string[];
}

export default function WorkRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<WorkRequest[]>([
    {
      id: '1',
      requestNumber: 'WR-2025-001',
      title: 'Fix Leaking Pipe in Warehouse',
      description: 'Water leak detected in warehouse section B, near loading dock',
      requestedBy: 'John Smith',
      department: 'Operations',
      location: 'Warehouse B - Loading Dock',
      priority: 'high',
      category: 'repair',
      status: 'approved',
      requestDate: '2025-10-01',
      reviewedBy: 'Maintenance Supervisor',
      reviewDate: '2025-10-02',
      estimatedCost: 5000,
    },
    {
      id: '2',
      requestNumber: 'WR-2025-002',
      title: 'Install New HVAC Unit',
      description: 'Request to install additional HVAC unit in office floor 3',
      requestedBy: 'Jane Doe',
      department: 'Facilities',
      location: 'Office Building - Floor 3',
      priority: 'medium',
      category: 'installation',
      status: 'pending',
      requestDate: '2025-10-03',
      estimatedCost: 45000,
    },
    {
      id: '3',
      requestNumber: 'WR-2025-003',
      title: 'Preventive Maintenance for Generator',
      description: 'Quarterly PM service for backup generator',
      requestedBy: 'Mike Johnson',
      department: 'Engineering',
      assetId: 'GEN-001',
      assetName: 'Emergency Generator',
      location: 'Generator Room',
      priority: 'medium',
      category: 'maintenance',
      status: 'converted',
      requestDate: '2025-09-28',
      reviewedBy: 'Maintenance Manager',
      reviewDate: '2025-09-29',
      workOrderId: 'WO-2025-145',
      estimatedCost: 8000,
    },
    {
      id: '4',
      requestNumber: 'WR-2025-004',
      title: 'Replace Broken Window',
      description: 'Window cracked in conference room, needs replacement',
      requestedBy: 'Sarah Williams',
      department: 'Administration',
      location: 'Conference Room A',
      priority: 'low',
      category: 'repair',
      status: 'rejected',
      requestDate: '2025-10-02',
      reviewedBy: 'Facilities Manager',
      reviewDate: '2025-10-03',
    },
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WorkRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    location: '',
    assetId: '',
    priority: 'medium' as const,
    category: 'repair' as const,
    estimatedCost: 0,
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'converted': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'repair': return '🔧';
      case 'maintenance': return '🔄';
      case 'inspection': return '🔍';
      case 'installation': return '🏗️';
      case 'other': return '📋';
      default: return '📋';
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || req.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    converted: requests.filter(r => r.status === 'converted').length,
  };

  const handleCreateRequest = () => {
    if (!formData.title || !formData.description || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    const newRequest: WorkRequest = {
      id: String(requests.length + 1),
      requestNumber: `WR-2025-${String(requests.length + 1).padStart(3, '0')}`,
      ...formData,
      requestedBy: user?.name || user?.email || 'Unknown User',
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
    };

    setRequests([newRequest, ...requests]);
    setIsCreateModalOpen(false);
    setFormData({
      title: '',
      description: '',
      department: '',
      location: '',
      assetId: '',
      priority: 'medium',
      category: 'repair',
      estimatedCost: 0,
    });
  };

  const handleApprove = (requestId: string) => {
    setRequests(requests.map(req =>
      req.id === requestId
        ? {
            ...req,
            status: 'approved' as const,
            reviewedBy: user?.name || 'Manager',
            reviewDate: new Date().toISOString().split('T')[0]
          }
        : req
    ));
  };

  const handleReject = (requestId: string) => {
    setRequests(requests.map(req =>
      req.id === requestId
        ? {
            ...req,
            status: 'rejected' as const,
            reviewedBy: user?.name || 'Manager',
            reviewDate: new Date().toISOString().split('T')[0]
          }
        : req
    ));
  };

  const handleConvertToWorkOrder = (requestId: string) => {
    const woNumber = `WO-2025-${String(Math.floor(Math.random() * 900) + 100)}`;
    setRequests(requests.map(req =>
      req.id === requestId
        ? {
            ...req,
            status: 'converted' as const,
            workOrderId: woNumber,
            reviewedBy: user?.name || 'Manager',
            reviewDate: new Date().toISOString().split('T')[0]
          }
        : req
    ));
    alert(`Work Request converted to Work Order: ${woNumber}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Work Request Management</h1>
        <p className="text-gray-600 mt-1">Submit and manage maintenance work requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="text-4xl">📝</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Converted to WO</p>
              <p className="text-3xl font-bold text-gray-900">{stats.converted}</p>
            </div>
            <div className="text-4xl">🔄</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="converted">Converted</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            ➕ New Request
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{request.title}</div>
                    <div className="text-xs text-gray-500">{request.requestNumber}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">{getCategoryIcon(request.category)}</span>
                    <span className="text-sm text-gray-600 capitalize">{request.category}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{request.location}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">{request.requestedBy}</div>
                    <div className="text-xs text-gray-500">{request.department}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{request.requestDate}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="text-green-600 hover:text-green-800 mr-3"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {request.status === 'approved' && (
                    <button
                      onClick={() => handleConvertToWorkOrder(request.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Convert to WO
                    </button>
                  )}
                  {request.status === 'converted' && (
                    <button className="text-gray-600 hover:text-gray-800">
                      View WO
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Request Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Submit Work Request</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Request Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Brief description of the request"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  rows={4}
                  placeholder="Provide detailed information about the request"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="repair">Repair</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inspection">Inspection</option>
                    <option value="installation">Installation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Your department"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Where is the issue located?"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset ID (if applicable)</label>
                  <input
                    type="text"
                    value={formData.assetId}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="e.g., PUMP-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (₱)</label>
                  <input
                    type="number"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRequest}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
