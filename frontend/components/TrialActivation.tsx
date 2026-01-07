'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface TrialActivationProps {
  moduleCode: string;
  moduleName: string;
  onSuccess?: () => void;
  variant?: 'button' | 'card' | 'banner';
}

export default function TrialActivation({
  moduleCode,
  moduleName,
  onSuccess,
  variant = 'button',
}: TrialActivationProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activated, setActivated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleActivateTrial = async () => {
    if (!user) {
      setError('Please log in to activate trial');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call backend to start trial
      await api.post('/module-licensing/start-trial', {
        organizationId: user.organizationId,
        moduleCode: moduleCode,
        userId: user.id,
        days: 30,
      });

      setActivated(true);

      // Refresh page after 2 seconds to show new module
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.reload();
        }
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to activate trial. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'button') {
    return (
      <div className="inline-block">
        {!activated ? (
          <button
            onClick={handleActivateTrial}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Activating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start 30-Day Trial
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center text-green-600 font-semibold">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Trial Activated! Redirecting...
          </div>
        )}
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-white border-2 border-blue-200 rounded-lg p-6 shadow-sm">
        {!activated ? (
          <>
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Try {moduleName} Free for 30 Days</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get instant access to all features. No credit card required. Cancel anytime.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Full access to all features
                  </li>
                  <li className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    No credit card required
                  </li>
                  <li className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Activate instantly
                  </li>
                </ul>
                <button
                  onClick={handleActivateTrial}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Activating Trial...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Activate 30-Day Free Trial
                    </>
                  )}
                </button>
                {error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm flex items-start">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Trial Activated!</h3>
            <p className="text-gray-600 mb-4">
              Your 30-day free trial for <strong>{moduleName}</strong> is now active.
            </p>
            <div className="animate-pulse text-blue-600">Refreshing page...</div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 shadow-lg">
        {!activated ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-white">
                <h4 className="font-bold text-lg mb-1">Try {moduleName} Free</h4>
                <p className="text-blue-100 text-sm">30 days, full features, no credit card required</p>
              </div>
            </div>
            <button
              onClick={handleActivateTrial}
              disabled={loading}
              className="ml-4 px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold whitespace-nowrap"
            >
              {loading ? 'Activating...' : 'Start Free Trial'}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center text-white">
            <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">Trial Activated! Redirecting...</span>
          </div>
        )}
        {error && (
          <div className="mt-3 bg-red-100 text-red-800 p-2 rounded text-sm">
            {error}
          </div>
        )}
      </div>
    );
  }

  return null;
}
