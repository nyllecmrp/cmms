'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface BillingRecord {
  organizationId: string;
  organizationName: string;
  tier: string;
  activeModules: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  lastPayment: string | null;
  nextBilling: string | null;
  status: 'active' | 'overdue' | 'cancelled';
}

export default function BillingPage() {
  const router = useRouter();
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;

    if (!user || !user.isSuperAdmin) {
      router.push('/login');
      return;
    }

    fetchBillingData();
  }, [router]);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const orgs = await api.getOrganizations();

      const billing: BillingRecord[] = [];

      for (const org of orgs) {
        try {
          const modules = await api.getOrganizationModules(org.id);
          const activeModules = modules.filter((m: any) => m.isActive && m.isLicensed).length;

          // Calculate revenue based on tier and active modules
          const tierPricing: Record<string, number> = {
            starter: 1500,
            professional: 5000,
            enterprise: 15000,
            enterprise_plus: 35000
          };

          const basePricing = tierPricing[org.tier] || 1500;
          const modulePricing = activeModules * 500; // ₱500 per module per month
          const monthlyRevenue = basePricing + modulePricing;

          billing.push({
            organizationId: org.id,
            organizationName: org.name,
            tier: org.tier,
            activeModules,
            monthlyRevenue,
            yearlyRevenue: monthlyRevenue * 12,
            lastPayment: org.createdAt || null,
            nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active'
          });
        } catch (err) {
          console.error(`Failed to fetch modules for ${org.name}:`, err);
        }
      }

      setBillingRecords(billing);
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'starter': return 'bg-gray-100 text-gray-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'enterprise_plus': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalMonthlyRevenue = billingRecords.reduce((sum, record) => sum + record.monthlyRevenue, 0);
  const totalYearlyRevenue = billingRecords.reduce((sum, record) => sum + record.yearlyRevenue, 0);
  const activeOrgs = billingRecords.filter(r => r.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">💰 Billing Overview</h1>
            <p className="text-gray-600">Revenue tracking and subscription management</p>
          </div>
          <button
            onClick={() => router.push('/superadmin')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Monthly Revenue</h3>
              <span className="text-2xl">💵</span>
            </div>
            <p className="text-3xl font-bold text-green-600">
              ₱{totalMonthlyRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">This month</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Yearly Revenue</h3>
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              ₱{totalYearlyRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">Projected annual</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Active Subscriptions</h3>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{activeOrgs}</p>
            <p className="text-sm text-gray-500 mt-1">Organizations</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Avg Revenue/Org</h3>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              ₱{billingRecords.length > 0 ? Math.round(totalMonthlyRevenue / billingRecords.length).toLocaleString() : 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">Per month</p>
          </div>
        </div>

        {/* Billing Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Organization Billing</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Modules
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Yearly Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Billing
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
                      Loading billing data...
                    </td>
                  </tr>
                ) : billingRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No billing records found
                    </td>
                  </tr>
                ) : (
                  billingRecords.map((record) => (
                    <tr key={record.organizationId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.organizationName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTierColor(record.tier)}`}>
                          {record.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.activeModules}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        ₱{record.monthlyRevenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₱{record.yearlyRevenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.nextBilling ? new Date(record.nextBilling).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Tier</h3>
            <div className="space-y-4">
              {['starter', 'professional', 'enterprise', 'enterprise_plus'].map(tier => {
                const tierRecords = billingRecords.filter(r => r.tier === tier);
                const tierRevenue = tierRecords.reduce((sum, r) => sum + r.monthlyRevenue, 0);
                const percentage = totalMonthlyRevenue > 0 ? (tierRevenue / totalMonthlyRevenue * 100).toFixed(1) : 0;

                return tierRecords.length > 0 ? (
                  <div key={tier}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTierColor(tier)}`}>
                        {tier} ({tierRecords.length})
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        ₱{tierRevenue.toLocaleString()} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{width: `${percentage}%`}}
                      ></div>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Structure</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Starter Tier</span>
                <span className="text-sm font-semibold text-gray-900">₱1,500/month</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-700">Professional Tier</span>
                <span className="text-sm font-semibold text-blue-900">₱5,000/month</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-purple-700">Enterprise Tier</span>
                <span className="text-sm font-semibold text-purple-900">₱15,000/month</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <span className="text-sm font-medium text-indigo-700">Enterprise Plus Tier</span>
                <span className="text-sm font-semibold text-indigo-900">₱35,000/month</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-t-2 border-green-600 mt-4">
                <span className="text-sm font-medium text-green-700">Per Module</span>
                <span className="text-sm font-semibold text-green-900">+₱500/month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📝 Implementation Notes</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-blue-800">
            <li>Connect to payment gateway (Stripe, PayPal, or local payment processor)</li>
            <li>Implement automated billing cycles and payment reminders</li>
            <li>Add invoice generation and PDF export functionality</li>
            <li>Set up webhook handlers for payment confirmations</li>
            <li>Implement payment history tracking and audit logs</li>
            <li>Add support for discounts, promotions, and custom pricing</li>
            <li>Create automated dunning process for failed payments</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
