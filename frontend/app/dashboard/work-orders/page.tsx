'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import WorkOrderForm from '@/components/WorkOrderForm';

interface WorkOrder {
  id: string;
  workOrderNumber: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  asset?: {
    id: string;
    name: string;
    assetNumber: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  dueDate?: string;
  createdAt: string;
  assetId?: string;
}

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get organization ID from localStorage
        const userData = localStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;
        const organizationId = user?.organizationId || 'org-test-1';

        // Fetch real data from backend API
        const data = await api.getWorkOrders(organizationId);
        setWorkOrders(data as WorkOrder[]);
        setLoading(false);
      } catch (error: any) {
        console.error('Failed to fetch work orders:', error);
        setError(error.message || 'Failed to load work orders');
        setLoading(false);
        // Show fallback mock data
        setWorkOrders([
          {
            id: '1',
            workOrderNumber: 'WO-2025-001',
            title: 'Monthly PM - Hydraulic Pump',
            priority: 'medium',
            status: 'open',
            createdAt: '2025-10-01',
            dueDate: '2025-10-05',
          },
          {
            id: '2',
            workOrderNumber: 'WO-2025-002',
            title: 'CT Scanner Calibration',
            priority: 'high',
            status: 'open',
            createdAt: '2025-10-01',
            dueDate: '2025-10-10',
          },
        ]);
      }
    };

    fetchWorkOrders();
  }, []);

  const filteredWorkOrders = workOrders.filter((wo) => {
    const matchesSearch = wo.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || wo.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'preventive': return '🔄';
      case 'corrective': return '🔧';
      case 'inspection': return '🔍';
      case 'project': return '📁';
      default: return '📋';
    }
  };

  const handleAddWorkOrder = () => {
    setSelectedWorkOrder(null);
    setIsFormOpen(true);
  };

  const handleEditWorkOrder = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setIsFormOpen(true);
  };

  const handleDeleteWorkOrder = async (workOrderId: string) => {
    if (!confirm('Are you sure you want to delete this work order?')) {
      return;
    }

    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const organizationId = user?.organizationId || 'org-test-1';

      await api.deleteWorkOrder(workOrderId, organizationId);

      // Refresh work order list
      const data = await api.getWorkOrders(organizationId);
      setWorkOrders(data as WorkOrder[]);
    } catch (error: any) {
      alert(`Failed to delete work order: ${error.message}`);
    }
  };

  const handleFormSuccess = async () => {
    // Refresh work order list
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    const organizationId = user?.organizationId || 'org-test-1';

    const data = await api.getWorkOrders(organizationId);
    setWorkOrders(data as WorkOrder[]);
  };

  return (
    <div>
      {error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            ⚠️ {error} - Showing cached data. Backend may not be connected.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Work Orders</h1>
          <p className="text-gray-600 mt-1">Manage maintenance tasks and assignments</p>
        </div>
        <button
          onClick={handleAddWorkOrder}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          + Create Work Order
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600">Open</div>
          <div className="text-2xl font-bold text-gray-900">
            {workOrders.filter(wo => wo.status === 'open').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="text-sm text-gray-600">Assigned</div>
          <div className="text-2xl font-bold text-gray-900">
            {workOrders.filter(wo => wo.status === 'assigned').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="text-sm text-gray-600">In Progress</div>
          <div className="text-2xl font-bold text-gray-900">
            {workOrders.filter(wo => wo.status === 'in_progress').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-gray-900">
            {workOrders.filter(wo => wo.status === 'completed').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
          <div className="text-sm text-gray-600">On Hold</div>
          <div className="text-2xl font-bold text-gray-900">
            {workOrders.filter(wo => wo.status === 'on_hold').length}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search work orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900">
            <option>All Types</option>
            <option>Preventive</option>
            <option>Corrective</option>
            <option>Inspection</option>
          </select>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading work orders...</div>
        ) : filteredWorkOrders.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No work orders found</h3>
            <p className="text-gray-600 mb-4">Create your first work order to get started.</p>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Create Work Order
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WO #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWorkOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-blue-600">{wo.id.substring(0, 8).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{wo.title}</div>
                      {wo.description && (
                        <div className="text-xs text-gray-500 mt-1">{wo.description.substring(0, 50)}...</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">-</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{wo.asset?.assetNumber || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(wo.priority)}`}>
                        {wo.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(wo.status)}`}>
                        {wo.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{wo.assignedTo?.name || 'Unassigned'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEditWorkOrder(wo)}
                        className="text-gray-600 hover:text-gray-800 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteWorkOrder(wo.id)}
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

      <WorkOrderForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        workOrder={selectedWorkOrder}
      />
    </div>
  );
}
