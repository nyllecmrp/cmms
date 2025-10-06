import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
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
  constructor(private prisma: PrismaService) {}

  /**
   * Get all modules with their licensing status for an organization
   */
  async getOrganizationModules(organizationId: string): Promise<ModuleLicenseInfo[]> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        moduleLicenses: true,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const licenseMap = new Map(
      organization.moduleLicenses.map((license) => [license.moduleCode, license]),
    );

    return Object.values(MODULE_DEFINITIONS).map((moduleDef) => {
      const license = licenseMap.get(moduleDef.code);
      const isCore = CORE_MODULES.includes(moduleDef.code as ModuleCode);
      const isActive =
        isCore ||
        (license?.status === ModuleStatus.ACTIVE &&
          (!license.expiresAt || new Date(license.expiresAt) > new Date()));

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

    const license = await this.prisma.moduleLicense.findUnique({
      where: {
        organizationId_moduleCode: {
          organizationId,
          moduleCode,
        },
      },
    });

    if (!license || license.status !== ModuleStatus.ACTIVE) {
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
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
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

    // Create or update license
    const license = await this.prisma.moduleLicense.upsert({
      where: {
        organizationId_moduleCode: {
          organizationId,
          moduleCode,
        },
      },
      create: {
        organizationId,
        moduleCode,
        status: ModuleStatus.ACTIVE,
        tierLevel: moduleDef.tier,
        expiresAt,
        maxUsers,
        usageLimits: usageLimits ? JSON.stringify(usageLimits) : null,
        activatedById,
      },
      update: {
        status: ModuleStatus.ACTIVE,
        expiresAt,
        maxUsers,
        usageLimits: usageLimits ? JSON.stringify(usageLimits) : null,
        activatedById,
        activatedAt: new Date(),
      },
    });

    // Log activation
    await this.prisma.moduleAccessLog.create({
      data: {
        organizationId,
        userId: activatedById,
        moduleCode,
        action: 'activated',
      },
    });

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

    const license = await this.prisma.moduleLicense.findUnique({
      where: {
        organizationId_moduleCode: {
          organizationId,
          moduleCode,
        },
      },
    });

    if (!license) {
      throw new NotFoundException('Module license not found');
    }

    // Update license status
    await this.prisma.moduleLicense.update({
      where: {
        organizationId_moduleCode: {
          organizationId,
          moduleCode,
        },
      },
      data: {
        status: ModuleStatus.INACTIVE,
      },
    });

    // Log deactivation
    await this.prisma.moduleAccessLog.create({
      data: {
        organizationId,
        userId: deactivatedById,
        moduleCode,
        action: 'deactivated',
      },
    });

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
    await this.prisma.organization.update({
      where: { id: organizationId },
      data: { tier },
    });

    return results;
  }

  /**
   * Start a trial for a module
   */
  async startTrial(organizationId: string, moduleCode: ModuleCode, userId: string, days = 30) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const license = await this.prisma.moduleLicense.upsert({
      where: {
        organizationId_moduleCode: {
          organizationId,
          moduleCode,
        },
      },
      create: {
        organizationId,
        moduleCode,
        status: ModuleStatus.TRIAL,
        tierLevel: MODULE_DEFINITIONS[moduleCode].tier,
        expiresAt,
        activatedById: userId,
      },
      update: {
        status: ModuleStatus.TRIAL,
        expiresAt,
        activatedAt: new Date(),
      },
    });

    return license;
  }

  /**
   * Get module usage statistics
   */
  async getModuleUsageStats(organizationId: string, moduleCode?: string) {
    const where: any = { organizationId };
    if (moduleCode) {
      where.moduleCode = moduleCode;
    }

    const usage = await this.prisma.moduleUsageTracking.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 30, // Last 30 days
    });

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

    // Note: SQLite doesn't support composite unique constraints well
    // For now, use findFirst + create/update pattern
    const existing = await this.prisma.moduleUsageTracking.findFirst({
      where: {
        organizationId,
        moduleCode,
        date: today,
      },
    });

    if (existing) {
      return this.prisma.moduleUsageTracking.update({
        where: { id: existing.id },
        data: metrics,
      });
    } else {
      return this.prisma.moduleUsageTracking.create({
        data: {
          organizationId,
          moduleCode,
          date: today,
          ...metrics,
        },
      });
    }
  }
}
