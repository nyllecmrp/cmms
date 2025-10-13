'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Module {
  code: string;
  name: string;
  description: string;
  tier: string;
  features: string[];
  benefits: string;
}

const AVAILABLE_MODULES: Module[] = [
  {
    code: 'preventive_maintenance',
    name: 'Preventive Maintenance',
    description: 'Schedule and automate routine maintenance to prevent equipment failures',
    tier: 'Professional',
    features: [
      'PM schedule auto-generation',
      'Recurring task templates',
      'Compliance tracking',
      'PM completion reports',
      'Calendar integration'
    ],
    benefits: 'Reduce downtime by up to 40% with proactive maintenance scheduling'
  },
  {
    code: 'inventory_management',
    name: 'Inventory Management',
    description: 'Track spare parts, manage stock levels, and automate reordering',
    tier: 'Professional',
    features: [
      'Multi-location inventory',
      'Stock level alerts',
      'Parts usage tracking',
      'Automated reorder points',
      'Vendor management'
    ],
    benefits: 'Reduce inventory costs by 25% while ensuring parts availability'
  },
  {
    code: 'predictive_maintenance',
    name: 'Predictive Maintenance',
    description: 'Use AI and IoT to predict failures before they happen',
    tier: 'Enterprise',
    features: [
      'Real-time condition monitoring',
      'Anomaly detection',
      'Failure prediction algorithms',
      'Integration with 50+ IoT sensors',
      'AI-powered insights'
    ],
    benefits: 'Reduce downtime by up to 50% with predictive analytics'
  },
  {
    code: 'calibration_management',
    name: 'Calibration Management',
    description: 'Track instrument calibration schedules and maintain compliance',
    tier: 'Enterprise',
    features: [
      'Calibration scheduling',
      'Certificate management',
      'Compliance alerts',
      'Calibration history',
      'Regulatory reporting'
    ],
    benefits: 'Ensure regulatory compliance and instrument accuracy'
  },
  {
    code: 'mobile_cmms',
    name: 'Mobile CMMS',
    description: 'Access CMMS features from iOS and Android devices',
    tier: 'Professional',
    features: [
      'iOS and Android apps',
      'Offline mode',
      'Barcode scanning',
      'Photo attachments',
      'Push notifications'
    ],
    benefits: 'Enable technicians to work from anywhere, anytime'
  },
  {
    code: 'reports_analytics',
    name: 'Reports & Analytics',
    description: 'Advanced reporting and data visualization tools',
    tier: 'Advanced',
    features: [
      '50+ pre-built reports',
      'Custom report builder',
      'Interactive dashboards',
      'Data export to Excel/PDF',
      'Scheduled report delivery'
    ],
    benefits: 'Make data-driven decisions with powerful analytics'
  },
  {
    code: 'enterprise_api',
    name: 'Enterprise API',
    description: 'Integrate CMMS with your existing systems',
    tier: 'Enterprise Plus',
    features: [
      'RESTful API access',
      'Webhook support',
      'Custom integrations',
      'SSO/SAML authentication',
      'Dedicated support'
    ],
    benefits: 'Seamlessly connect CMMS with ERP, SCADA, and other systems'
  }
];

export default function ModulesPage() {
  const router = useRouter();
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [requestType, setRequestType] = useState<'trial' | 'purchase'>('trial');
  const [justification, setJustification] = useState('');
  const [expectedUsage, setExpectedUsage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitRequest = async () => {
    if (!selectedModule) return;

    setLoading(true);
    setError('');

    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      if (!user) {
        router.push('/login');
        return;
      }

      await api.createModuleRequest({
        organizationId: user.organizationId,
        requestedById: user.id,
        moduleCode: selectedModule.code,
        requestType,
        justification: justification || undefined,
        expectedUsage: expectedUsage || undefined,
      });

      alert(`${requestType === 'trial' ? 'Trial' : 'Purchase'} request submitted successfully! Our team will contact you within 24 hours.`);
      setSelectedModule(null);
      setJustification('');
      setExpectedUsage('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Modules</h1>
        <p className="text-gray-600">
          Extend your CMMS with powerful add-on modules. Start a free trial or purchase to unlock new capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AVAILABLE_MODULES.map((module) => (
          <div key={module.code} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{module.name}</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {module.tier}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4">
                {module.description}
              </p>

              <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                <p className="text-green-800 text-sm">
                  ✓ {module.benefits}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">Key Features:</p>
                <ul className="space-y-1">
                  {module.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start">
                      <span className="text-blue-600 mr-2">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                  {module.features.length > 3 && (
                    <li className="text-sm text-gray-500 ml-5">
                      +{module.features.length - 3} more features
                    </li>
                  )}
                </ul>
              </div>

              <div className="mb-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-800">
                    💡 Pricing Coming Soon
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Contact us for custom pricing
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedModule(module);
                  setRequestType('trial');
                }}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold mb-2"
              >
                Start Free Trial
              </button>

              <button
                onClick={() => {
                  setSelectedModule(module);
                  setRequestType('purchase');
                }}
                className="w-full border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition font-semibold"
              >
                Request Purchase
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Request Modal */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setSelectedModule(null)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Request {requestType === 'trial' ? 'Free Trial' : 'Purchase'}: {selectedModule.name}
                  </h3>
                  <button
                    onClick={() => setSelectedModule(null)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="trial"
                        checked={requestType === 'trial'}
                        onChange={() => setRequestType('trial')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-900">30-Day Free Trial</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="purchase"
                        checked={requestType === 'purchase'}
                        onChange={() => setRequestType('purchase')}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-900">Purchase</span>
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="justification" className="block text-sm font-medium text-gray-700 mb-2">
                    Justification (Optional)
                  </label>
                  <textarea
                    id="justification"
                    rows={3}
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Why do you need this module?"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="expectedUsage" className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Usage (Optional)
                  </label>
                  <textarea
                    id="expectedUsage"
                    rows={3}
                    value={expectedUsage}
                    onChange={(e) => setExpectedUsage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="How will you use this module?"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600">
                    {requestType === 'trial'
                      ? '✓ 30-day free trial with full access to all features'
                      : '✓ Custom pricing - Our team will contact you with a quote'
                    }
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedModule(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitRequest}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
