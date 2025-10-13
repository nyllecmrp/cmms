import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { randomBytes } from 'crypto';
import {
  ModuleCode,
  ModuleStatus,
  SubscriptionTier,
  TIER_MODULES,
  MODULE_DEFINITIONS,
  CORE_MODULES,
} from '../../common/constants/modules.constant';

export interface ActivateModuleDto {
  organizationId: string;
  moduleCode: ModuleCode;
  expiresAt?: Date;
  maxUsers?: number;
  usageLimits?: any;
  activatedById: string;
}

export interface ModuleLicenseInfo {
  moduleCode: string;
  name: string;
  description: string;
  tier: string;
  status: string;
  isLicensed: boolean;
  isActive: boolean;
  expiresAt?: Date;
  features: string[];
  dependencies?: string[];
}

@Injectable()
export class ModuleLicensingService {
  constructor(private db: DatabaseService) {}

  /**
   * Get all modules with their licensing status for an organization
   */
  async getOrganizationModules(organizationId: string): Promise<ModuleLicenseInfo[]> {
    const organizations = await this.db.query(
      'SELECT * FROM Organization WHERE id = ?',
      [organizationId]
    );

    if (organizations.length === 0) {
      throw new NotFoundException('Organization not found');
    }

    const licenses = await this.db.query(
      'SELECT * FROM ModuleLicense WHERE organizationId = ?',
      [organizationId]
    );

    const licenseMap = new Map(
      licenses.map((license) => [license.moduleCode, license]),
    );

    return Object.values(MODULE_DEFINITIONS).map((moduleDef) => {
      const license: any = licenseMap.get(moduleDef.code);
      const isCore = CORE_MODULES.includes(moduleDef.code as ModuleCode);
      const isActive =
        isCore ||
        (license?.status === ModuleStatus.ACTIVE &&
          (!license?.expiresAt || new Date(license.expiresAt) > new Date()));

      return {
        moduleCode: moduleDef.code,
        name: moduleDef.name,
        description: moduleDef.description,
        tier: moduleDef.tier,
        status: license?.status || (isCore ? ModuleStatus.ACTIVE : ModuleStatus.INACTIVE),
        isLicensed: isCore || !!license,
        isActive,
        expiresAt: license?.expiresAt || undefined,
        features: moduleDef.features,
        dependencies: moduleDef.dependencies,
      };
    });
  }

