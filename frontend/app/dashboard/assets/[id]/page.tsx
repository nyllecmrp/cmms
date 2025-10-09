'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Asset {
  id: string;
  assetNumber: string;
  name: string;
  description?: string;
  category: string;
  status: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyExpiresAt?: string;
  criticality?: string;
  location?: {
    id: string;
    name: string;
    type?: string;
  };
  createdBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  workOrders?: Array<{
    id: string;
    workOrderNumber: string;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
  childAssets?: Array<{
    id: string;
    assetNumber: string;
    name: string;
    status: string;
  }>;
}

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true);
        const userData = localStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;
        const organizationId = user?.organizationId || 'org-test-1';

        const data = await api.getAsset(params.id as string, organizationId);
        setAsset(data as Asset);
      } catch (error: any) {
        console.error('Failed to fetch asset:', error);
        setError(error.message || 'Failed to load asset');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAsset();
    }
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'down': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
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

  const getWOStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading asset details...</div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Asset</h3>
        <p className="text-red-600">{error || 'Asset not found'}</p>
        <button
          onClick={() => router.push('/dashboard/assets')}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Back to Assets
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/dashboard/assets')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{asset.name}</h1>
            <p className="text-gray-600 mt-1">Asset #{asset.assetNumber}</p>
          </div>
        </div>
        <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(asset.status)}`}>
          {asset.status}
        </span>
      </div>

      {/* Asset Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Details */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Asset Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Asset Number</label>
              <p className="font-semibold text-gray-900">{asset.assetNumber}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Category</label>
              <p className="font-semibold text-gray-900">{asset.category}</p>
            </div>
            {asset.manufacturer && (
              <div>
                <label className="text-sm text-gray-600">Manufacturer</label>
                <p className="font-semibold text-gray-900">{asset.manufacturer}</p>
              </div>
            )}
            {asset.model && (
              <div>
                <label className="text-sm text-gray-600">Model</label>
                <p className="font-semibold text-gray-900">{asset.model}</p>
              </div>
            )}
            {asset.serialNumber && (
              <div>
                <label className="text-sm text-gray-600">Serial Number</label>
                <p className="font-semibold text-gray-900">{asset.serialNumber}</p>
              </div>
            )}
            {asset.location && (
              <div>
                <label className="text-sm text-gray-600">Location</label>
                <p className="font-semibold text-gray-900">
                  {asset.location.name}
                  {asset.location.type && ` (${asset.location.type})`}
                </p>
              </div>
            )}
            {asset.criticality && (
              <div>
                <label className="text-sm text-gray-600">Criticality</label>
                <p className="font-semibold text-gray-900 capitalize">{asset.criticality}</p>
              </div>
            )}
            {asset.createdBy && (
              <div>
                <label className="text-sm text-gray-600">Created By</label>
                <p className="font-semibold text-gray-900">
                  {asset.createdBy.firstName} {asset.createdBy.lastName}
                </p>
              </div>
            )}
          </div>

          {asset.description && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="text-sm text-gray-600">Description</label>
              <p className="text-gray-900 mt-1">{asset.description}</p>
            </div>
          )}
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Total Work Orders</label>
              <p className="text-3xl font-bold text-blue-600">{asset.workOrders?.length || 0}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Open Work Orders</label>
              <p className="text-3xl font-bold text-orange-600">
                {asset.workOrders?.filter(wo => ['open', 'assigned', 'in_progress'].includes(wo.status)).length || 0}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Completed Work Orders</label>
              <p className="text-3xl font-bold text-green-600">
                {asset.workOrders?.filter(wo => wo.status === 'completed').length || 0}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push(`/dashboard/work-orders?assetId=${asset.id}`)}
            className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Work Order
          </button>
        </div>
      </div>

      {/* Work Order History */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Work Order History</h2>
        {!asset.workOrders || asset.workOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No work orders for this asset yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">WO #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {asset.workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/dashboard/work-orders?id=${wo.id}`)}>
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{wo.workOrderNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{wo.title}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(wo.priority)}`}>
                        {wo.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getWOStatusColor(wo.status)}`}>
                        {wo.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(wo.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Child Assets (if any) */}
      {asset.childAssets && asset.childAssets.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Child Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {asset.childAssets.map((child) => (
              <div 
                key={child.id} 
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition"
                onClick={() => router.push(`/dashboard/assets/${child.id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-600">{child.assetNumber}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(child.status)}`}>
                    {child.status}
                  </span>
                </div>
                <p className="text-gray-900 font-medium">{child.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

