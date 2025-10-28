'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LockedModuleModal from '@/components/LockedModuleModal';
import TrialBanner from '@/components/TrialBanner';
import api from '@/lib/api';
import { canAccessModule, getRoleDisplayName, getRoleColor } from '@/lib/rolePermissions';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lockedModuleModal, setLockedModuleModal] = useState<string | null>(null);
  const [activeModules, setActiveModules] = useState<Set<string>>(new Set());

  // Fetch active modules for the organization
  useEffect(() => {
    const fetchActiveModules = async () => {
      if (!user?.organizationId) return;

      try {
        const modules = await api.getOrganizationModules(user.organizationId) as any[];
        const active = new Set(
          modules
            .filter((m: any) => m.isActive)
            .map((m: any) => m.moduleCode)
        );
        setActiveModules(active);
      } catch (error) {
        console.error('Failed to fetch modules:', error);
      }
    };

    fetchActiveModules();
  }, [user?.organizationId]);

  const handleRequestTrial = async (moduleCode: string) => {
    try {
      if (!user) {
        alert('Please log in to request a trial');
        return;
      }

      const { api } = await import('@/lib/api');

      await api.createModuleRequest({
        organizationId: user.organizationId,
        requestedById: user.id,
        moduleCode: moduleCode,
        requestType: 'trial',
        justification: '30-day free trial request',
      });

      alert('Trial request submitted! Our team will contact you within 24 hours.');
    } catch (error: any) {
      alert(`Failed to submit request: ${error.message}`);
    }
  };

  const handleUpgrade = async (moduleCode: string) => {
    try {
      if (!user) {
        alert('Please log in to request a purchase');
        return;
      }

      await api.createModuleRequest({
        organizationId: user.organizationId,
        requestedById: user.id,
        moduleCode: moduleCode,
        requestType: 'purchase',
        justification: 'Upgrade plan to unlock this module',
      });

      alert('Purchase request submitted! Our sales team will contact you within 24 hours.');
    } catch (error: any) {
      alert(`Failed to submit request: ${error.message}`);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', moduleCode: '', moduleKey: '' },
    { name: 'My Work', href: '/dashboard/my-work', icon: '👷', moduleCode: '', moduleKey: 'my-work' },
    { name: 'Assets', href: '/dashboard/assets', icon: '🔧', moduleCode: '', moduleKey: 'assets' },
    { name: 'Work Orders', href: '/dashboard/work-orders', icon: '📋', moduleCode: '', moduleKey: 'work-orders' },
    { name: 'Work Requests', href: '/dashboard/work-requests', icon: '📝', locked: true, moduleCode: 'work_request_management', moduleKey: 'work-requests' },
    { name: 'Preventive Maintenance', href: '/dashboard/pm', icon: '🔄', locked: true, moduleCode: 'preventive_maintenance', moduleKey: 'preventive-maintenance' },
    { name: 'Inventory', href: '/dashboard/inventory', icon: '📦', locked: true, moduleCode: 'inventory_management', moduleKey: 'inventory' },
    { name: 'Scheduling', href: '/dashboard/scheduling', icon: '📅', locked: true, moduleCode: 'scheduling_planning', moduleKey: 'scheduling' },
    { name: 'Documents', href: '/dashboard/documents', icon: '📁', locked: true, moduleCode: 'document_management', moduleKey: 'documents' },
    { name: 'Calibration', href: '/dashboard/calibration', icon: '🔬', locked: true, moduleCode: 'calibration_management', moduleKey: 'calibration' },
    { name: 'Safety', href: '/dashboard/safety', icon: '🚨', locked: true, moduleCode: 'safety_compliance', moduleKey: 'safety' },
    { name: 'Asset Tracking', href: '/dashboard/asset-tracking', icon: '📍', locked: true, moduleCode: 'asset_tracking_qr', moduleKey: 'asset-tracking' },
    { name: 'Vendors', href: '/dashboard/vendors', icon: '🏢', locked: true, moduleCode: 'vendor_management', moduleKey: 'vendors' },
    { name: 'Predictive', href: '/dashboard/predictive', icon: '🔮', locked: true, moduleCode: 'predictive_maintenance', moduleKey: 'predictive-maintenance' },
    { name: 'Audit & Quality', href: '/dashboard/audit', icon: '✅', locked: true, moduleCode: 'audit_quality', moduleKey: 'audit' },
    { name: 'Energy', href: '/dashboard/energy', icon: '⚡', locked: true, moduleCode: 'energy_management', moduleKey: 'energy' },
    { name: 'Reports', href: '/dashboard/reports', icon: '📈', moduleCode: '', moduleKey: 'reports' },
    { name: 'Users', href: '/dashboard/users', icon: '👥', moduleCode: '', moduleKey: 'users' },
    { name: 'Modules', href: '/dashboard/modules', icon: '🧩', moduleCode: '', moduleKey: '' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️', moduleCode: '', moduleKey: 'settings' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
              <h1 className="text-xl font-bold">CMMS</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navigation.filter((item) => {
                // Filter by licensing (module must be active)
                const isLocked = item.moduleCode && !activeModules.has(item.moduleCode);
                if (isLocked) return false;
                
                // Filter by role permission
                if (item.moduleKey && !canAccessModule(user?.roleId || null, item.moduleKey)) {
                  return false;
                }
                
                return true;
              }).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <span className="text-xl mr-3">{item.icon}</span>
                    <span className="flex-1">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                  <p className="text-xs text-gray-400">{user?.firstName} {user?.lastName}</p>
                  {user?.roleId && (
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${getRoleColor(user.roleId)}`}>
                      {getRoleDisplayName(user.roleId)}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'pl-0'}`}>
          {/* Top Header */}
          <header className="bg-white shadow-sm">
            <div className="flex items-center justify-between h-16 px-6">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, <span className="font-semibold">{user?.firstName || user?.email?.split('@')[0]}</span>
                </span>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6">
            <TrialBanner />
            {children}
          </main>
        </div>

        {/* Locked Module Modal */}
        <LockedModuleModal
          isOpen={!!lockedModuleModal}
          onClose={() => setLockedModuleModal(null)}
          moduleCode={lockedModuleModal || ''}
          onRequestTrial={() => lockedModuleModal && handleRequestTrial(lockedModuleModal)}
          onUpgrade={() => lockedModuleModal && handleUpgrade(lockedModuleModal)}
        />
      </div>
    </ProtectedRoute>
  );
}
