'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface ModuleGuardProps {
  moduleCode: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ModuleGuard({ moduleCode, children, fallback }: ModuleGuardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isGracePeriod, setIsGracePeriod] = useState(false);
  const [moduleInfo, setModuleInfo] = useState<any>(null);

  useEffect(() => {
    const checkModuleAccess = async () => {
      if (!user?.organizationId) {
        setHasAccess(false);
        return;
      }

      try {
        const modules = await api.getOrganizationModules(user.organizationId) as any[];
        const module = modules.find((m: any) => m.moduleCode === moduleCode);

        if (!module) {
          setHasAccess(false);
          return;
        }

        setModuleInfo(module);

        // Check if module is active
        if (module.isActive) {
          setHasAccess(true);
          setIsGracePeriod(false);
          return;
        }

        // Check if in grace period (expired but within 7 days)
        if (module.expiresAt) {
          const now = new Date();
          const expiresAt = new Date(module.expiresAt);
          const gracePeriodEnd = new Date(expiresAt);
          gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

          if (now > expiresAt && now <= gracePeriodEnd) {
            setHasAccess(true);
            setIsGracePeriod(true);
            return;
          }
        }

        setHasAccess(false);
      } catch (error) {
        console.error('Failed to check module access:', error);
        setHasAccess(false);
      }
    };

    checkModuleAccess();
  }, [user?.organizationId, moduleCode]);

  if (hasAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking module access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Module Not Available</h2>
            <p className="text-gray-600 mb-6">
              {moduleInfo?.name || 'This module'} is not included in your current plan.
            </p>

            {moduleInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">{moduleInfo.name}</h3>
                <p className="text-sm text-blue-700 mb-3">{moduleInfo.description}</p>
                {moduleInfo.features && moduleInfo.features.length > 0 && (
                  <ul className="text-left text-sm text-blue-800 space-y-1">
                    {moduleInfo.features.slice(0, 3).map((feature: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  try {
                    await api.createModuleRequest({
                      organizationId: user!.organizationId,
                      requestedById: user!.id,
                      moduleCode: moduleCode,
                      requestType: 'trial',
                      justification: '30-day free trial request',
                    });
                    alert('Trial request submitted! We will contact you within 24 hours.');
                  } catch (error) {
                    alert('Failed to submit trial request. Please try again.');
                  }
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Free Trial
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.createModuleRequest({
                      organizationId: user!.organizationId,
                      requestedById: user!.id,
                      moduleCode: moduleCode,
                      requestType: 'purchase',
                      justification: 'Purchase request for module',
                    });
                    alert('Purchase request submitted! Our sales team will contact you within 24 hours.');
                  } catch (error) {
                    alert('Failed to submit purchase request. Please try again.');
                  }
                }}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Upgrade Plan
              </button>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 w-full text-gray-600 hover:text-gray-800 text-sm"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isGracePeriod) {
    return (
      <div className="min-h-screen">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                License Expired - Read-Only Mode
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Your license for {moduleInfo?.name} has expired. You have read-only access during the 7-day grace period.
                  Please renew your subscription to restore full access.
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={async () => {
                    try {
                      await api.createModuleRequest({
                        organizationId: user!.organizationId,
                        requestedById: user!.id,
                        moduleCode: moduleCode,
                        requestType: 'renewal',
                        justification: 'License renewal request',
                      });
                      alert('Renewal request submitted! Our team will contact you shortly.');
                    } catch (error) {
                      alert('Failed to submit renewal request. Please try again.');
                    }
                  }}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                >
                  Renew License
                </button>
              </div>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
