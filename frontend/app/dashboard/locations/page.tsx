'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Modal from '@/components/Modal';

interface Location {
  id: string;
  name: string;
  type?: string;
  address?: string;
  city?: string;
  assets?: Array<{
    id: string;
    assetNumber: string;
    name: string;
    status: string;
  }>;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Building',
    address: '',
    city: '',
  });
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      setFormData({
        name: selectedLocation.name || '',
        type: selectedLocation.type || 'Building',
        address: selectedLocation.address || '',
        city: selectedLocation.city || '',
      });
    } else {
      setFormData({
        name: '',
        type: 'Building',
        address: '',
        city: '',
      });
    }
  }, [selectedLocation]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const organizationId = user?.organizationId || 'org-test-1';

      const data = await api.getLocations(organizationId);
      setLocations(data as Location[]);
    } catch (error: any) {
      console.error('Failed to fetch locations:', error);
      setError(error.message || 'Failed to load locations');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddLocation = () => {
    setSelectedLocation(null);
    setFormData({
      name: '',
      type: 'Building',
      address: '',
      city: '',
    });
    setIsFormOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormOpen(false);
    setSelectedLocation(null);
    setFormData({
      name: '',
      type: 'Building',
      address: '',
      city: '',
    });
  };

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsFormOpen(true);
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm('Are you sure you want to delete this location? Assets assigned to this location will need to be reassigned.')) {
      return;
    }

    try {
      await api.deleteLocation(locationId);
      await fetchLocations();
    } catch (error: any) {
      alert(`Failed to delete location: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);

    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const organizationId = user?.organizationId || 'org-test-1';

      if (selectedLocation) {
        await api.updateLocation(selectedLocation.id, formData);
      } else {
        await api.createLocation({
          organizationId,
          ...formData,
        });
      }

      // Reset form data after successful submission
      setFormData({
        name: '',
        type: 'Building',
        address: '',
        city: '',
      });
      setSelectedLocation(null);
      setIsFormOpen(false);
      await fetchLocations();
    } catch (error: any) {
      alert(`Failed to save location: ${error.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            ⚠️ {error} - Backend may not be connected.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-600 mt-1">Manage your physical sites and facilities</p>
        </div>
        <button
          onClick={handleAddLocation}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          + Add Location
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <input
          type="text"
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
      </div>

      {/* Locations Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading locations...</div>
      ) : filteredLocations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No locations found</h3>
          <p className="text-gray-600 mb-4">Start by adding your first location.</p>
          <button 
            onClick={handleAddLocation}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Add Your First Location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((location) => (
            <div key={location.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{location.name}</h3>
                  {location.type && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {location.type}
                    </span>
                  )}
                </div>
                <div className="text-3xl">🏢</div>
              </div>

              {location.address && (
                <div className="text-sm text-gray-600 mb-2">
                  📍 {location.address}
                  {location.city && `, ${location.city}`}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Assets at this location:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {location.assets?.length || 0}
                  </span>
                </div>

                {location.assets && location.assets.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {location.assets.slice(0, 3).map((asset) => (
                      <div key={asset.id} className="text-xs text-gray-500 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        {asset.assetNumber} - {asset.name}
                      </div>
                    ))}
                    {location.assets.length > 3 && (
                      <div className="text-xs text-gray-400">
                        +{location.assets.length - 3} more...
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleEditLocation(location)}
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteLocation(location.id)}
                    className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Locations</div>
          <div className="text-2xl font-bold text-gray-900">{locations.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Assets</div>
          <div className="text-2xl font-bold text-blue-600">
            {locations.reduce((sum, loc) => sum + (loc.assets?.length || 0), 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Avg Assets/Location</div>
          <div className="text-2xl font-bold text-green-600">
            {locations.length > 0 
              ? Math.round(locations.reduce((sum, loc) => sum + (loc.assets?.length || 0), 0) / locations.length)
              : 0
            }
          </div>
        </div>
      </div>

      {/* Location Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseModal}
        title={selectedLocation ? 'Edit Location' : 'Add Location'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="e.g., Main Building, Floor 2, Room 101"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="Building">Building</option>
              <option value="Floor">Floor</option>
              <option value="Room">Room</option>
              <option value="Site">Site</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Office">Office</option>
              <option value="Factory">Factory</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Street address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="City name"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saveLoading ? 'Saving...' : selectedLocation ? 'Update Location' : 'Add Location'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

