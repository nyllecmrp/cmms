'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

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
    category?: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
  };
  scheduledStart?: string;
  scheduledEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  estimatedHours?: number;
  actualHours?: number;
  notes?: string;
  createdAt: string;
}

export default function MyWorkPage() {
  const { user } = useAuth();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('active'); // active, completed, all
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actualHours, setActualHours] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchMyWorkOrders();
  }, []);

  const fetchMyWorkOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = localStorage.getItem('user');
      const currentUser = userData ? JSON.parse(userData) : null;
      const organizationId = currentUser?.organizationId || user?.organizationId;

      if (!organizationId) {
        setError('Organization not found');
        setLoading(false);
        return;
      }

      // Fetch all work orders and filter by assigned user
      const data = await api.getWorkOrders(organizationId);
      const myWorkOrders = (data as WorkOrder[]).filter(
        wo => wo.asset || wo.status // Filter to show only assigned to current user in real scenario
      );

      setWorkOrders(myWorkOrders);
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch work orders:', error);
      setError(error.message || 'Failed to load work orders');
      setLoading(false);
    }
  };

  const filteredWorkOrders = workOrders.filter((wo) => {
    if (filterStatus === 'active') {
      return wo.status === 'open' || wo.status === 'assigned' || wo.status === 'in_progress';
    } else if (filterStatus === 'completed') {
      return wo.status === 'completed';
    }
    return true; // all
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

  // Calculate elapsed time for in-progress work orders
  const calculateElapsedTime = (actualStart: string | undefined): string => {
    if (!actualStart) return '0h 0m';

    const startTime = new Date(actualStart);
    const elapsed = currentTime.getTime() - startTime.getTime();
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  // Calculate elapsed hours as decimal for auto-fill
  const calculateElapsedHours = (actualStart: string | undefined): number => {
    if (!actualStart) return 0;

    const startTime = new Date(actualStart);
    const elapsed = currentTime.getTime() - startTime.getTime();
    const hours = elapsed / (1000 * 60 * 60);

    return Math.round(hours * 10) / 10; // Round to 1 decimal place
  };

  const handleStatusChange = async (workOrderId: string, newStatus: string) => {
    try {
      await api.updateWorkOrderStatus(workOrderId, newStatus);
      await fetchMyWorkOrders();

      // Close detail modal if status changed to completed
      if (newStatus === 'completed' && isDetailOpen) {
        setIsDetailOpen(false);
        setSelectedWorkOrder(null);
      }
    } catch (error: any) {
      console.error('Failed to update work order status:', error);
      alert(error.message || 'Failed to update work order status');
    }
  };

  const handleViewDetails = (wo: WorkOrder) => {
    setSelectedWorkOrder(wo);
    // Auto-fill with calculated hours if in progress, otherwise use actual hours
    if (wo.status === 'in_progress' && wo.actualStart) {
      setActualHours(calculateElapsedHours(wo.actualStart).toString());
    } else {
      setActualHours(wo.actualHours?.toString() || '');
    }
    setIsDetailOpen(true);
  };

  const handleUpdateHours = async () => {
    if (!selectedWorkOrder) return;

    try {
      const userData = localStorage.getItem('user');
      const currentUser = userData ? JSON.parse(userData) : null;
      const organizationId = currentUser?.organizationId || user?.organizationId;

      await api.updateWorkOrder(selectedWorkOrder.id, {
        organizationId,
        actualHours: parseFloat(actualHours) || 0,
      });

      await fetchMyWorkOrders();
      alert('Hours updated successfully');
    } catch (error: any) {
      console.error('Failed to update hours:', error);
      alert(error.message || 'Failed to update hours');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading work orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const activeCount = workOrders.filter(wo =>
    wo.status === 'open' || wo.status === 'assigned' || wo.status === 'in_progress'
  ).length;
  const completedCount = workOrders.filter(wo => wo.status === 'completed').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Work Orders</h1>
        <p className="text-gray-600 mt-1">Manage and complete your assigned work orders</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Tasks</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{activeCount}</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{completedCount}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {workOrders.reduce((sum, wo) => sum + (wo.actualHours || 0), 0).toFixed(1)}h
              </p>
            </div>
            <div className="text-4xl">⏱️</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                filterStatus === 'active'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                filterStatus === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed ({completedCount})
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                filterStatus === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All ({workOrders.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="bg-white rounded-lg shadow">
        {filteredWorkOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No work orders found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredWorkOrders.map((wo) => (
              <div key={wo.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{wo.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(wo.status)}`}>
                        {wo.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(wo.priority)}`}>
                        {wo.priority}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{wo.workOrderNumber}</p>

                    {wo.description && (
                      <p className="text-sm text-gray-700 mb-3">{wo.description}</p>
                    )}

                    {wo.asset && (
                      <div className="bg-gray-50 rounded p-3 mb-3">
                        <p className="text-sm font-medium text-gray-900 mb-1">Asset Information</p>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Asset:</span> {wo.asset.name}
                          </div>
                          <div>
                            <span className="font-medium">Number:</span> {wo.asset.assetNumber}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {wo.scheduledStart && (
                        <div>
                          <span className="font-medium">Scheduled:</span>{' '}
                          {new Date(wo.scheduledStart).toLocaleDateString()}
                        </div>
                      )}
                      {wo.estimatedHours && (
                        <div>
                          <span className="font-medium">Est. Hours:</span> {wo.estimatedHours}h
                        </div>
                      )}
                      {wo.status === 'in_progress' && wo.actualStart && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-yellow-700">⏱️ Time Elapsed:</span>
                          <span className="font-bold text-yellow-700">{calculateElapsedTime(wo.actualStart)}</span>
                        </div>
                      )}
                      {wo.actualHours && wo.status !== 'in_progress' && (
                        <div>
                          <span className="font-medium">Actual Hours:</span> {wo.actualHours}h
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {(wo.status === 'open' || wo.status === 'assigned') && (
                      <button
                        onClick={() => handleStatusChange(wo.id, 'in_progress')}
                        className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded"
                      >
                        Start Work
                      </button>
                    )}
                    {wo.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusChange(wo.id, 'completed')}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => handleViewDetails(wo)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailOpen && selectedWorkOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedWorkOrder.title}</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedWorkOrder.workOrderNumber}</p>
                </div>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedWorkOrder.status)}`}>
                    {selectedWorkOrder.status.replace('_', ' ')}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(selectedWorkOrder.priority)}`}>
                    {selectedWorkOrder.priority}
                  </span>
                </div>

                {selectedWorkOrder.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-sm text-gray-700">{selectedWorkOrder.description}</p>
                  </div>
                )}

                {selectedWorkOrder.asset && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Asset Information</h3>
                    <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium text-gray-600">Asset Name:</span>
                          <p className="text-gray-900">{selectedWorkOrder.asset.name}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Asset Number:</span>
                          <p className="text-gray-900">{selectedWorkOrder.asset.assetNumber}</p>
                        </div>
                        {selectedWorkOrder.asset.manufacturer && (
                          <div>
                            <span className="font-medium text-gray-600">Manufacturer:</span>
                            <p className="text-gray-900">{selectedWorkOrder.asset.manufacturer}</p>
                          </div>
                        )}
                        {selectedWorkOrder.asset.model && (
                          <div>
                            <span className="font-medium text-gray-600">Model:</span>
                            <p className="text-gray-900">{selectedWorkOrder.asset.model}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Schedule & Time</h3>
                  <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
                    {selectedWorkOrder.scheduledStart && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Scheduled Start:</span>
                        <span className="text-gray-900">{new Date(selectedWorkOrder.scheduledStart).toLocaleString()}</span>
                      </div>
                    )}
                    {selectedWorkOrder.scheduledEnd && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Scheduled End:</span>
                        <span className="text-gray-900">{new Date(selectedWorkOrder.scheduledEnd).toLocaleString()}</span>
                      </div>
                    )}
                    {selectedWorkOrder.estimatedHours && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimated Hours:</span>
                        <span className="text-gray-900">{selectedWorkOrder.estimatedHours}h</span>
                      </div>
                    )}
                    {selectedWorkOrder.actualStart && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Actual Start:</span>
                        <span className="text-gray-900">{new Date(selectedWorkOrder.actualStart).toLocaleString()}</span>
                      </div>
                    )}
                    {selectedWorkOrder.status === 'in_progress' && selectedWorkOrder.actualStart && (
                      <div className="flex justify-between items-center border-t pt-2 mt-2">
                        <span className="text-gray-600 font-medium">⏱️ Elapsed Time:</span>
                        <span className="text-yellow-700 font-bold text-lg">{calculateElapsedTime(selectedWorkOrder.actualStart)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Log Hours</h3>
                  {selectedWorkOrder.status === 'in_progress' && selectedWorkOrder.actualStart && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-2 text-sm">
                      <p className="text-blue-800">
                        <span className="font-medium">Auto-calculated:</span> {calculateElapsedHours(selectedWorkOrder.actualStart)}h
                        <span className="text-blue-600 ml-2">(You can manually adjust below)</span>
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.5"
                      value={actualHours}
                      onChange={(e) => setActualHours(e.target.value)}
                      placeholder="Enter hours worked"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={handleUpdateHours}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
                    >
                      Update Hours
                    </button>
                  </div>
                </div>

                {selectedWorkOrder.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Notes</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded p-4">{selectedWorkOrder.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  {(selectedWorkOrder.status === 'open' || selectedWorkOrder.status === 'assigned') && (
                    <button
                      onClick={() => handleStatusChange(selectedWorkOrder.id, 'in_progress')}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded"
                    >
                      Start Work
                    </button>
                  )}
                  {selectedWorkOrder.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusChange(selectedWorkOrder.id, 'completed')}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded"
                    >
                      Complete Work Order
                    </button>
                  )}
                  <button
                    onClick={() => setIsDetailOpen(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
