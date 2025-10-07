import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FileUpload from './FileUpload';
import api from '@/lib/api';

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
    category: 'Equipment',
    location: '',
    status: 'operational',
    manufacturer: '',
    model: '',
    serialNumber: '',
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (asset) {
      setFormData({
        assetNumber: asset.assetNumber || '',
        name: asset.name || '',
        category: asset.category || 'Equipment',
        location: asset.location || '',
        status: asset.status || 'operational',
        manufacturer: asset.manufacturer || '',
        model: asset.model || '',
        serialNumber: asset.serialNumber || '',
      });
    } else {
      setFormData({
        assetNumber: '',
        name: '',
        category: 'Equipment',
        location: '',
        status: 'operational',
        manufacturer: '',
        model: '',
        serialNumber: '',
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
        await api.updateAsset(asset.id, {
          organizationId,
          ...formData,
        });
      } else {
        // Create new asset
        const { location, ...assetData } = formData;
        await api.createAsset({
          organizationId,
          createdById: user?.id || '',
          ...assetData,
          // locationId can be added later when location management is implemented
        });
      }

      // In production, upload files here after asset creation
      // const formData = new FormData();
      // uploadedFiles.forEach(file => formData.append('files', file));
      // await api.uploadAssetAttachments(assetId, formData);

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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            >
              <option value="Equipment">Equipment</option>
              <option value="Facility">Facility</option>
              <option value="Vehicle">Vehicle</option>
              <option value="IT">IT</option>
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
              <option value="operational">Operational</option>
              <option value="down">Down</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            required
          />
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
