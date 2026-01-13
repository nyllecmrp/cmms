'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import WCMLedgerGrid from '@/components/WCMLedgerGrid';
import WCMComponentBOM from '@/components/WCMComponentBOM';

type TabType = 'ledger' | 'calendar' | 'bom' | 'breakdown' | 'reports';

interface AssetPart {
  id: string;
  partNumber: string;
  sapNumber?: string;
  partName: string;
  description?: string;
  manufacturer?: string;
  modelNumber?: string;
  unitOfMeasure: string;
  quantity: number;
  isPrimary: boolean;
  componentClassification?: string;
  maintenanceTimeMinutes?: number;
  maintenanceInterval?: number;
  lastReplacedDate?: string;
  nextReplacementDue?: string;
  notes?: string;
  // WCM Fields
  pmType?: string;
  smpNumber?: number;
  frequencyPM?: string;
  machineStopRequired?: string;
  inspectionStandard?: string;
  frequencyAM?: string;
  qaMatrixNo?: number;
  qmMatrixNo?: number;
  kaizenType?: string;
  kaizenNo?: string;
  storeroomLocation?: string;
  vendor?: string;
  drawingPicture?: string;
}

interface Asset {
  id: string;
  assetNumber: string;
  name: string;
  category: string;
  status: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  location?: string;
  installationDate?: string;
}

