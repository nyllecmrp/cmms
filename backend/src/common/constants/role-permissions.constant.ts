/**
 * Role-Based Module Access Control
 * Defines which modules each role can access
 */

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TECHNICIAN = 'technician',
  VIEWER = 'viewer',
}

export enum ModuleKey {
  // Core Modules
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
 * 'all' means access to all licensed modules
 */
export const ROLE_MODULE_ACCESS: Record<UserRole, ModuleKey[] | 'all'> = {
  [UserRole.ADMIN]: 'all', // Admins have access to all modules
  
  [UserRole.MANAGER]: [
    // Core operations
    ModuleKey.WORK_ORDERS,
    ModuleKey.WORK_ORDERS_ADVANCED,
    ModuleKey.ASSETS,
    ModuleKey.ASSETS_ADVANCED,
    ModuleKey.PREVENTIVE_MAINTENANCE,
    ModuleKey.PREDICTIVE_MAINTENANCE,
    ModuleKey.INVENTORY,
    ModuleKey.PROCUREMENT,
    ModuleKey.VENDORS,
    
    // People & Organization
    ModuleKey.USERS,
    ModuleKey.SCHEDULING,
    ModuleKey.PROJECTS,
    
    // Analytics & Compliance
    ModuleKey.REPORTS,
    ModuleKey.ADVANCED_REPORTING,
    ModuleKey.AUDIT,
    ModuleKey.SAFETY,
    
    // Configuration
    ModuleKey.SETTINGS,
    ModuleKey.CUSTOM_FIELDS,
    ModuleKey.WORKFLOWS,
    ModuleKey.MULTI_LOCATION,
    
    // Advanced Features
    ModuleKey.DOCUMENTS,
    ModuleKey.CALIBRATION,
    ModuleKey.METERS,
    ModuleKey.ENERGY,
    ModuleKey.FAILURE_ANALYSIS,
  ],
  
  [UserRole.TECHNICIAN]: [
    // Core work
    ModuleKey.WORK_ORDERS,
    ModuleKey.WORK_REQUESTS,
    ModuleKey.ASSETS,
    ModuleKey.PREVENTIVE_MAINTENANCE,
    
    // Field operations
    ModuleKey.MOBILE_ACCESS,
    ModuleKey.MOBILE_ADVANCED,
    ModuleKey.ASSET_TRACKING,
    
    // Supporting modules
    ModuleKey.INVENTORY,
    ModuleKey.DOCUMENTS,
    ModuleKey.SAFETY,
    ModuleKey.METERS,
    ModuleKey.CALIBRATION,
    
    // Read-only access
    ModuleKey.REPORTS,
  ],
  
  [UserRole.VIEWER]: [
    // Read-only access
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
  userRole: UserRole,
  moduleKey: ModuleKey,
): boolean {
  // If no role provided, deny access
  if (!userRole) {
    return false;
  }
  
  const allowedModules = ROLE_MODULE_ACCESS[userRole];
  
  // If role not found in mapping, deny access
  if (!allowedModules) {
    return false;
  }
  
  // Admin has access to all modules
  if (allowedModules === 'all') {
    return true;
  }
  
  // Check if module is in the allowed list
  return allowedModules.includes(moduleKey);
}

/**
 * Get all modules accessible by a role
 */
export function getAccessibleModules(userRole: UserRole): ModuleKey[] | 'all' {
  return ROLE_MODULE_ACCESS[userRole];
}

/**
 * Filter modules based on user role and organization licensing
 */
export function filterModulesByRoleAndLicense(
  userRole: UserRole,
  licensedModules: string[],
): string[] {
  const accessibleModules = ROLE_MODULE_ACCESS[userRole];
  
  // Admin has access to all licensed modules
  if (accessibleModules === 'all') {
    return licensedModules;
  }
  
  // Filter licensed modules by role permissions
  return licensedModules.filter((module) =>
    accessibleModules.includes(module as ModuleKey),
  );
}

