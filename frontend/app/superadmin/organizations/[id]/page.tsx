'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Module {
  moduleCode: string;
  name: string;
  description: string;
  tier: string;
  status: string;
  isLicensed: boolean;
  isActive: boolean;
  expiresAt?: string;
  features: string[];
}

export default function OrganizationModulesPage() {
  const params = useParams();
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch real data from backend API
        const data = await api.getOrganizationModules(params.id as string);
        setModules(data as Module[]);

        // Set organization info based on ID
        const orgName = params.id === 'org-test-1' ? 'Acme Manufacturing' : 'Metro Hospital';
        const orgTier = params.id === 'org-test-1' ? 'professional' : 'enterprise';
        setOrganization({ name: orgName, tier: orgTier });

        setLoading(false);
      } catch (error: any) {
        console.error('Failed to fetch modules:', error);
        setError(error.message || 'Failed to load modules');
        setLoading(false);
        // Still show mock data as fallback
        setModules([
          {
            moduleCode: 'user_management',
            name: 'User Management',
            description: 'User accounts and RBAC',
            tier: 'core',
            status: 'active',
            isLicensed: true,
            isActive: true,
            features: ['User auth', 'RBAC', 'Profiles'],
          },
          {
            moduleCode: 'preventive_maintenance',
            name: 'Preventive Maintenance',
            description: 'Scheduled maintenance and PM compliance',
            tier: 'standard',
            status: 'active',
            isLicensed: true,
            isActive: true,
            expiresAt: '2026-12-31',
            features: ['PM scheduling', 'Auto-generation', 'Templates'],
          },
          {
            moduleCode: 'predictive_maintenance',
            name: 'Predictive Maintenance',
            description: 'IoT integration and condition monitoring',
            tier: 'advanced',
            status: 'inactive',
            isLicensed: false,
            isActive: false,
            features: ['IoT integration', 'ML predictions', 'Anomaly detection'],
          },
        ]);
        setOrganization({ name: 'Acme Manufacturing', tier: 'professional' });
        setLoading(false);
      }
    };

    fetchModules();
  }, [params.id]);

  const handleActivateModule = async (moduleCode: string) => {
    if (!confirm(`Activate ${moduleCode} for this organization?`)) {
      return;
    }

    try {
      // Get superadmin user from localStorage
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      if (!user || !user.isSuperAdmin) {
        alert('Only superadmins can activate modules');
        return;
      }

      // Call real backend API
      await api.activateModule({
        organizationId: params.id as string,
        moduleCode,
        activatedById: user.id, // Using email as ID for now
        expiresAt: '2026-12-31', // 1 year from now
      });

      alert(`✅ Module ${moduleCode} activated successfully!`);

      // Refresh module list
      const data = await api.getOrganizationModules(params.id as string);
      setModules(data as Module[]);
    } catch (error: any) {
      console.error('Failed to activate module:', error);
      alert(`❌ Failed to activate module: ${error.message}`);
    }
  };

  const handleDeactivateModule = async (moduleCode: string) => {
    if (!confirm(`Deactivate ${moduleCode}? This will lock the module for users.`)) {
      return;
    }

    try {
      // Get superadmin user from localStorage
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      if (!user || !user.isSuperAdmin) {
        alert('Only superadmins can deactivate modules');
        return;
      }

      // Call real backend API
      await api.deactivateModule({
        organizationId: params.id as string,
        moduleCode,
        deactivatedById: user.id, // Using email as ID for now
      });

      alert(`✅ Module ${moduleCode} deactivated successfully!`);

      // Refresh module list
      const data = await api.getOrganizationModules(params.id as string);
      setModules(data as Module[]);
    } catch (error: any) {
      console.error('Failed to deactivate module:', error);
      alert(`❌ Failed to deactivate module: ${error.message}`);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'core': return 'bg-gray-100 text-gray-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedModules = {
    core: modules.filter(m => m.tier === 'core'),
    standard: modules.filter(m => m.tier === 'standard'),
    advanced: modules.filter(m => m.tier === 'advanced'),
    premium: modules.filter(m => m.tier === 'premium'),
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/superadmin')}
                className="text-blue-600 hover:text-blue-700 mb-2 text-sm"
              >
                ← Back to Organizations
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {organization?.name || 'Organization'} - Module Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Current Tier: <span className="font-semibold capitalize">{organization?.tier}</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              ⚠️ {error} - Showing cached data. Backend may not be connected.
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading modules...</div>
        ) : (
          <div className="space-y-8">
            {/* License Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Total Active</div>
                <div className="text-2xl font-bold text-green-600">
                  {modules.filter(m => m.isActive).length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">🕐 Trial Modules</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {modules.filter(m => m.status === 'trial').length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">⚠️ Expiring Soon</div>
                <div className="text-2xl font-bold text-red-600">
                  {modules.filter(m =>
                    m.expiresAt &&
                    new Date(m.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
                    new Date(m.expiresAt) > new Date()
                  ).length}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Expired</div>
                <div className="text-2xl font-bold text-red-600">
                  {modules.filter(m => m.status === 'expired' || (m.expiresAt && new Date(m.expiresAt) < new Date())).length}
                </div>
              </div>
            </div>

            {/* Core Modules */}
            {groupedModules.core.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Core Modules (Always Active)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedModules.core.map((module) => (
                    <ModuleCard key={module.moduleCode} module={module} />
                  ))}
                </div>
              </div>
            )}

            {/* Standard Modules */}
            {groupedModules.standard.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Standard Modules (Tier 1 - Professional)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedModules.standard.map((module) => (
                    <ModuleCard
                      key={module.moduleCode}
                      module={module}
                      onActivate={handleActivateModule}
                      onDeactivate={handleDeactivateModule}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Modules */}
            {groupedModules.advanced.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Advanced Modules (Tier 2 - Enterprise)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedModules.advanced.map((module) => (
                    <ModuleCard
                      key={module.moduleCode}
                      module={module}
                      onActivate={handleActivateModule}
                      onDeactivate={handleDeactivateModule}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Premium Modules */}
            {groupedModules.premium.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Premium Modules (Tier 3 - Enterprise Plus)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedModules.premium.map((module) => (
                    <ModuleCard
                      key={module.moduleCode}
                      module={module}
                      onActivate={handleActivateModule}
                      onDeactivate={handleDeactivateModule}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function ModuleCard({
  module,
  onActivate,
  onDeactivate,
}: {
  module: Module;
  onActivate?: (code: string) => void;
  onDeactivate?: (code: string) => void;
}) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'core': return 'bg-gray-100 text-gray-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 border-2 ${module.isActive ? 'border-green-500' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{module.name}</h3>
        {module.isActive ? (
          <span className="text-green-600 text-xl">✓</span>
        ) : (
          <span className="text-gray-400 text-xl">🔒</span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-3">{module.description}</p>
      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTierColor(module.tier)} mb-3`}>
        {module.tier}
      </span>
      {module.status === 'trial' && (
        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 ml-2">
          🕐 Trial
        </span>
      )}
      {module.status === 'expired' && (
        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 ml-2">
          ⚠️ Expired
        </span>
      )}
      {module.expiresAt && (
        <p className={`text-xs mb-3 ${
          new Date(module.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            ? 'text-red-600 font-semibold'
            : 'text-gray-500'
        }`}>
          {module.status === 'trial' ? '🕐 Trial expires: ' : '📅 Expires: '}
          {new Date(module.expiresAt).toLocaleDateString()}
          {new Date(module.expiresAt) < new Date() && ' (EXPIRED)'}
          {new Date(module.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
           new Date(module.expiresAt) > new Date() &&
           ' (Expiring soon!)'}
        </p>
      )}
      <div className="mt-4 pt-3 border-t border-gray-200">
        {module.tier === 'core' ? (
          <span className="text-xs text-gray-500">Always Active</span>
        ) : module.isActive ? (
          <button
            onClick={() => onDeactivate?.(module.moduleCode)}
            className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
          >
            Deactivate
          </button>
        ) : (
          <button
            onClick={() => onActivate?.(module.moduleCode)}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Activate
          </button>
        )}
      </div>
    </div>
  );
}