  /**
   * Check if organization has access to a specific module
   */
  async hasModuleAccess(organizationId: string, moduleCode: ModuleCode): Promise<boolean> {
    // Core modules are always accessible
    if (CORE_MODULES.includes(moduleCode)) {
      return true;
    }

    const licenses = await this.db.query(
      'SELECT * FROM ModuleLicense WHERE organizationId = ? AND moduleCode = ?',
      [organizationId, moduleCode]
    );

    if (licenses.length === 0) {
      return false;
    }

    const license = licenses[0];

    if (license.status !== ModuleStatus.ACTIVE) {
      return false;
    }

    // Check expiration
    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Activate a module for an organization (Superadmin only)
   */
  async activateModule(data: ActivateModuleDto) {
    const { organizationId, moduleCode, expiresAt, maxUsers, usageLimits, activatedById } = data;

    // Validate organization exists
    const organizations = await this.db.query(
      'SELECT * FROM Organization WHERE id = ?',
      [organizationId]
    );

    if (organizations.length === 0) {
      throw new NotFoundException('Organization not found');
    }

    // Check dependencies
    const moduleDef = MODULE_DEFINITIONS[moduleCode];
    if (moduleDef.dependencies) {
      for (const depCode of moduleDef.dependencies) {
        const hasAccess = await this.hasModuleAccess(organizationId, depCode as ModuleCode);
        if (!hasAccess) {
          throw new BadRequestException(
            `Module ${moduleCode} requires ${depCode} to be activated first`,
          );
        }
      }
    }

    // Check if license exists
    const existingLicenses = await this.db.query(
      'SELECT * FROM ModuleLicense WHERE organizationId = ? AND moduleCode = ?',
      [organizationId, moduleCode]
    );

    let license;

    if (existingLicenses.length > 0) {
      // Update existing license
      await this.db.execute(
        `UPDATE ModuleLicense
        SET status = ?, expiresAt = ?, maxUsers = ?, usageLimits = ?,
            activatedById = ?, activatedAt = datetime('now'), updatedAt = datetime('now')
        WHERE organizationId = ? AND moduleCode = ?`,
        [
          ModuleStatus.ACTIVE,
          expiresAt ? expiresAt.toISOString() : null,
          maxUsers || null,
          usageLimits ? JSON.stringify(usageLimits) : null,
          activatedById,
          organizationId,
          moduleCode,
        ]
      );

      const updatedLicenses = await this.db.query(
        'SELECT * FROM ModuleLicense WHERE organizationId = ? AND moduleCode = ?',
        [organizationId, moduleCode]
      );
      license = updatedLicenses[0];
    } else {
      // Create new license
      const id = randomBytes(16).toString('hex');
      await this.db.execute(
        `INSERT INTO ModuleLicense (
          id, organizationId, moduleCode, status, tierLevel, expiresAt, maxUsers,
          usageLimits, activatedById, activatedAt, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))`,
        [
          id,
          organizationId,
          moduleCode,
          ModuleStatus.ACTIVE,
          moduleDef.tier,
          expiresAt ? expiresAt.toISOString() : null,
          maxUsers || null,
          usageLimits ? JSON.stringify(usageLimits) : null,
          activatedById,
        ]
      );

      const newLicenses = await this.db.query(
        'SELECT * FROM ModuleLicense WHERE id = ?',
        [id]
      );
      license = newLicenses[0];
    }

    // Log activation
    const logId = randomBytes(16).toString('hex');
    await this.db.execute(
      `INSERT INTO ModuleAccessLog (
        id, organizationId, userId, moduleCode, action, createdAt
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [logId, organizationId, activatedById, moduleCode, 'activated']
    );

    return license;
  }

  /**
   * Deactivate a module for an organization (Superadmin only)
   */
  async deactivateModule(organizationId: string, moduleCode: ModuleCode, deactivatedById: string) {
    // Cannot deactivate core modules
    if (CORE_MODULES.includes(moduleCode)) {
      throw new BadRequestException('Cannot deactivate core modules');
    }

    const licenses = await this.db.query(
      'SELECT * FROM ModuleLicense WHERE organizationId = ? AND moduleCode = ?',
      [organizationId, moduleCode]
    );

    if (licenses.length === 0) {
      throw new NotFoundException('Module license not found');
    }

    // Update license status
    await this.db.execute(
      `UPDATE ModuleLicense SET status = ?, updatedAt = datetime('now')
      WHERE organizationId = ? AND moduleCode = ?`,
      [ModuleStatus.INACTIVE, organizationId, moduleCode]
    );

    // Log deactivation
    const logId = randomBytes(16).toString('hex');
    await this.db.execute(
      `INSERT INTO ModuleAccessLog (
        id, organizationId, userId, moduleCode, action, createdAt
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [logId, organizationId, deactivatedById, moduleCode, 'deactivated']
    );

    return { success: true, message: `Module ${moduleCode} deactivated` };
  }

  /**
   * Activate all modules for a subscription tier
   */
  async activateTierModules(
    organizationId: string,
    tier: SubscriptionTier,
    activatedById: string,
    expiresAt?: Date,
  ) {
    const modules = TIER_MODULES[tier];
    const results: any[] = [];

    for (const moduleCode of modules) {
      // Skip core modules as they're always active
      if (CORE_MODULES.includes(moduleCode)) {
        continue;
      }

      try {
        const license = await this.activateModule({
          organizationId,
          moduleCode,
          expiresAt,
          activatedById,
        });
        results.push({ moduleCode, success: true, license });
      } catch (error: any) {
        results.push({ moduleCode, success: false, error: error.message });
      }
    }

    // Update organization tier
    await this.db.execute(
      `UPDATE Organization SET tier = ?, updatedAt = datetime('now') WHERE id = ?`,
      [tier, organizationId]
    );

    return results;
  }

  /**
   * Start a trial for a module
   */
  async startTrial(organizationId: string, moduleCode: ModuleCode, userId: string, days = 30) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    // Check if license exists
    const existingLicenses = await this.db.query(
      'SELECT * FROM ModuleLicense WHERE organizationId = ? AND moduleCode = ?',
      [organizationId, moduleCode]
    );

    let license;

    if (existingLicenses.length > 0) {
      // Update existing license
      await this.db.execute(
        `UPDATE ModuleLicense
        SET status = ?, expiresAt = ?, activatedAt = datetime('now'), updatedAt = datetime('now')
        WHERE organizationId = ? AND moduleCode = ?`,
        [
          ModuleStatus.TRIAL,
          expiresAt.toISOString(),
          organizationId,
          moduleCode,
        ]
      );

      const updatedLicenses = await this.db.query(
        'SELECT * FROM ModuleLicense WHERE organizationId = ? AND moduleCode = ?',
        [organizationId, moduleCode]
      );
      license = updatedLicenses[0];
    } else {
      // Create new license
      const id = randomBytes(16).toString('hex');
      await this.db.execute(
        `INSERT INTO ModuleLicense (
          id, organizationId, moduleCode, status, tierLevel, expiresAt,
          activatedById, activatedAt, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))`,
        [
          id,
          organizationId,
          moduleCode,
          ModuleStatus.TRIAL,
          MODULE_DEFINITIONS[moduleCode].tier,
          expiresAt.toISOString(),
          userId,
        ]
      );

      const newLicenses = await this.db.query(
        'SELECT * FROM ModuleLicense WHERE id = ?',
        [id]
      );
      license = newLicenses[0];
    }

    return license;
  }

  /**
   * Get module usage statistics
   */
  async getModuleUsageStats(organizationId: string, moduleCode?: string) {
    let query = 'SELECT * FROM ModuleUsageTracking WHERE organizationId = ?';
    const params: any[] = [organizationId];

    if (moduleCode) {
      query += ' AND moduleCode = ?';
      params.push(moduleCode);
    }

    query += ' ORDER BY date DESC LIMIT 30';

    const usage = await this.db.query(query, params);
    return usage;
  }

  /**
   * Track module usage
   */
  async trackModuleUsage(
    organizationId: string,
    moduleCode: string,
    metrics: {
      activeUsers?: number;
      transactions?: number;
      apiCalls?: number;
      storageUsed?: number;
    },
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if record exists for today
    const existing = await this.db.query(
      `SELECT * FROM ModuleUsageTracking
      WHERE organizationId = ? AND moduleCode = ? AND date = ?`,
      [organizationId, moduleCode, today.toISOString()]
    );

    if (existing.length > 0) {
      // Update existing record
      const updates: string[] = [];
      const values: any[] = [];

      if (metrics.activeUsers !== undefined) {
        updates.push('activeUsers = ?');
        values.push(metrics.activeUsers);
      }
      if (metrics.transactions !== undefined) {
        updates.push('transactions = ?');
        values.push(metrics.transactions);
      }
      if (metrics.apiCalls !== undefined) {
        updates.push('apiCalls = ?');
        values.push(metrics.apiCalls);
      }
      if (metrics.storageUsed !== undefined) {
        updates.push('storageUsed = ?');
        values.push(metrics.storageUsed);
      }

      updates.push('updatedAt = datetime(\'now\')');
      values.push(existing[0].id);

      await this.db.execute(
        `UPDATE ModuleUsageTracking SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      const updated = await this.db.query(
        'SELECT * FROM ModuleUsageTracking WHERE id = ?',
        [existing[0].id]
      );
      return updated[0];
    } else {
      // Create new record
      const id = randomBytes(16).toString('hex');
      await this.db.execute(
        `INSERT INTO ModuleUsageTracking (
          id, organizationId, moduleCode, date, activeUsers, transactions,
          apiCalls, storageUsed, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          id,
          organizationId,
          moduleCode,
          today.toISOString(),
          metrics.activeUsers || null,
          metrics.transactions || null,
          metrics.apiCalls || null,
          metrics.storageUsed || null,
        ]
      );

      const created = await this.db.query(
        'SELECT * FROM ModuleUsageTracking WHERE id = ?',
        [id]
      );
      return created[0];
    }
  }
}
