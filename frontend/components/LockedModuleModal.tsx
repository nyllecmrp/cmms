import React from 'react';
import Modal from './Modal';

interface ModuleInfo {
  code: string;
  name: string;
  description: string;
  features: string[];
  tier: string;
  benefits: string;
}

const MODULE_INFO: Record<string, ModuleInfo> = {
  preventive_maintenance: {
    code: 'preventive_maintenance',
    name: 'Preventive Maintenance',
    description: 'Schedule and automate routine maintenance to prevent equipment failures',
    features: [
      'PM schedule auto-generation',
      'Recurring task templates',
      'Compliance tracking',
      'PM completion reports',
      'Calendar integration'
    ],
    tier: 'Professional',
    benefits: 'Reduce downtime by up to 40% with proactive maintenance scheduling'
  },
  inventory_management: {
    code: 'inventory_management',
    name: 'Inventory Management',
    description: 'Track spare parts, manage stock levels, and automate reordering',
    features: [
      'Multi-location inventory',
      'Stock level alerts',
      'Parts usage tracking',
      'Automated reorder points',
      'Vendor management'
    ],
    tier: 'Professional',
    benefits: 'Reduce inventory costs by 25% while ensuring parts availability'
  },
  predictive_maintenance: {
    code: 'predictive_maintenance',
    name: 'Predictive Maintenance',
    description: 'Use AI and IoT to predict failures before they happen',
    features: [
      'Real-time condition monitoring',
      'Anomaly detection',
      'Failure prediction algorithms',
      'Integration with 50+ IoT sensors',
      'AI-powered insights'
    ],
    tier: 'Enterprise',
    benefits: 'Reduce downtime by up to 50% with predictive analytics'
  },
  calibration_management: {
    code: 'calibration_management',
    name: 'Calibration Management',
    description: 'Track instrument calibration schedules and maintain compliance',
    features: [
      'Calibration scheduling',
      'Certificate management',
      'Compliance alerts',
      'Calibration history',
      'Regulatory reporting'
    ],
    tier: 'Enterprise',
    benefits: 'Ensure regulatory compliance and instrument accuracy'
  }
};

interface LockedModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleCode: string;
  onRequestTrial?: () => void;
  onUpgrade?: () => void;
}

export default function LockedModuleModal({
  isOpen,
  onClose,
  moduleCode,
  onRequestTrial,
  onUpgrade
}: LockedModuleModalProps) {
  const moduleInfo = MODULE_INFO[moduleCode];

  if (!moduleInfo) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{moduleInfo.name}</h2>
        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mb-4">
          {moduleInfo.tier} Tier
        </div>
      </div>

      <div className="my-6">
        <p className="text-gray-700 text-center mb-6">
          {moduleInfo.description}
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 font-medium">
            ✓ {moduleInfo.benefits}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 mb-3">Key Features:</h3>
          {moduleInfo.features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-gray-600 text-sm text-center">
          This module is not included in your current plan.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => {
            onRequestTrial?.();
            onClose();
          }}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
        >
          Start 30-Day Free Trial
        </button>
        <button
          onClick={() => {
            onUpgrade?.();
            onClose();
          }}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Upgrade Plan
        </button>
      </div>

      <div className="mt-4 flex justify-center gap-4 text-sm">
        <button className="text-blue-600 hover:text-blue-800">
          Schedule Demo
        </button>
        <button className="text-blue-600 hover:text-blue-800">
          Learn More
        </button>
      </div>
    </Modal>
  );
}
