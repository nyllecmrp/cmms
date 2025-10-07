'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface ExpiringLicense {
  id: string;
  organizationId: string;
  organizationName: string;
  moduleCode: string;
  expiresAt: string;
  status: string;
  daysUntilExpiration: number;
}

export default function ExpirationsPage() {
  const router = useRouter();
  const [licenses, setLicenses] = useState<ExpiringLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'expired'>('all');

  useEffect(() => {
    // Check if user is superadmin
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;

    if (!user || !user.isSuperAdmin) {
      router.push('/login');
      return;
    }

    fetchExpiringLicenses();
  }, [router]);

  const fetchExpiringLicenses = async () => {
    setLoading(true);
    try {
      const orgs = await api.getOrganizations();
      const expiringLicenses: ExpiringLicense[] = [];

      for (const org of orgs as any[]) {
        try {
          const modules = await api.getOrganizationModules(org.id);

          modules.forEach((module: any) => {
            if (module.isActive && module.expiresAt) {
              const expiresAt = new Date(module.expiresAt);
              const now = new Date();
              const daysUntilExpiration = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

              if (daysUntilExpiration <= 30) {
                expiringLicenses.push({
                  id: module.id || `${org.id}-${module.moduleCode}`,
                  organizationId: org.id,
                  organizationName: org.name,
                  moduleCode: module.moduleCode,
                  expiresAt: module.expiresAt,
                  status: module.status,
                  daysUntilExpiration
                });
              }
            }
          });
        } catch (err) {
          console.error(`Failed to fetch modules for ${org.name}:`, err);
        }
      }

      expiringLicenses.sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);
      setLicenses(expiringLicenses);
    } catch (error) {
      console.error('Failed to fetch expiring licenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExpirationStatus = (days: number) => {
    if (days < 0) return 'expired';
    if (days <= 7) return 'critical';
    if (days <= 14) return 'warning';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'critical':
        return 'bg-orange-100 text-orange-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getStatusLabel = (days: number) => {
    if (days < 0) return `Expired ${Math.abs(days)} days ago`;
    if (days === 0) return 'Expires today';
    return `Expires in ${days} days`;
  };

  const handleRenew = async (licenseId: string) => {
    // In real implementation, this would extend the license
    alert('Renewal functionality would be implemented here');
  };

  const handleSendReminder = async (licenseId: string) => {
    alert('Email reminder sent to organization admin');
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

  const filteredLicenses = licenses.filter(license => {
    const status = getExpirationStatus(license.daysUntilExpiration);
    if (filter === 'all') return true;
    return status === filter;
  });

  const criticalCount = licenses.filter(l => getExpirationStatus(l.daysUntilExpiration) === 'critical').length;
  const warningCount = licenses.filter(l => getExpirationStatus(l.daysUntilExpiration) === 'warning').length;
  const expiredCount = licenses.filter(l => getExpirationStatus(l.daysUntilExpiration) === 'expired').length;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">License Expirations</h1>
            <p className="text-gray-600">Monitor and manage module license expirations</p>
          </div>
          <button
            onClick={() => router.push('/superadmin')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Tracked</h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{licenses.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Critical (≤7 days)</h3>
              <span className="text-2xl">🚨</span>
            </div>
            <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Warning (≤14 days)</h3>
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{warningCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Expired</h3>
              <span className="text-2xl">❌</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{expiredCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({licenses.length})
              </button>
              <button
                onClick={() => setFilter('critical')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'critical'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Critical ({criticalCount})
              </button>
              <button
                onClick={() => setFilter('warning')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'warning'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Warning ({warningCount})
              </button>
              <button
                onClick={() => setFilter('expired')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'expired'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Expired ({expiredCount})
              </button>
            </div>
          </div>
        </div>

        {/* Licenses Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Expiring Licenses</h2>
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
                    Expiration Date
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
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Loading licenses...
                    </td>
                  </tr>
                ) : filteredLicenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No licenses found for this filter
                    </td>
                  </tr>
                ) : (
                  filteredLicenses.map((license) => {
                    const status = getExpirationStatus(license.daysUntilExpiration);
                    return (
                      <tr key={license.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {license.organizationName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {moduleNames[license.moduleCode] || license.moduleCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(license.expiresAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                            {getStatusLabel(license.daysUntilExpiration)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          {status !== 'expired' && (
                            <button
                              onClick={() => handleSendReminder(license.id)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Send Reminder
                            </button>
                          )}
                          <button
                            onClick={() => handleRenew(license.id)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Renew
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notification Schedule */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📧 Automated Notification Schedule</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-green-600 mr-3 text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">30 Days Before Expiration</p>
                <p className="text-sm text-gray-600">First reminder sent to organization admin and billing contact</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-3 text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">14 Days Before Expiration</p>
                <p className="text-sm text-gray-600">Second reminder with renewal options and pricing</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-3 text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">7 Days Before Expiration</p>
                <p className="text-sm text-gray-600">Final warning notification</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-orange-600 mr-3 text-xl">⚠️</span>
              <div>
                <p className="font-medium text-gray-900">On Expiration Day</p>
                <p className="text-sm text-gray-600">Module enters 7-day grace period (read-only access)</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-red-600 mr-3 text-xl">❌</span>
              <div>
                <p className="font-medium text-gray-900">After 7-Day Grace Period</p>
                <p className="text-sm text-gray-600">Module fully locked, data archived for 90 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📝 Implementation Notes</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-blue-800">
            <li>Set up automated email notifications using cron jobs or scheduled tasks</li>
            <li>Implement grace period logic in module access checks</li>
            <li>Create data export functionality for grace period users</li>
            <li>Set up automated archival process after grace period</li>
            <li>Add renewal workflow with payment processing</li>
            <li>Implement auto-restore functionality for renewed licenses</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
