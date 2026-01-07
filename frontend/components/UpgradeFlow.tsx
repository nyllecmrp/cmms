'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface UpgradeFlowProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: string;
}

const TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₱3,500',
    perUser: '₱250/user',
    description: 'Perfect for small teams getting started with CMMS',
    features: [
      'User Management',
      'Basic Asset Management',
      'Work Order Management',
      'Mobile App (Basic)',
      'Basic Reporting',
      'Up to 10 users',
      'Email Support',
    ],
    color: 'blue',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '₱8,000',
    perUser: '₱400/user',
    description: 'For growing operations needing advanced features',
    features: [
      'Everything in Starter, plus:',
      'Preventive Maintenance',
      'Inventory Management',
      'Scheduling & Planning',
      'Advanced Assets & Work Orders',
      'Document Management',
      'Meter Reading',
      '10-50 users',
      'Priority Email Support',
    ],
    color: 'purple',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '₱15,000',
    perUser: '₱600/user',
    description: 'Comprehensive solution for large organizations',
    features: [
      'Everything in Professional, plus:',
      'Predictive Maintenance',
      'Purchasing & Procurement',
      'Advanced Analytics & BI',
      'Safety & Compliance',
      'Calibration Management',
      'Project Management',
      'Energy Management',
      '50-200 users',
      'Phone & Email Support',
    ],
    color: 'green',
  },
  {
    id: 'enterprise_plus',
    name: 'Enterprise Plus',
    price: 'Custom',
    perUser: 'Custom pricing',
    description: 'Fully customized solution for complex enterprises',
    features: [
      'Everything in Enterprise, plus:',
      'Vendor Management',
      'Audit & Quality',
      'Integration Hub & API',
      'Multi-tenancy',
      'Advanced Workflow Engine',
      'AI-Powered Optimization',
      '200+ users',
      'Dedicated Success Manager',
      '24/7 Support',
    ],
    color: 'yellow',
  },
];

export default function UpgradeFlow({ isOpen, onClose, currentTier = 'starter' }: UpgradeFlowProps) {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [userCount, setUserCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedTier(null);
      setSubmitted(false);
    }
  }, [isOpen]);

  const calculatePrice = (tier: typeof TIERS[0]) => {
    if (tier.id === 'enterprise_plus') return 'Contact Sales';

    const basePrice = parseInt(tier.price.replace(/[₱,]/g, ''));
    const perUserPrice = parseInt(tier.perUser.replace(/[₱,\/user]/g, ''));
    const total = basePrice + (userCount * perUserPrice);

    return `₱${total.toLocaleString()}/month`;
  };

  const handleUpgradeRequest = async () => {
    if (!user || !selectedTier) return;

    setLoading(true);
    try {
      await api.createModuleRequest({
        organizationId: user.organizationId,
        requestedById: user.id,
        moduleCode: 'tier_upgrade',
        requestType: 'upgrade',
        justification: `Upgrade to ${selectedTier} tier for ${userCount} users`,
      });

      setSubmitted(true);
    } catch (error: any) {
      alert(`Failed to submit upgrade request: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
          {!submitted ? (
            <>
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Upgrade Your Plan</h2>
                    <p className="text-gray-600 mt-1">Choose the perfect plan for your organization</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Tiers Grid */}
              <div className="px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {TIERS.map((tier) => {
                    const isCurrentTier = tier.id === currentTier;
                    const isSelected = tier.id === selectedTier;

                    return (
                      <div
                        key={tier.id}
                        className={`relative rounded-lg border-2 p-6 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 shadow-lg scale-105'
                            : isCurrentTier
                            ? 'border-gray-400 bg-gray-50'
                            : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                        onClick={() => !isCurrentTier && setSelectedTier(tier.id)}
                      >
                        {tier.popular && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <span className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              Most Popular
                            </span>
                          </div>
                        )}

                        {isCurrentTier && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              Current Plan
                            </span>
                          </div>
                        )}

                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{tier.description}</p>
                        </div>

                        <div className="mb-6">
                          <div className="flex items-baseline">
                            <span className="text-3xl font-bold text-gray-900">{tier.price}</span>
                            {tier.id !== 'enterprise_plus' && (
                              <span className="text-gray-600 ml-2">/month</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{tier.perUser}</p>
                        </div>

                        <ul className="space-y-3 mb-6">
                          {tier.features.map((feature, index) => (
                            <li key={index} className="flex items-start text-sm">
                              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className={feature.startsWith('Everything') ? 'font-semibold text-gray-700' : 'text-gray-600'}>
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {!isCurrentTier && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTier(tier.id);
                            }}
                            className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select Plan'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* User Count Selector */}
                {selectedTier && selectedTier !== 'enterprise_plus' && (
                  <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Configure Your Plan</h4>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Users: <span className="text-blue-600 font-bold">{userCount}</span>
                      </label>
                      <input
                        type="range"
                        min="3"
                        max="200"
                        value={userCount}
                        onChange={(e) => setUserCount(parseInt(e.target.value))}
                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>3 users</span>
                        <span>200 users</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-blue-300">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700">Base Price:</span>
                        <span className="font-semibold">{TIERS.find(t => t.id === selectedTier)?.price}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700">Users ({userCount} × {TIERS.find(t => t.id === selectedTier)?.perUser}):</span>
                        <span className="font-semibold">
                          ₱{(userCount * parseInt(TIERS.find(t => t.id === selectedTier)?.perUser.replace(/[₱,\/user]/g, '') || '0')).toLocaleString()}
                        </span>
                      </div>
                      <div className="border-t border-gray-300 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">Total Monthly:</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {calculatePrice(TIERS.find(t => t.id === selectedTier)!)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Save 17% with annual billing</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                {selectedTier && (
                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={onClose}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpgradeRequest}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Submitting...' : 'Request Upgrade'}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Success State */
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Upgrade Request Submitted!</h3>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Thank you for your interest in upgrading to the{' '}
                <span className="font-semibold text-blue-600">
                  {TIERS.find(t => t.id === selectedTier)?.name}
                </span>{' '}
                plan. Our sales team will contact you within 24 hours to finalize the details and process your upgrade.
              </p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
