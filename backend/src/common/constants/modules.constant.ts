/**
 * Module Licensing Constants
 * Based on CMMS Module Licensing Framework
 */

export enum ModuleCode {
  // Core Modules (Always Enabled)
  USER_MANAGEMENT = 'user_management',
  ASSET_MANAGEMENT_BASIC = 'asset_management_basic',
  WORK_ORDER_BASIC = 'work_order_basic',
  MOBILE_BASIC = 'mobile_basic',
  BASIC_REPORTING = 'basic_reporting',

  // Standard Modules (Tier 1 - Professional)
  PREVENTIVE_MAINTENANCE = 'preventive_maintenance',
  INVENTORY_MANAGEMENT = 'inventory_management',
  SCHEDULING_PLANNING = 'scheduling_planning',
  ASSET_MANAGEMENT_ADVANCED = 'asset_management_advanced',
  WORK_ORDER_ADVANCED = 'work_order_advanced',
  DOCUMENT_MANAGEMENT = 'document_management',
  METER_READING = 'meter_reading',

  // Advanced Modules (Tier 2 - Enterprise)
  PREDICTIVE_MAINTENANCE = 'predictive_maintenance',
  PURCHASING_PROCUREMENT = 'purchasing_procurement',
  ADVANCED_ANALYTICS = 'advanced_analytics',
  SAFETY_COMPLIANCE = 'safety_compliance',
  CALIBRATION_MANAGEMENT = 'calibration_management',
  FAILURE_ANALYSIS = 'failure_analysis',
  PROJECT_MANAGEMENT = 'project_management',
  ENERGY_MANAGEMENT = 'energy_management',
  MOBILE_ADVANCED = 'mobile_advanced',

  // Premium Modules (Tier 3 - Enterprise Plus)
  VENDOR_MANAGEMENT = 'vendor_management',
  AUDIT_QUALITY = 'audit_quality',
  INTEGRATION_HUB = 'integration_hub',
  MULTI_TENANCY = 'multi_tenancy',
  ADVANCED_WORKFLOW = 'advanced_workflow',
  AI_OPTIMIZATION = 'ai_optimization',
}

export enum ModuleTier {
  CORE = 'core',
  STANDARD = 'standard',
  ADVANCED = 'advanced',
  PREMIUM = 'premium',
}

export enum SubscriptionTier {
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  ENTERPRISE_PLUS = 'enterprise_plus',
}

export enum ModuleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TRIAL = 'trial',
  EXPIRED = 'expired',
}

export interface ModuleDefinition {
  code: ModuleCode;
  name: string;
  description: string;
  tier: ModuleTier;
  dependencies?: ModuleCode[];
  features: string[];
}

