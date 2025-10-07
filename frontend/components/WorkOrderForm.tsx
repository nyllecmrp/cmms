import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '@/lib/api';

interface WorkOrder {
  id?: string;
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
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    assetId: '',
    dueDate: '',
  });
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Fetch assets for dropdown
      const fetchAssets = async () => {
        try {
          const userData = localStorage.getItem('user');
          const user = userData ? JSON.parse(userData) : null;
          const organizationId = user?.organizationId || 'org-test-1';

          const data = await api.getAssets(organizationId);
          setAssets(data as any[]);
        } catch (err) {
          console.error('Failed to fetch assets:', err);
        }
      };

      fetchAssets();
    }

    if (workOrder) {
      setFormData({
        title: workOrder.title || '',
        description: workOrder.description || '',
        priority: workOrder.priority || 'medium',
        status: workOrder.status || 'open',
        assetId: workOrder.assetId || '',
        dueDate: workOrder.dueDate ? workOrder.dueDate.split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'open',
        assetId: '',
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

      const payload = {
        organizationId,
        ...formData,
        assetId: formData.assetId || undefined,
        dueDate: formData.dueDate || undefined,
      };

      if (workOrder?.id) {
        // Update existing work order
        await api.updateWorkOrder(workOrder.id, payload);
      } else {
        // Create new work order
        await api.createWorkOrder(payload);
      }

      onSuccess();
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
                {asset.assetTag} - {asset.name}
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
