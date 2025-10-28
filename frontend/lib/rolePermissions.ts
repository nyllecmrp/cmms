/**
 * Frontend Role-Based Module Access Control
 * Must match backend/src/common/constants/role-permissions.constant.ts
 */

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TECHNICIAN = 'technician',
  VIEWER = 'viewer',
}

export enum ModuleKey {
  // Core Modules
  MY_WORK = 'my-work',
  WORK_ORDERS = 'work-orders',
  ASSETS = 'assets',
  PREVENTIVE_MAINTENANCE = 'preventive-maintenance',
  USERS = 'users',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  
  // Advanced Modules
  WORK_ORDERS_ADVANCED = 'work-orders-advanced',
  ASSETS_ADVANCED = 'assets-advanced',
  PREDICTIVE_MAINTENANCE = 'predictive-maintenance',
  INVENTORY = 'inventory',
  PROCUREMENT = 'procurement',
  CALIBRATION = 'calibration',
  METERS = 'meters',
  DOCUMENTS = 'documents',
  SAFETY = 'safety',
  AUDIT = 'audit',
  MOBILE_ACCESS = 'mobile-access',
  MOBILE_ADVANCED = 'mobile-advanced',
  ADVANCED_REPORTING = 'advanced-reporting',
  CUSTOM_FIELDS = 'custom-fields',
  WORKFLOWS = 'workflows',
  PROJECTS = 'projects',
  VENDORS = 'vendors',
  MULTI_LOCATION = 'multi-location',
  MULTI_TENANT = 'multi-tenant',
  IOT = 'iot',
  AI_OPTIMIZATION = 'ai-optimization',
  ENERGY = 'energy',
  FAILURE_ANALYSIS = 'failure-analysis',
  INTEGRATIONS = 'integrations',
  ASSET_TRACKING = 'asset-tracking',
  SCHEDULING = 'scheduling',
  WORK_REQUESTS = 'work-requests',
}

/**
 * Role-based module access mapping
 */
const ROLE_MODULE_ACCESS: Record<UserRole, ModuleKey[] | 'all'> = {
  [UserRole.ADMIN]: 'all',
  
  [UserRole.MANAGER]: [
    ModuleKey.MY_WORK,
    ModuleKey.WORK_ORDERS,
    ModuleKey.WORK_ORDERS_ADVANCED,
    ModuleKey.ASSETS,
    ModuleKey.ASSETS_ADVANCED,
    ModuleKey.PREVENTIVE_MAINTENANCE,
    ModuleKey.PREDICTIVE_MAINTENANCE,
    ModuleKey.INVENTORY,
    ModuleKey.PROCUREMENT,
    ModuleKey.VENDORS,
    ModuleKey.USERS,
    ModuleKey.SCHEDULING,
    ModuleKey.PROJECTS,
    ModuleKey.REPORTS,
    ModuleKey.ADVANCED_REPORTING,
    ModuleKey.AUDIT,
    ModuleKey.SAFETY,
    ModuleKey.SETTINGS,
    ModuleKey.CUSTOM_FIELDS,
    ModuleKey.WORKFLOWS,
    ModuleKey.MULTI_LOCATION,
    ModuleKey.DOCUMENTS,
    ModuleKey.CALIBRATION,
    ModuleKey.METERS,
    ModuleKey.ENERGY,
    ModuleKey.FAILURE_ANALYSIS,
  ],

  [UserRole.TECHNICIAN]: [
    ModuleKey.MY_WORK,
    ModuleKey.WORK_ORDERS,
    ModuleKey.WORK_REQUESTS,
    ModuleKey.ASSETS,
    ModuleKey.PREVENTIVE_MAINTENANCE,
    ModuleKey.MOBILE_ACCESS,
    ModuleKey.MOBILE_ADVANCED,
    ModuleKey.ASSET_TRACKING,
    ModuleKey.INVENTORY,
    ModuleKey.DOCUMENTS,
    ModuleKey.SAFETY,
    ModuleKey.METERS,
    ModuleKey.CALIBRATION,
    ModuleKey.REPORTS,
  ],
  
  [UserRole.VIEWER]: [
    ModuleKey.REPORTS,
    ModuleKey.ASSETS,
    ModuleKey.WORK_ORDERS,
    ModuleKey.PREVENTIVE_MAINTENANCE,
  ],
};

/**
 * Check if a user role has access to a specific module
 */
export function canAccessModule(
  userRole: string | null,
  moduleKey: string,
): boolean {
  if (!userRole) return false;
  
  const role = userRole as UserRole;
  const allowedModules = ROLE_MODULE_ACCESS[role];
  
  // Admin has access to all modules
  if (allowedModules === 'all') {
    return true;
  }
  
  // Check if module is in the allowed list
  return allowedModules.includes(moduleKey as ModuleKey);
}

/**
 * Filter navigation items based on user role
 */
export function filterNavigationByRole(
  navigationItems: any[],
  userRole: string | null,
): any[] {
  if (!userRole) return [];
  
  // Admin sees everything
  if (userRole === UserRole.ADMIN) {
    return navigationItems;
  }
  
  // Filter items based on role permissions
  return navigationItems.filter((item) => {
    if (!item.moduleKey) return true; // No module key = always visible
    return canAccessModule(userRole, item.moduleKey);
  });
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: string | null): string {
  const roleNames: Record<string, string> = {
    admin: 'Administrator',
    manager: 'Manager',
    technician: 'Technician',
    viewer: 'Viewer',
  };
  
  return role ? roleNames[role] || role : 'Unknown';
}

/**
 * Get role color for badges
 */
export function getRoleColor(role: string | null): string {
  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800',
    manager: 'bg-blue-100 text-blue-800',
    technician: 'bg-green-100 text-green-800',
    viewer: 'bg-gray-100 text-gray-800',
  };
  
  return role ? roleColors[role] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800';
}

/**
 * Action-level permissions
 */
export interface ActionPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * Check if a user can perform a specific action
 */
export function canPerformAction(
  userRole: string | null,
  action: 'view' | 'create' | 'edit' | 'delete',
): boolean {
  if (!userRole) return false;
  
  // Admin can do everything
  if (userRole === UserRole.ADMIN) return true;
  
  // Viewer is read-only
  if (userRole === UserRole.VIEWER) {
    return action === 'view';
  }
  
  // Manager can do everything except delete (optional restriction)
  if (userRole === UserRole.MANAGER) {
    return true; // Managers have full CRUD access
  }
  
  // Technician can view, create, and edit but not delete
  if (userRole === UserRole.TECHNICIAN) {
    return action !== 'delete';
  }
  
  return false;
}

/**
 * Get all action permissions for a role
 */
export function getActionPermissions(userRole: string | null): ActionPermissions {
  return {
    canView: canPerformAction(userRole, 'view'),
    canCreate: canPerformAction(userRole, 'create'),
    canEdit: canPerformAction(userRole, 'edit'),
    canDelete: canPerformAction(userRole, 'delete'),
  };
}

/**
 * Check if user is read-only (Viewer role)
 */
export function isReadOnly(userRole: string | null): boolean {
  return userRole === UserRole.VIEWER;
}

