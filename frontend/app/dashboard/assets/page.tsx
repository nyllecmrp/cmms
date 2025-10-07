'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import AssetForm from '@/components/AssetForm';

interface Asset {
  id: string;
  assetTag: string;
  name: string;
  category: string;
  status: string;
  location?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get organization ID from localStorage
        const userData = localStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;
        const organizationId = user?.organizationId || 'org-test-1';

        // Fetch real data from backend API
        const data = await api.getAssets(organizationId);
        setAssets(data as Asset[]);
        setLoading(false);
      } catch (error: any) {
        console.error('Failed to fetch assets:', error);
        setError(error.message || 'Failed to load assets');
        setLoading(false);
        // Show fallback mock data
        setAssets([
          {
            id: '1',
            assetTag: 'PUMP-001',
            name: 'Hydraulic Pump Unit A',
            category: 'Equipment',
            status: 'operational',
            location: 'Production Line 1',
          },
          {
            id: '2',
            assetTag: 'MED-CT-001',
            name: 'CT Scanner - Radiology',
            category: 'Equipment',
            status: 'operational',
            location: 'Radiology Department',
          },
        ]);
      }
    };

    fetchAssets();
  }, []);

  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.assetTag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'down': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddAsset = () => {
    setSelectedAsset(null);
    setIsFormOpen(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsFormOpen(true);
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) {
      return;
    }

    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const organizationId = user?.organizationId || 'org-test-1';

      await api.deleteAsset(assetId, organizationId);

      // Refresh asset list
      const data = await api.getAssets(organizationId);
      setAssets(data as Asset[]);
    } catch (error: any) {
      alert(`Failed to delete asset: ${error.message}`);
    }
  };

  const handleFormSuccess = async () => {
    // Refresh asset list
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    const organizationId = user?.organizationId || 'org-test-1';

    const data = await api.getAssets(organizationId);
    setAssets(data as Asset[]);
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
          <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
          <p className="text-gray-600 mt-1">Manage your equipment and facilities</p>
        </div>
        <button
          onClick={handleAddAsset}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          + Add New Asset
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900">
            <option>All Categories</option>
            <option>Equipment</option>
            <option>Facility</option>
            <option>Vehicle</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900">
            <option>All Status</option>
            <option>Operational</option>
            <option>Down</option>
            <option>Maintenance</option>
          </select>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading assets...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No assets found</h3>
            <p className="text-gray-600 mb-4">Start by adding your first asset to the system.</p>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              + Add Your First Asset
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-blue-600">{asset.assetTag}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{asset.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{asset.location || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEditAsset(asset)}
                        className="text-gray-600 hover:text-gray-800 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
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

      {/* Stats Footer */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Assets</div>
          <div className="text-2xl font-bold text-gray-900">{assets.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Operational</div>
          <div className="text-2xl font-bold text-green-600">
            {assets.filter(a => a.status === 'operational').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Under Maintenance</div>
          <div className="text-2xl font-bold text-yellow-600">
            {assets.filter(a => a.status === 'maintenance').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Down</div>
          <div className="text-2xl font-bold text-red-600">
            {assets.filter(a => a.status === 'down').length}
          </div>
        </div>
      </div>

      <AssetForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        asset={selectedAsset}
      />
    </div>
  );
}
