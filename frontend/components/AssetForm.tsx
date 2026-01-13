import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FileUpload from './FileUpload';
import api from '@/lib/api';
import { useEscapeKey } from '@/hooks/useEscapeKey';

interface Asset {
  id?: string;
  assetNumber: string;
  name: string;
  category: string;
  location?: string;
  status: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  attachments?: string[];
}

interface AssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  asset?: Asset | null;
}

export default function AssetForm({ isOpen, onClose, onSuccess, asset }: AssetFormProps) {
  const [formData, setFormData] = useState({
    assetNumber: '',
    name: '',
    status: 'operational',
    manufacturer: '',
    model: '',
    serialNumber: '',
    locationId: '',
    parentAssetId: '',
  });
  const [locations, setLocations] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ESC key to close form
  useEscapeKey(onClose, isOpen);

  useEffect(() => {
    if (isOpen) {
      // Fetch locations and assets for dropdowns
      const fetchData = async () => {
        try {
          const userData = localStorage.getItem('user');
          const user = userData ? JSON.parse(userData) : null;
          const organizationId = user?.organizationId || 'org-test-1';

          // Fetch locations
          const locationsData = await api.getLocations(organizationId);
          setLocations(locationsData as any[]);

          // Fetch assets for parent asset dropdown
          const assetsData = await api.getAssets(organizationId);
          setAssets(assetsData as any[]);
        } catch (err) {
          console.error('Failed to fetch data:', err);
        }
      };

      fetchData();
    }

    if (asset) {
      setFormData({
        assetNumber: asset.assetNumber || '',
        name: asset.name || '',
        status: asset.status || 'operational',
        manufacturer: asset.manufacturer || '',
        model: asset.model || '',
        serialNumber: asset.serialNumber || '',
        locationId: '',
        parentAssetId: '',
      });
    } else {
      setFormData({
        assetNumber: '',
        name: '',
        category: 'Equipment',
        status: 'operational',
        manufacturer: '',
        model: '',
        serialNumber: '',
        locationId: '',
        parentAssetId: '',
      });
    }
    setUploadedFiles([]);
  }, [asset, isOpen]);

  const handleFileSelect = (files: File[]) => {
    setUploadedFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const organizationId = user?.organizationId || 'org-test-1';

      // Note: In production, you would upload files to a storage service (S3, Azure Blob, etc.)
      // and store the URLs in the database. For now, we'll simulate this.
      const attachmentUrls = uploadedFiles.map(file => `/uploads/${file.name}`);

      if (asset?.id) {
        // Update existing asset
        const updatePayload = {
          organizationId,
          assetNumber: formData.assetNumber,
          name: formData.name,
          category: 'Equipment', // Fixed category for machines
          status: formData.status,
          manufacturer: formData.manufacturer || undefined,
          model: formData.model || undefined,
          serialNumber: formData.serialNumber || undefined,
          locationId: formData.locationId || undefined,
          parentAssetId: formData.parentAssetId || undefined,
        };
        await api.updateAsset(asset.id, updatePayload);
      } else {
        // Create new asset
        await api.createAsset({
          organizationId,
          createdById: user?.id || '',
          ...formData,
          category: 'Equipment', // Fixed category for machines
          locationId: formData.locationId || undefined,
          parentAssetId: formData.parentAssetId || undefined,
        } as any);
      }

      // In production, upload files here after asset creation
      // const formData = new FormData();
      // uploadedFiles.forEach(file => formData.append('files', file));
      // await api.uploadAssetAttachments(assetId, formData);

      // Reset form after successful submission
      setFormData({
        assetNumber: '',
        name: '',
        status: 'operational',
        manufacturer: '',
        model: '',
        serialNumber: '',
        locationId: '',
        parentAssetId: '',
      });
      setUploadedFiles([]);
      setError('');

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={asset ? 'Edit Asset' : 'Add New Asset'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Asset Number *
          </label>
          <input
            type="text"
            value={formData.assetNumber}
            onChange={(e) => setFormData({ ...formData, assetNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Asset Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            required
          />
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
            <option value="operational">Operational</option>
            <option value="down">Down</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <select
              value={formData.locationId}
              onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="">No Location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} {location.type && `(${location.type})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Asset
            </label>
            <select
              value={formData.parentAssetId}
              onChange={(e) => setFormData({ ...formData, parentAssetId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="">None (Top Level)</option>
              {assets.filter(a => a.id !== asset?.id).map((assetItem) => (
                <option key={assetItem.id} value={assetItem.id}>
                  {assetItem.assetNumber} - {assetItem.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Manufacturer
          </label>
          <input
            type="text"
            value={formData.manufacturer}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Serial Number
            </label>
            <input
              type="text"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachments (Images, Documents)
          </label>
          <FileUpload
            onFileSelect={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx"
            multiple={true}
            maxSize={5}
            maxFiles={10}
          />
        </div>

        {asset?.id && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>💡 Tip:</strong> To manage parts for this asset, save the form and click the <strong>"🔧 Parts"</strong> button on the assets list.
            </p>
            <p className="text-xs text-gray-600">
              The new parts system allows you to link inventory items, track stock levels, and manage hundreds of parts efficiently.
            </p>
          </div>
        )}

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
            {loading ? 'Saving...' : asset ? 'Update Asset' : 'Create Asset'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