export default function MachineLedgerPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  // Debug params
  console.log('Params object:', params);
  console.log('Params.id:', params.id);
  console.log('Params.id type:', typeof params.id);
  console.log('Is params.id array?', Array.isArray(params.id));

  // Handle params.id which could be string or array in Next.js 15
  const assetId = Array.isArray(params.id) ? params.id[0] : String(params.id || '');

  console.log('Final assetId:', assetId);

  const [asset, setAsset] = useState<Asset | null>(null);
  const [parts, setParts] = useState<AssetPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('ledger');

  useEffect(() => {
    if (assetId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assetData, partsData] = await Promise.all([
        api.get(`/assets/${assetId}`),
        api.get(`/assets/${assetId}/parts`)
      ]);

      console.log('Raw Asset Data:', assetData);
      console.log('Raw Parts Data:', partsData);
      console.log('Is Parts Array?', Array.isArray(partsData));
      console.log('Parts Data Type:', typeof partsData);

      setAsset(assetData);
      // Ensure partsData is an array
      if (Array.isArray(partsData)) {
        setParts(partsData);
      } else if (partsData && typeof partsData === 'object') {
        // If it's an object, try to extract array from it
        console.error('Parts data is not an array, got:', partsData);
        setParts([]);
      } else {
        setParts([]);
      }
    } catch (error: any) {
      console.error('Failed to load machine ledger:', error);
      alert(`Failed to load machine ledger: ${error.message}`);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const getClassificationBadge = (classification?: string) => {
    if (!classification) return <span className="text-gray-400">-</span>;

    // WCM ABC Classification Method
    const badges: Record<string, { label: string; color: string; desc: string }> = {
      'A': { label: 'A', color: 'bg-red-600', desc: 'Critical' },
      'B': { label: 'B', color: 'bg-yellow-600', desc: 'Important' },
      'C': { label: 'C', color: 'bg-green-600', desc: 'Standard' },
    };

    const classUpper = classification.toUpperCase();
    const badge = badges[classUpper] || { label: classification, color: 'bg-gray-400', desc: 'Unknown' };

    return (
      <span
        className={`inline-block w-8 h-8 ${badge.color} text-white text-sm font-bold rounded flex items-center justify-center`}
        title={`Class ${badge.label}: ${badge.desc}`}
      >
        {badge.label}
      </span>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    alert('PDF export functionality coming soon');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Machine Ledger...</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Asset not found</p>
          <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'ledger' as TabType, label: 'Machine Ledger', icon: '📋' },
    { id: 'calendar' as TabType, label: 'Maintenance Calendar', icon: '📅' },
    { id: 'bom' as TabType, label: 'Component BOM', icon: '🔧' },
    { id: 'breakdown' as TabType, label: 'Breakdown Analysis', icon: '📊' },
    { id: 'reports' as TabType, label: 'Reports', icon: '📄' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header Controls (Hide on Print) */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900 mb-2">
              ← Back to Assets
            </button>
            <h1 className="text-2xl font-bold text-gray-900">WCM Machine Ledger</h1>
            <p className="text-sm text-gray-600">{asset.assetNumber} - {asset.name}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              🖨️ Print
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              📄 Export PDF
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mt-4 border-t pt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {asset && (
        <div className="max-w-full mx-auto p-6 print:p-4">
          {/* Tab 1: Machine Ledger (WCM Grid) */}
          {activeTab === 'ledger' && (
            <WCMLedgerGrid asset={asset} parts={parts} year={new Date().getFullYear()} />
          )}

          {/* Original Machine Ledger Document (kept for reference) */}
          {activeTab === 'ledger-old' && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none">
            {/* Document Header */}
            <div className="border-b-4 border-blue-900 bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-blue-900">MACHINE LEDGER</h2>
                  <p className="text-sm text-blue-700 mt-1">Professional Maintenance - World Class Manufacturing</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Document ID: {asset.assetNumber}</p>
                  <p className="text-xs text-gray-600">Generated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Machine Information Section */}
            <div className="p-6 border-b border-gray-300">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Machine Details */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-1">MACHINE INFORMATION</h3>
                  <div className="space-y-2">
                    <div className="flex border-b border-gray-200 py-2">
                      <span className="w-40 text-sm font-semibold text-gray-700">Machine Name:</span>
                      <span className="flex-1 text-sm text-gray-900">{asset.name}</span>
                    </div>
                    <div className="flex border-b border-gray-200 py-2">
                      <span className="w-40 text-sm font-semibold text-gray-700">Asset Number:</span>
                      <span className="flex-1 text-sm text-gray-900">{asset.assetNumber}</span>
                    </div>
                    <div className="flex border-b border-gray-200 py-2">
                      <span className="w-40 text-sm font-semibold text-gray-700">Manufacturer:</span>
                      <span className="flex-1 text-sm text-gray-900">{asset.manufacturer || 'N/A'}</span>
                    </div>
                    <div className="flex border-b border-gray-200 py-2">
                      <span className="w-40 text-sm font-semibold text-gray-700">Model:</span>
                      <span className="flex-1 text-sm text-gray-900">{asset.model || 'N/A'}</span>
                    </div>
                    <div className="flex border-b border-gray-200 py-2">
                      <span className="w-40 text-sm font-semibold text-gray-700">Serial Number:</span>
                      <span className="flex-1 text-sm text-gray-900">{asset.serialNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Machine Diagram Placeholder */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-1">MACHINE DIAGRAM</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">📷 Machine Image/Diagram</p>
                      <p className="text-xs text-gray-400">Upload image placeholder</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info Row */}
              <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <span className="text-xs font-semibold text-gray-600">Location:</span>
                  <p className="text-sm text-gray-900">
                    {asset.location && typeof asset.location === 'object' && 'name' in asset.location
                      ? asset.location.name
                      : asset.location || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-600">Installation Date:</span>
                  <p className="text-sm text-gray-900">{asset.installationDate ? new Date(asset.installationDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-600">Category:</span>
                  <p className="text-sm text-gray-900">{asset.category}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-600">Status:</span>
                  <p className={`text-sm font-semibold ${
                    asset.status === 'operational' ? 'text-green-600' :
                    asset.status === 'down' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>{asset.status.toUpperCase()}</p>
                </div>
              </div>
            </div>

          {/* Bill of Materials / Parts List */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-blue-600 pb-1">
              BILL OF MATERIALS - COMPONENT LIST ({parts.length} Components)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="border border-gray-300 px-2 py-2 text-center" style={{width: '40px'}}>No.</th>
                    <th className="border border-gray-300 px-2 py-2 text-left" style={{width: '100px'}}>Part Number</th>
                    <th className="border border-gray-300 px-2 py-2 text-left" style={{width: '80px'}}>SAP Code</th>
                    <th className="border border-gray-300 px-2 py-2 text-left" style={{width: '150px'}}>Component Name</th>
                    <th className="border border-gray-300 px-2 py-2 text-left" style={{width: '120px'}}>Manufacturer</th>
                    <th className="border border-gray-300 px-2 py-2 text-left" style={{width: '100px'}}>Model/PN</th>
                    <th className="border border-gray-300 px-2 py-2 text-center" style={{width: '50px'}}>Qty</th>
                    <th className="border border-gray-300 px-2 py-2 text-center" style={{width: '60px'}}>UoM</th>
                    <th className="border border-gray-300 px-2 py-2 text-center" style={{width: '60px'}}>
                      <div>ABC</div>
                      <div>Class</div>
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-center" style={{width: '80px'}}>
                      <div>Activity</div>
                      <div>Cycle (wks)</div>
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-center" style={{width: '70px'}}>
                      <div>Maint.</div>
                      <div>Time (min)</div>
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-center" style={{width: '60px'}}>
                      <div>Primary</div>
                      <div>Part</div>
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-left" style={{width: '150px'}}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {parts.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                        No components defined in BOM. Please add parts to this machine.
                      </td>
                    </tr>
                  ) : (
                    parts.map((part, index) => (
                      <tr key={part.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="border border-gray-300 px-2 py-2 text-center font-semibold">{index + 1}</td>
                        <td className="border border-gray-300 px-2 py-2 font-mono text-blue-700">{part.partNumber}</td>
                        <td className="border border-gray-300 px-2 py-2 font-mono text-gray-700">{part.sapNumber || '-'}</td>
                        <td className="border border-gray-300 px-2 py-2 font-semibold">{part.partName}</td>
                        <td className="border border-gray-300 px-2 py-2">{part.manufacturer || '-'}</td>
                        <td className="border border-gray-300 px-2 py-2 font-mono">{part.modelNumber || '-'}</td>
                        <td className="border border-gray-300 px-2 py-2 text-center font-semibold">{part.quantity}</td>
                        <td className="border border-gray-300 px-2 py-2 text-center">{part.unitOfMeasure}</td>
                        <td className="border border-gray-300 px-2 py-2 text-center">
                          {getClassificationBadge(part.componentClassification)}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center">
                          {part.maintenanceInterval ? Math.floor(part.maintenanceInterval / 7) : '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center font-semibold">
                          {part.maintenanceTimeMinutes || '-'}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center">
                          {part.isPrimary ? (
                            <span className="inline-block w-6 h-6 bg-green-500 text-white rounded-full font-bold">✓</span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-xs">{part.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend Section */}
          <div className="px-6 pb-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-bold text-gray-900 mb-3">WCM ABC CLASSIFICATION LEGEND</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-red-200">
                  {getClassificationBadge('A')}
                  <div>
                    <p className="text-sm font-bold text-gray-900">Class A - Critical</p>
                    <p className="text-xs text-gray-600">High importance, causes downtime, safety critical</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-yellow-200">
                  {getClassificationBadge('B')}
                  <div>
                    <p className="text-sm font-bold text-gray-900">Class B - Important</p>
                    <p className="text-xs text-gray-600">Moderate importance, affects quality/performance</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-green-200">
                  {getClassificationBadge('C')}
                  <div>
                    <p className="text-sm font-bold text-gray-900">Class C - Standard</p>
                    <p className="text-xs text-gray-600">Low criticality, routine maintenance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Footer */}
          <div className="bg-gray-100 border-t-2 border-gray-300 px-6 py-4">
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="font-semibold text-gray-700">Prepared By:</span>
                <p className="text-gray-900 mt-1">{user?.firstName} {user?.lastName}</p>
                <p className="text-gray-600">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Verified By:</span>
                <p className="text-gray-900 mt-1">___________________</p>
                <p className="text-gray-600">Signature / Date</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Approved By:</span>
                <p className="text-gray-900 mt-1">___________________</p>
                <p className="text-gray-600">Signature / Date</p>
              </div>
            </div>
          </div>
        </div>
          )}

          {/* Tab 2: Maintenance Calendar */}
          {activeTab === 'calendar' && (
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📅 Maintenance Calendar (52-Week View)</h2>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
                <p className="text-lg text-gray-700 mb-2">🚧 Coming Soon</p>
                <p className="text-sm text-gray-600">
                  Drag-and-drop maintenance scheduling with 52-week grid view
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Component BOM */}
          {activeTab === 'bom' && (
            <WCMComponentBOM assetId={assetId} assetName={asset.name} />
          )}

          {/* Tab 4: Breakdown Analysis */}
          {activeTab === 'breakdown' && (
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Breakdown Analysis & Root Cause Tracking</h2>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
                <p className="text-lg text-gray-700 mb-2">🚧 Coming Soon</p>
                <p className="text-sm text-gray-600">
                  6 Root Cause Categories: External Factors, Insufficient Skills, Design Weakness,
                  Lack of PM, Lack of Operating Conditions, Lack of Basic Conditions
                </p>
              </div>
            </div>
          )}

          {/* Tab 5: Reports */}
          {activeTab === 'reports' && (
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📄 WCM Reports & Exports</h2>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
                <p className="text-lg text-gray-700 mb-2">🚧 Coming Soon</p>
                <p className="text-sm text-gray-600">
                  WCM-compliant exports: Excel format, PDF reports, maintenance summaries
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
