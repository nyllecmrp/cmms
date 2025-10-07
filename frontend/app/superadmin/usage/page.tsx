'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface UsageData {
  organizationId: string;
  organizationName: string;
  moduleCode: string;
  activeUsers: number;
  transactions: number;
  apiCalls: number;
  storageUsed: number;
  date: string;
}

interface ModuleLicense {
  moduleCode: string;
  organizationId: string;
  organizationName: string;
  status: string;
  expiresAt: string | null;
  maxUsers: number | null;
  usageLimits: any;
}

export default function UsageMonitoringPage() {
  const router = useRouter();
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [moduleLicenses, setModuleLicenses] = useState<ModuleLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModule, setFilterModule] = useState('all');

  useEffect(() => {
    // Check if user is superadmin
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;

    if (!user || !user.isSuperAdmin) {
      router.push('/login');
      return;
    }

    fetchUsageData();
  }, [router]);

  const fetchUsageData = async () => {
    setLoading(true);
    try {
      // Fetch all organizations
      const orgs = await api.getOrganizations();

      // Fetch module licenses for each organization
      const allLicenses: ModuleLicense[] = [];

      for (const org of orgs as any[]) {
        try {
          const modules = await api.getOrganizationModules(org.id) as any[];

          modules.forEach((module: any) => {
            if (module.isActive && module.isLicensed) {
              allLicenses.push({
                moduleCode: module.moduleCode,
                organizationId: org.id,
                organizationName: org.name,
                status: module.status,
                expiresAt: module.expiresAt || null,
                maxUsers: null,
                usageLimits: null,
              });
            }
          });
        } catch (err) {
          console.error(`Failed to fetch modules for ${org.name}:`, err);
        }
      }

      setModuleLicenses(allLicenses);
      setUsageData([]);
    } catch (error) {
      console.error('Failed to fetch usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const moduleNames: Record<string, string> = {
    preventive_maintenance: 'Preventive Maintenance',
    inventory_management: 'Inventory Management',
    predictive_maintenance: 'Predictive Maintenance',
    calibration_management: 'Calibration Management',
    mobile_cmms: 'Mobile CMMS',
    reports_analytics: 'Reports & Analytics',
    enterprise_api: 'Enterprise API',
  };

  const getUsagePercentage = (current: number, max: number | null) => {
    if (!max) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'warning';
    return 'normal';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Module Usage Monitoring</h1>
          <p className="text-gray-600">
            Track module usage across all organizations and identify underutilized or overutilized resources
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Active Modules</h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{moduleLicenses.length}</p>
            <p className="text-sm text-gray-500 mt-1">Across all organizations</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Trial Modules</h3>
              <span className="text-2xl">🕐</span>
            </div>
            <p className="text-3xl font-bold text-yellow-600">
              {moduleLicenses.filter(m => m.status === 'trial').length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Active trials</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Expiring Soon</h3>
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {moduleLicenses.filter(m => {
                if (!m.expiresAt) return false;
                const daysUntilExpiration = Math.floor((new Date(m.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return daysUntilExpiration > 0 && daysUntilExpiration <= 7;
              }).length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Within 7 days</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Expired</h3>
              <span className="text-2xl">❌</span>
            </div>
            <p className="text-3xl font-bold text-red-600">
              {moduleLicenses.filter(m => {
                if (!m.expiresAt) return false;
                return new Date(m.expiresAt) < new Date();
              }).length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Needs renewal</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by Module:</label>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">All Modules</option>
              {Object.entries(moduleNames).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Usage Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Module Usage by Organization</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transactions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API Calls
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Storage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Loading usage data...
                    </td>
                  </tr>
                ) : usageData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No usage data available. Implement module tracking to see real-time usage metrics.
                    </td>
                  </tr>
                ) : (
                  usageData
                    .filter(item => filterModule === 'all' || item.moduleCode === filterModule)
                    .map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.organizationName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {moduleNames[item.moduleCode] || item.moduleCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.activeUsers}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.transactions.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.apiCalls.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(item.storageUsed / 1024 / 1024).toFixed(2)} MB
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Normal
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Placeholder for Charts */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Trends</h3>
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart: Usage over time (implement with Chart.js or similar)</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Module Distribution</h3>
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart: Module usage distribution (implement with Chart.js or similar)</p>
            </div>
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📝 Implementation Notes</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-blue-800">
            <li>Connect to real-time usage tracking endpoints</li>
            <li>Implement automated alerts for organizations approaching limits</li>
            <li>Add export functionality for usage reports</li>
            <li>Integrate Chart.js or similar for data visualization</li>
            <li>Add date range filtering and comparison</li>
            <li>Implement anomaly detection for unusual usage patterns</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
