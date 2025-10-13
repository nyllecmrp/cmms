'use client';

import { useEffect, useState } from 'react';

export default function BillingPage() {
  const [billingData, setBillingData] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    pendingPayments: 0,
    trialUsers: 0,
  });

  useEffect(() => {
    // Fetch billing data (placeholder)
    setBillingData({
      totalRevenue: 0,
      activeSubscriptions: 12,
      pendingPayments: 0,
      trialUsers: 3,
    });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Revenue</h1>
        <p className="text-gray-600 mt-1">Subscription and payment management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-2xl font-bold text-green-600">
            ₱{billingData.totalRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">All-time</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active Subscriptions</div>
          <div className="text-2xl font-bold text-blue-600">
            {billingData.activeSubscriptions}
          </div>
          <div className="text-xs text-gray-500 mt-1">Organizations</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Pending Payments</div>
          <div className="text-2xl font-bold text-yellow-600">
            {billingData.pendingPayments}
          </div>
          <div className="text-xs text-gray-500 mt-1">Requires action</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Trial Users</div>
          <div className="text-2xl font-bold text-purple-600">
            {billingData.trialUsers}
          </div>
          <div className="text-xs text-gray-500 mt-1">Free trials</div>
        </div>
      </div>

      {/* Pricing Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <div className="flex items-start">
          <div className="text-3xl mr-4">💡</div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Pricing Configuration</h3>
            <p className="text-sm text-gray-700 mb-3">
              Pricing tiers and billing plans are currently being finalized. This section will be updated once pricing is confirmed.
            </p>
            <div className="text-xs text-gray-600">
              <strong>Status:</strong> Planning Phase • <strong>Expected:</strong> Q1 2025
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Placeholder */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="p-8 text-center text-gray-500">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-lg font-medium mb-2">No transactions yet</p>
          <p className="text-sm">Transaction history will appear here once billing is active.</p>
        </div>
      </div>
    </div>
  );
}

