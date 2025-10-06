'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalWorkOrders: 0,
    openWorkOrders: 0,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch assets
        const assets = await api.getAssets(user.organizationId);
        
        // Fetch work orders
        const workOrders = await api.getWorkOrders(user.organizationId);
        
        // Calculate stats
        const openWOs = workOrders.filter((wo: any) => 
          wo.status === 'open' || wo.status === 'assigned' || wo.status === 'in_progress'
        );
        
        const today = new Date().toISOString().split('T')[0];
        const completedToday = workOrders.filter((wo: any) => 
          wo.status === 'completed' && wo.completedAt?.startsWith(today)
        );
        
        setStats({
          totalAssets: assets.length,
          totalWorkOrders: workOrders.length,
          openWorkOrders: openWOs.length,
          completedToday: completedToday.length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.firstName || user?.email?.split('@')[0]}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Assets</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '...' : stats.totalAssets}
              </p>
            </div>
            <div className="text-4xl">🔧</div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push('/dashboard/assets')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Work Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '...' : stats.totalWorkOrders}
              </p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push('/dashboard/work-orders')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open Work Orders</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {loading ? '...' : stats.openWorkOrders}
              </p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Requires attention</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {loading ? '...' : stats.completedToday}
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Great progress!</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/dashboard/assets')}
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <span className="text-3xl mr-4">➕</span>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Add New Asset</p>
              <p className="text-sm text-gray-600">Register equipment or facility</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/dashboard/work-orders')}
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <span className="text-3xl mr-4">📝</span>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Create Work Order</p>
              <p className="text-sm text-gray-600">Schedule maintenance task</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/dashboard/reports')}
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <span className="text-3xl mr-4">📊</span>
            <div className="text-left">
              <p className="font-semibold text-gray-900">View Reports</p>
              <p className="text-sm text-gray-600">Analytics and insights</p>
            </div>
          </button>
        </div>
      </div>

      {/* Module Discovery */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">🚀 Unlock More Features</h2>
            <p className="text-gray-700 mb-4">
              Upgrade your plan to access advanced CMMS modules like Preventive Maintenance, Inventory Management, and more.
            </p>
            <button 
              onClick={() => router.push('/dashboard/modules')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              View Available Modules
            </button>
          </div>
          <div className="text-6xl">📦</div>
        </div>
      </div>
    </div>
  );
}
