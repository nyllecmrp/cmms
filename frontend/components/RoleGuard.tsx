'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessModule } from '@/lib/rolePermissions';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredModule?: string;
  fallbackPath?: string;
  showUnauthorized?: boolean;
}

/**
 * RoleGuard - Protects pages based on user role and module access
 * Usage: Wrap page content with this component
 */
export default function RoleGuard({
  children,
  requiredModule,
  fallbackPath = '/dashboard',
  showUnauthorized = false,
}: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    // If no user, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    // If no module required, allow access
    if (!requiredModule) {
      setHasAccess(true);
      setChecking(false);
      return;
    }

    // Check if user's role has access to this module
    const roleHasAccess = canAccessModule(user.roleId || null, requiredModule);

    if (!roleHasAccess) {
      if (showUnauthorized) {
        setHasAccess(false);
        setChecking(false);
      } else {
        // Redirect to fallback
        router.push(fallbackPath);
      }
      return;
    }

    setHasAccess(true);
    setChecking(false);
  }, [user, loading, requiredModule, router, fallbackPath, showUnauthorized]);

  // Still checking auth or access
  if (loading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // User doesn't have access
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            Your role does not have permission to access this module.
            {requiredModule && (
              <span className="block mt-2 text-sm">
                Required module: <span className="font-semibold">{requiredModule}</span>
              </span>
            )}
          </p>
          <button
            onClick={() => router.push(fallbackPath)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // User has access, render children
  return <>{children}</>;
}