export const MODULE_DEFINITIONS: Record<ModuleCode, ModuleDefinition> = {
  // Core Modules
  [ModuleCode.USER_MANAGEMENT]: {
    code: ModuleCode.USER_MANAGEMENT,
    name: 'User Management & Administration',
    description: 'User accounts, roles, permissions',
    tier: ModuleTier.CORE,
    features: ['User authentication', 'RBAC', 'User profiles'],
  },
  [ModuleCode.ASSET_MANAGEMENT_BASIC]: {
    code: ModuleCode.ASSET_MANAGEMENT_BASIC,
    name: 'Asset Management (Basic)',
    description: 'Asset registry and basic tracking',
    tier: ModuleTier.CORE,
    features: ['Asset registry', 'Basic tracking', 'Asset photos'],
  },
  [ModuleCode.WORK_ORDER_BASIC]: {
    code: ModuleCode.WORK_ORDER_BASIC,
    name: 'Work Order Management (Basic)',
    description: 'Create, assign, complete work orders',
    tier: ModuleTier.CORE,
    features: ['Create work orders', 'Assign tasks', 'Simple workflow'],
  },
  [ModuleCode.MOBILE_BASIC]: {
    code: ModuleCode.MOBILE_BASIC,
    name: 'Mobile-Responsive Web Interface',
    description: 'Access CMMS from any mobile browser',
    tier: ModuleTier.CORE,
    features: ['Responsive design', 'Mobile browser access', 'Touch-optimized UI', 'Real-time updates'],
  },
  [ModuleCode.BASIC_REPORTING]: {
    code: ModuleCode.BASIC_REPORTING,
    name: 'Basic Reporting',
    description: 'Standard reports and dashboards',
    tier: ModuleTier.CORE,
    features: ['Pre-built reports', 'Basic dashboards', 'Export to PDF/Excel'],
  },

  // Standard Modules
  [ModuleCode.PREVENTIVE_MAINTENANCE]: {
    code: ModuleCode.PREVENTIVE_MAINTENANCE,
    name: 'Preventive Maintenance',
    description: 'Scheduled maintenance and PM compliance',
    tier: ModuleTier.STANDARD,
    features: ['PM scheduling', 'Auto-generation', 'PM templates', 'Compliance tracking'],
  },
  [ModuleCode.INVENTORY_MANAGEMENT]: {
    code: ModuleCode.INVENTORY_MANAGEMENT,
    name: 'Inventory Management',
    description: 'Parts tracking and stock management',
    tier: ModuleTier.CORE,
    features: ['Parts catalog', 'Stock levels', 'Reorder points', 'Multi-location'],
  },
  [ModuleCode.SCHEDULING_PLANNING]: {
    code: ModuleCode.SCHEDULING_PLANNING,
    name: 'Scheduling & Planning',
    description: 'Calendar views and resource allocation',
    tier: ModuleTier.STANDARD,
    features: ['Calendar view', 'Drag-and-drop scheduling', 'Resource allocation'],
  },
  [ModuleCode.ASSET_MANAGEMENT_ADVANCED]: {
    code: ModuleCode.ASSET_MANAGEMENT_ADVANCED,
    name: 'Asset Management (Advanced)',
    description: 'Asset hierarchy, criticality, genealogy',
    tier: ModuleTier.STANDARD,
    features: ['Asset hierarchy', 'Criticality rating', 'Asset genealogy', 'QR codes'],
  },
  [ModuleCode.WORK_ORDER_ADVANCED]: {
    code: ModuleCode.WORK_ORDER_ADVANCED,
    name: 'Work Order Management (Advanced)',
    description: 'Approval workflows, templates, SLA tracking',
    tier: ModuleTier.STANDARD,
    features: ['Approval workflows', 'WO templates', 'SLA tracking', 'Advanced routing'],
  },
  [ModuleCode.DOCUMENT_MANAGEMENT]: {
    code: ModuleCode.DOCUMENT_MANAGEMENT,
    name: 'Document Management',
    description: 'Centralized document repository',
    tier: ModuleTier.STANDARD,
    features: ['Document repository', 'Version control', 'Document tagging'],
  },
  [ModuleCode.METER_READING]: {
    code: ModuleCode.METER_READING,
    name: 'Meter Reading',
    description: 'Usage-based maintenance triggers',
    tier: ModuleTier.STANDARD,
    features: ['Meter tracking', 'Usage-based PM', 'Meter history'],
  },

  // Advanced Modules
  [ModuleCode.PREDICTIVE_MAINTENANCE]: {
    code: ModuleCode.PREDICTIVE_MAINTENANCE,
    name: 'Predictive Maintenance',
    description: 'IoT integration and condition monitoring',
    tier: ModuleTier.ADVANCED,
    dependencies: [ModuleCode.ASSET_MANAGEMENT_ADVANCED, ModuleCode.METER_READING],
    features: ['IoT integration', 'Condition monitoring', 'ML predictions', 'Anomaly detection'],
  },
  [ModuleCode.PURCHASING_PROCUREMENT]: {
    code: ModuleCode.PURCHASING_PROCUREMENT,
    name: 'Purchasing & Procurement',
    description: 'PO management and vendor contracts',
    tier: ModuleTier.ADVANCED,
    dependencies: [ModuleCode.INVENTORY_MANAGEMENT],
    features: ['Purchase orders', 'Vendor contracts', 'Requisition workflows'],
  },
  [ModuleCode.ADVANCED_ANALYTICS]: {
    code: ModuleCode.ADVANCED_ANALYTICS,
    name: 'Advanced Analytics & BI',
    description: 'Custom dashboards and KPI tracking',
    tier: ModuleTier.ADVANCED,
    features: ['Custom dashboards', 'KPI tracking', 'Advanced visualizations', 'Report builder'],
  },
  [ModuleCode.SAFETY_COMPLIANCE]: {
    code: ModuleCode.SAFETY_COMPLIANCE,
    name: 'Safety & Compliance',
    description: 'LOTO, permits, incident tracking',
    tier: ModuleTier.ADVANCED,
    dependencies: [ModuleCode.DOCUMENT_MANAGEMENT],
    features: ['LOTO management', 'Work permits', 'Incident tracking', 'Safety audits'],
  },
  [ModuleCode.CALIBRATION_MANAGEMENT]: {
    code: ModuleCode.CALIBRATION_MANAGEMENT,
    name: 'Calibration Management',
    description: 'Instrument calibration tracking',
    tier: ModuleTier.ADVANCED,
    dependencies: [ModuleCode.ASSET_MANAGEMENT_ADVANCED, ModuleCode.DOCUMENT_MANAGEMENT],
    features: ['Calibration schedules', 'Certificate management', 'Out-of-tolerance alerts'],
  },
  [ModuleCode.FAILURE_ANALYSIS]: {
    code: ModuleCode.FAILURE_ANALYSIS,
    name: 'Failure Analysis',
    description: 'RCA and FMEA tools',
    tier: ModuleTier.ADVANCED,
    features: ['Root cause analysis', 'FMEA templates', 'Failure tracking'],
  },
  [ModuleCode.PROJECT_MANAGEMENT]: {
    code: ModuleCode.PROJECT_MANAGEMENT,
    name: 'Project Management',
    description: 'Large maintenance projects',
    tier: ModuleTier.ADVANCED,
    dependencies: [ModuleCode.WORK_ORDER_ADVANCED],
    features: ['Project planning', 'Gantt charts', 'Resource management', 'Budget tracking'],
  },
  [ModuleCode.ENERGY_MANAGEMENT]: {
    code: ModuleCode.ENERGY_MANAGEMENT,
    name: 'Energy Management',
    description: 'Utility tracking and sustainability',
    tier: ModuleTier.ADVANCED,
    dependencies: [ModuleCode.METER_READING, ModuleCode.ADVANCED_ANALYTICS],
    features: ['Utility tracking', 'Energy dashboards', 'Sustainability metrics'],
  },
  [ModuleCode.MOBILE_ADVANCED]: {
    code: ModuleCode.MOBILE_ADVANCED,
    name: 'Enhanced Mobile Features',
    description: 'Advanced mobile capabilities for field operations',
    tier: ModuleTier.CORE,
    features: ['Camera access for photos', 'Location services', 'File uploads', 'QR code scanning (planned)'],
  },

  // Premium Modules
  [ModuleCode.VENDOR_MANAGEMENT]: {
    code: ModuleCode.VENDOR_MANAGEMENT,
    name: 'Vendor Management',
    description: 'Vendor scorecards and performance tracking',
    tier: ModuleTier.PREMIUM,
    features: ['Vendor scorecards', 'Performance tracking', 'Certification management'],
  },
  [ModuleCode.AUDIT_QUALITY]: {
    code: ModuleCode.AUDIT_QUALITY,
    name: 'Audit & Quality',
    description: 'Audit management and CAPA tracking',
    tier: ModuleTier.PREMIUM,
    features: ['Audit scheduling', 'Findings management', 'CAPA tracking', 'Quality metrics'],
  },
  [ModuleCode.INTEGRATION_HUB]: {
    code: ModuleCode.INTEGRATION_HUB,
    name: 'Integration Hub & API',
    description: 'Pre-built integrations and custom API access',
    tier: ModuleTier.PREMIUM,
    features: ['ERP integration', 'Custom API access', 'Webhooks', 'Data sync'],
  },
  [ModuleCode.MULTI_TENANCY]: {
    code: ModuleCode.MULTI_TENANCY,
    name: 'Multi-tenancy Management',
    description: 'Manage multiple organizations',
    tier: ModuleTier.PREMIUM,
    features: ['White-label', 'Multi-org management', 'Cross-tenant reporting'],
  },
  [ModuleCode.ADVANCED_WORKFLOW]: {
    code: ModuleCode.ADVANCED_WORKFLOW,
    name: 'Advanced Workflow Engine',
    description: 'Custom approval chains and automation',
    tier: ModuleTier.PREMIUM,
    features: ['Visual workflow builder', 'Custom automation', 'Complex approval chains'],
  },
  [ModuleCode.AI_OPTIMIZATION]: {
    code: ModuleCode.AI_OPTIMIZATION,
    name: 'AI-Powered Optimization',
    description: 'Schedule optimization and predictive insights',
    tier: ModuleTier.PREMIUM,
    features: ['AI scheduling', 'Predictive insights', 'Optimization algorithms'],
  },
};

