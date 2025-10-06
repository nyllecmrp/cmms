'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AssetLocation {
  id: string;
  assetId: string;
  assetName: string;
  assetTag: string;
  currentLocation: string;
  zone: string;
  floor?: string;
  room?: string;
  lastScanned: string;
  scannedBy: string;
  latitude?: number;
  longitude?: number;
  qrCode: string;
  status: 'in_use' | 'in_transit' | 'in_storage' | 'maintenance';
}

interface LocationHistory {
  id: string;
  assetId: string;
  location: string;
  movedBy: string;
  timestamp: string;
  reason?: string;
}

export default function AssetTrackingPage() {
  const { user } = useAuth();
  const [selectedAsset, setSelectedAsset] = useState<AssetLocation | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [scanMode, setScanMode] = useState(false);

  const [assets, setAssets] = useState<AssetLocation[]>([
    {
      id: '1',
      assetId: 'PUMP-001',
      assetName: 'Hydraulic Pump Unit A',
      assetTag: 'PUMP-001',
      currentLocation: 'Production Line 1',
      zone: 'Manufacturing',
      floor: 'Ground Floor',
      room: 'Room 101',
      lastScanned: '2025-10-03 14:30',
      scannedBy: 'John Smith',
      qrCode: 'QR-PUMP-001',
      status: 'in_use',
    },
    {
      id: '2',
      assetId: 'CT-SCAN-01',
      assetName: 'CT Scanner - Radiology',
      assetTag: 'CT-SCAN-01',
      currentLocation: 'Radiology Department',
      zone: 'Medical',
      floor: '2nd Floor',
      room: 'Imaging Room 3',
      lastScanned: '2025-10-03 10:15',
      scannedBy: 'Jane Doe',
      latitude: 14.5995,
      longitude: 120.9842,
      qrCode: 'QR-CT-SCAN-01',
      status: 'in_use',
    },
    {
      id: '3',
      assetId: 'HVAC-05',
      assetName: 'HVAC Unit - Floor 3',
      assetTag: 'HVAC-05',
      currentLocation: 'Warehouse B',
      zone: 'Storage',
      floor: 'Ground Floor',
      lastScanned: '2025-10-02 16:45',
      scannedBy: 'Mike Johnson',
      qrCode: 'QR-HVAC-05',
      status: 'in_transit',
    },
    {
      id: '4',
      assetId: 'GEN-001',
      assetName: 'Emergency Generator',
      assetTag: 'GEN-001',
      currentLocation: 'Generator Room',
      zone: 'Utilities',
      floor: 'Basement',
      room: 'Gen Room A',
      lastScanned: '2025-10-03 09:00',
      scannedBy: 'Tom Brown',
      qrCode: 'QR-GEN-001',
      status: 'maintenance',
    },
  ]);

  const [locationHistory] = useState<LocationHistory[]>([
    {
      id: '1',
      assetId: 'HVAC-05',
      location: 'Production Line 1',
      movedBy: 'John Smith',
      timestamp: '2025-10-01 14:00',
      reason: 'Relocated for maintenance',
    },
    {
      id: '2',
      assetId: 'HVAC-05',
      location: 'Warehouse B',
      movedBy: 'Mike Johnson',
      timestamp: '2025-10-02 16:45',
      reason: 'Temporary storage',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_use': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800';
      case 'in_storage': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generateQRCode = (assetTag: string) => {
    // Simulated QR code (in production, use a QR library like qrcode.react)
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${assetTag}`;
  };

  const handleScanQR = () => {
    setScanMode(true);
    // In production, this would open camera for QR scanning
    setTimeout(() => {
      const randomAsset = assets[Math.floor(Math.random() * assets.length)];
      alert(`Scanned: ${randomAsset.assetTag} - ${randomAsset.assetName}`);
      setSelectedAsset(randomAsset);
      setScanMode(false);
    }, 2000);
  };

  const handleUpdateLocation = (assetId: string, newLocation: string) => {
    setAssets(assets.map(asset =>
      asset.id === assetId
        ? {
            ...asset,
            currentLocation: newLocation,
            lastScanned: new Date().toISOString().replace('T', ' ').substring(0, 16),
            scannedBy: user?.name || 'Current User'
          }
        : asset
    ));
  };

  const stats = {
    totalAssets: assets.length,
    inUse: assets.filter(a => a.status === 'in_use').length,
    inTransit: assets.filter(a => a.status === 'in_transit').length,
    inMaintenance: assets.filter(a => a.status === 'maintenance').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Asset Tracking & QR Codes</h1>
        <p className="text-gray-600 mt-1">Real-time asset location tracking with QR scanning</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tracked Assets</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalAssets}</p>
            </div>
            <div className="text-4xl">📍</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Use</p>
              <p className="text-3xl font-bold text-gray-900">{stats.inUse}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Transit</p>
              <p className="text-3xl font-bold text-gray-900">{stats.inTransit}</p>
            </div>
            <div className="text-4xl">🚚</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Maintenance</p>
              <p className="text-3xl font-bold text-gray-900">{stats.inMaintenance}</p>
            </div>
            <div className="text-4xl">🔧</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4">
          <button
            onClick={handleScanQR}
            disabled={scanMode}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
          >
            {scanMode ? '📷 Scanning...' : '📱 Scan QR Code'}
          </button>
          <button
            onClick={() => alert('Bulk print QR codes... (Feature coming soon)')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            🖨️ Print QR Codes
          </button>
          <button
            onClick={() => alert('Opening map view... (Feature coming soon)')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
          >
            🗺️ Map View
          </button>
        </div>
      </div>

      {/* Assets Location Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Asset Locations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Scanned</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{asset.assetName}</div>
                      <div className="text-xs text-gray-500">{asset.assetTag}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900">{asset.currentLocation}</div>
                      {asset.floor && asset.room && (
                        <div className="text-xs text-gray-500">{asset.floor} - {asset.room}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{asset.zone}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900">{asset.lastScanned}</div>
                      <div className="text-xs text-gray-500">by {asset.scannedBy}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(asset.status)}`}>
                      {asset.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setSelectedAsset(asset);
                        setShowQRModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      QR Code
                    </button>
                    <button
                      onClick={() => setSelectedAsset(asset)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Location History */}
      {selectedAsset && !showQRModal && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Location History: {selectedAsset.assetName}
          </h3>
          <div className="space-y-4">
            {locationHistory
              .filter(h => h.assetId === selectedAsset.assetId)
              .map((history) => (
                <div key={history.id} className="flex items-start border-l-2 border-blue-500 pl-4">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{history.location}</div>
                    <div className="text-xs text-gray-500">
                      Moved by {history.movedBy} • {history.timestamp}
                    </div>
                    {history.reason && (
                      <div className="text-xs text-gray-600 mt-1">{history.reason}</div>
                    )}
                  </div>
                </div>
              ))}
          </div>
          <button
            onClick={() => setSelectedAsset(null)}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">QR Code</h2>

            <div className="text-center mb-4">
              <div className="text-lg font-semibold text-gray-900">{selectedAsset.assetName}</div>
              <div className="text-sm text-gray-500">{selectedAsset.assetTag}</div>
            </div>

            <div className="flex justify-center mb-4">
              <img
                src={generateQRCode(selectedAsset.assetTag)}
                alt="QR Code"
                className="border-4 border-gray-200 rounded-lg"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-xs text-gray-600 mb-2">Current Location</div>
              <div className="text-sm font-medium text-gray-900">{selectedAsset.currentLocation}</div>
              {selectedAsset.floor && (
                <div className="text-xs text-gray-500">{selectedAsset.floor} - {selectedAsset.room}</div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => alert('Downloading QR code... (Feature coming soon)')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Download
              </button>
              <button
                onClick={() => alert('Printing QR code... (Feature coming soon)')}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Print
              </button>
            </div>

            <button
              onClick={() => {
                setShowQRModal(false);
                setSelectedAsset(null);
              }}
              className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Instructions Panel */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">📱 How to Use QR Tracking</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-3xl mb-2">1️⃣</div>
            <div className="font-semibold text-gray-900 mb-1">Generate QR Codes</div>
            <div className="text-sm text-gray-600">Print QR codes for each asset and attach them to equipment</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-3xl mb-2">2️⃣</div>
            <div className="font-semibold text-gray-900 mb-1">Scan on Mobile</div>
            <div className="text-sm text-gray-600">Use mobile app to scan QR codes when moving assets</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-3xl mb-2">3️⃣</div>
            <div className="font-semibold text-gray-900 mb-1">Track in Real-time</div>
            <div className="text-sm text-gray-600">View asset locations and movement history instantly</div>
          </div>
        </div>
      </div>
    </div>
  );
}
