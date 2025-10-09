import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '@/lib/api';

interface WorkOrder {
  id?: string;
  workOrderNumber: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  assetId?: string;
  dueDate?: string;
}

interface WorkOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  workOrder?: WorkOrder | null;
}

export default function WorkOrderForm({ isOpen, onClose, onSuccess, workOrder }: WorkOrderFormProps) {
  const [formData, setFormData] = useState({
    workOrderNumber: '',
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    assetId: '',
    assignedToId: '',
    dueDate: '',
  });
  const [assets, setAssets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Fetch assets and users for dropdowns
      const fetchData = async () => {
        try {
          const userData = localStorage.getItem('user');
          const user = userData ? JSON.parse(userData) : null;
          const organizationId = user?.organizationId || 'org-test-1';

          // Fetch assets
          const assetsData = await api.getAssets(organizationId);
          setAssets(assetsData as any[]);

          // Fetch users
          const usersData = await api.getUsers(organizationId);
          setUsers(usersData as any[]);

          // Auto-generate work order number for new work orders
          if (!workOrder) {
            const workOrdersData = await api.getWorkOrders(organizationId);
            const workOrders = workOrdersData as any[];
            const year = new Date().getFullYear();
            const count = workOrders.filter(wo => wo.workOrderNumber?.startsWith(`WO-${year}`)).length + 1;
            const autoNumber = `WO-${year}-${String(count).padStart(3, '0')}`;
            setFormData(prev => ({ ...prev, workOrderNumber: autoNumber }));
          }
        } catch (err) {
          console.error('Failed to fetch data:', err);
        }
      };

      fetchData();
    }

    if (workOrder) {
      setFormData({
        workOrderNumber: workOrder.workOrderNumber || '',
        title: workOrder.title || '',
        description: workOrder.description || '',
        priority: workOrder.priority || 'medium',
        status: workOrder.status || 'open',
        assetId: workOrder.assetId || '',
        assignedToId: '',
        dueDate: workOrder.dueDate ? workOrder.dueDate.split('T')[0] : '',
      });
    } else {
      setFormData({
        workOrderNumber: '',
        title: '',
        description: '',
        priority: 'medium',
        status: 'open',
        assetId: '',
        assignedToId: '',
        dueDate: '',
      });
    }
  }, [workOrder, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const organizationId = user?.organizationId || 'org-test-1';

      if (workOrder?.id) {
        // Update existing work order
        console.log('Updating work order ID:', workOrder.id);
        console.log('Update payload:', {
          organizationId,
          title: formData.title,
          description: formData.description || undefined,
          priority: formData.priority,
          status: formData.status,
          assetId: formData.assetId || undefined,
          assignedToId: formData.assignedToId || undefined,
          scheduledEnd: formData.dueDate || undefined,
        });
        
        await api.updateWorkOrder(workOrder.id, {
          organizationId,
          workOrderNumber: formData.workOrderNumber,
          title: formData.title,
          description: formData.description || undefined,
          priority: formData.priority,
          status: formData.status,
          assetId: formData.assetId || undefined,
          assignedToId: formData.assignedToId || undefined,
          scheduledEnd: formData.dueDate || undefined,
        });
        
        console.log('Update API call completed');
      } else {
        // Create new work order
        console.log('Creating new work order...');
        await api.createWorkOrder({
          organizationId,
          createdById: user?.id || '',
          workOrderNumber: formData.workOrderNumber,
          title: formData.title,
          description: formData.description || undefined,
          priority: formData.priority,
          status: formData.status,
          assetId: formData.assetId || undefined,
          assignedToId: formData.assignedToId || undefined,
          scheduledEnd: formData.dueDate || undefined,
        });
        console.log('Create API call completed');
      }

      // Reset form after successful submission
      setFormData({
        workOrderNumber: '',
        title: '',
        description: '',
        priority: 'medium',
        status: 'open',
        assetId: '',
        assignedToId: '',
        dueDate: '',
      });
      setError('');

      console.log('Calling onSuccess callback...');
      await onSuccess();
      console.log('Calling onClose...');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save work order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={workOrder ? 'Edit Work Order' : 'Create Work Order'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Work Order Number *
          </label>
          <input
            type="text"
            value={formData.workOrderNumber}
            onChange={(e) => setFormData({ ...formData, workOrderNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            placeholder="e.g., WO-2025-001"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Auto-filled, but you can edit if needed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority *
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            >
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Asset
          </label>
          <select
            value={formData.assetId}
            onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="">None</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.assetNumber} - {asset.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign To
          </label>
          <select
            value={formData.assignedToId}
            onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : workOrder ? 'Update Work Order' : 'Create Work Order'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