/**
 * Core modules that are always available (cannot be disabled)
 */
export const CORE_MODULES = [
  ModuleCode.USER_MANAGEMENT,
  ModuleCode.ASSET_MANAGEMENT_BASIC,
  ModuleCode.WORK_ORDER_BASIC,
  ModuleCode.INVENTORY_MANAGEMENT,
  ModuleCode.MOBILE_BASIC,
  ModuleCode.MOBILE_ADVANCED,
  ModuleCode.BASIC_REPORTING,
];

/**
 * Tier to modules mapping
 */
export const TIER_MODULES: Record<SubscriptionTier, ModuleCode[]> = {
  [SubscriptionTier.STARTER]: [...CORE_MODULES],
  [SubscriptionTier.PROFESSIONAL]: [
    ...CORE_MODULES,
    ModuleCode.PREVENTIVE_MAINTENANCE,
    ModuleCode.SCHEDULING_PLANNING,
    ModuleCode.ASSET_MANAGEMENT_ADVANCED,
    ModuleCode.WORK_ORDER_ADVANCED,
    ModuleCode.DOCUMENT_MANAGEMENT,
    ModuleCode.METER_READING,
  ],
  [SubscriptionTier.ENTERPRISE]: [
    ...CORE_MODULES,
    // Standard modules
    ModuleCode.PREVENTIVE_MAINTENANCE,
    ModuleCode.SCHEDULING_PLANNING,
    ModuleCode.ASSET_MANAGEMENT_ADVANCED,
    ModuleCode.WORK_ORDER_ADVANCED,
    ModuleCode.DOCUMENT_MANAGEMENT,
    ModuleCode.METER_READING,
    // Advanced modules
    ModuleCode.PREDICTIVE_MAINTENANCE,
    ModuleCode.PURCHASING_PROCUREMENT,
    ModuleCode.ADVANCED_ANALYTICS,
    ModuleCode.SAFETY_COMPLIANCE,
    ModuleCode.CALIBRATION_MANAGEMENT,
    ModuleCode.FAILURE_ANALYSIS,
    ModuleCode.PROJECT_MANAGEMENT,
    ModuleCode.ENERGY_MANAGEMENT,
  ],
  [SubscriptionTier.ENTERPRISE_PLUS]: Object.values(ModuleCode),
};
