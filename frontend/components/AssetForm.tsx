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
  const [maintenanceParts, setMaintenanceParts] = useState<Array<{name: string, quantity: string, estimatedCost: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        category: asset.category || 'Equipment',
        status: asset.status || 'operational',
        manufacturer: asset.manufacturer || '',
        model: asset.model || '',
        serialNumber: asset.serialNumber || '',
        locationId: '',
        parentAssetId: '',
      });

      // Parse maintenanceParts from JSON if available
      if ((asset as any).maintenanceParts) {
        try {
          const parsedParts = JSON.parse((asset as any).maintenanceParts);
          setMaintenanceParts(parsedParts.map((p: any) => ({
            name: p.name || '',
            quantity: String(p.quantity || ''),
            estimatedCost: String(p.estimatedCost || ''),
          })));
        } catch (e) {
          console.error('Failed to parse maintenanceParts:', e);
          setMaintenanceParts([]);
        }
      } else {
        setMaintenanceParts([]);
      }
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
      setMaintenanceParts([]);
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

      // Convert parts array to JSON if there are parts with filled data
      const validParts = maintenanceParts.filter(p => p.name.trim() && p.quantity && p.estimatedCost);
      const partsJson = validParts.length > 0
        ? JSON.stringify(validParts.map(p => ({
            name: p.name.trim(),
            quantity: parseInt(p.quantity),
            estimatedCost: parseFloat(p.estimatedCost)
          })))
        : undefined;

      console.log('🔧 Maintenance Parts Debug:', {
        maintenanceParts,
        validParts,
        partsJson
      });

      if (asset?.id) {
        // Update existing asset
        const updatePayload = {
          organizationId,
          assetNumber: formData.assetNumber,
          name: formData.name,
          category: formData.category,
          status: formData.status,
          manufacturer: formData.manufacturer || undefined,
          model: formData.model || undefined,
          serialNumber: formData.serialNumber || undefined,
          locationId: formData.locationId || undefined,
          parentAssetId: formData.parentAssetId || undefined,
          maintenanceParts: partsJson,
        };
        console.log('📤 Update Payload:', updatePayload);
        await api.updateAsset(asset.id, updatePayload);
      } else {
        // Create new asset
        await api.createAsset({
          organizationId,
          createdById: user?.id || '',
          ...formData,
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
        category: 'Equipment',
        status: 'operational',
        manufacturer: '',
        model: '',
        serialNumber: '',
        locationId: '',
        parentAssetId: '',
      });
      setUploadedFiles([]);
      setMaintenanceParts([]);
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maintenance Parts
            <span className="text-xs text-gray-500 font-normal ml-1">(Optional - Common parts needed for this asset)</span>
          </label>

          {maintenanceParts.map((part, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Part name"
                value={part.name}
                onChange={(e) => {
                  const newParts = [...maintenanceParts];
                  newParts[index].name = e.target.value;
                  setMaintenanceParts(newParts);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
              <input
                type="number"
                placeholder="Qty"
                value={part.quantity}
                onChange={(e) => {
                  const newParts = [...maintenanceParts];
                  newParts[index].quantity = e.target.value;
                  setMaintenanceParts(newParts);
                }}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
              <input
                type="number"
                placeholder="Cost"
                value={part.estimatedCost}
                onChange={(e) => {
                  const newParts = [...maintenanceParts];
                  newParts[index].estimatedCost = e.target.value;
                  setMaintenanceParts(newParts);
                }}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
              <button
                type="button"
                onClick={() => setMaintenanceParts(maintenanceParts.filter((_, i) => i !== index))}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setMaintenanceParts([...maintenanceParts, { name: '', quantity: '', estimatedCost: '' }])}
            className="mt-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition border border-blue-200"
          >
            + Add Part
          </button>

          {maintenanceParts.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              These parts will be suggested when creating maintenance schedules for this asset.
            </p>
          )}
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
