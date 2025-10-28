'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface TrialStatus {
  isTrial: boolean;
  tier: string;
  hasExpiration?: boolean;
  expiresAt?: string;
  daysRemaining?: number;
  isExpired?: boolean;
  showWarning?: boolean;
}

export default function TrialBanner() {
  const { user } = useAuth();
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchTrialStatus = async () => {
      if (!user?.organizationId || user.isSuperAdmin) return;

      try {
        const status: any = await api.getTrialStatus(user.organizationId);
        setTrialStatus(status);
      } catch (error) {
        console.error('Failed to fetch trial status:', error);
      }
    };

    fetchTrialStatus();
  }, [user?.organizationId, user?.isSuperAdmin]);

  // Don't show if not trial, no user, or dismissed
  if (!trialStatus?.isTrial || dismissed || !user || user.isSuperAdmin) {
    return null;
  }

  // Trial expired
  if (trialStatus.isExpired) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Trial Period Expired
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                Your 15-day free trial has ended. To continue using CMMS, please upgrade to a paid plan.
                Contact our sales team or visit the Modules page to upgrade.
              </p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded text-sm"
                onClick={() => window.location.href = '/dashboard/modules'}
              >
                Upgrade Now
              </button>
            </div>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={() => setDismissed(true)}
              className="inline-flex text-red-400 hover:text-red-600"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Trial warning (3 days or less)
  if (trialStatus.showWarning) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Trial Ending Soon
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Your free trial will expire in <span className="font-bold">{trialStatus.daysRemaining} day{trialStatus.daysRemaining !== 1 ? 's' : ''}</span>.
                Upgrade now to continue accessing all CMMS features without interruption.
              </p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded text-sm"
                onClick={() => window.location.href = '/dashboard/modules'}
              >
                Upgrade Now
              </button>
            </div>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={() => setDismissed(true)}
              className="inline-flex text-yellow-400 hover:text-yellow-600"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Trial active but no warning yet
  if (trialStatus.hasExpiration && trialStatus.daysRemaining !== undefined && trialStatus.daysRemaining > 3) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800">
              Free Trial Active
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                You have <span className="font-bold">{trialStatus.daysRemaining} days</span> remaining in your free trial.
                Enjoying CMMS? Upgrade anytime to keep your data and continue using all features.
              </p>
            </div>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={() => setDismissed(true)}
              className="inline-flex text-blue-400 hover:text-blue-600"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
