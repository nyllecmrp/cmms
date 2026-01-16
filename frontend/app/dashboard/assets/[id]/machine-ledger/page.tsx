'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import WCMLedgerGrid from '@/components/WCMLedgerGrid';
import WCMComponentBOM from '@/components/WCMComponentBOM';
import MaintenanceCalendar from '@/components/MaintenanceCalendar';
import AssetPartsImport from '@/components/AssetPartsImport';

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
  const [scheduleRefreshKey, setScheduleRefreshKey] = useState(0);

  const handleScheduleChange = () => {
    setScheduleRefreshKey(prev => prev + 1);
  };

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

      setAsset(assetData as Asset);
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
            <AssetPartsImport assetId={assetId} onImportComplete={loadData} />
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
            <WCMLedgerGrid asset={asset} parts={parts} year={new Date().getFullYear()} onDataChange={loadData} refreshKey={scheduleRefreshKey} />
          )}

          {/* Tab 2: Maintenance Calendar */}
          {activeTab === 'calendar' && (
            <MaintenanceCalendar assetId={assetId} assetName={asset.name} parts={parts} onScheduleChange={handleScheduleChange} />
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
