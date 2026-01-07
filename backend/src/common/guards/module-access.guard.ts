import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { canAccessModule, ModuleKey, UserRole } from '../constants/role-permissions.constant';
import { ModuleLicensingService } from '../../modules/module-licensing/module-licensing.service';
import { ModuleCode, ModuleStatus, CORE_MODULES } from '../constants/modules.constant';

export const REQUIRED_MODULE_KEY = 'requiredModule';
export const ALLOW_GRACE_PERIOD_KEY = 'allowGracePeriod';

export const RequireModule = (module: ModuleKey | ModuleCode) =>
  SetMetadata(REQUIRED_MODULE_KEY, module);

export const AllowGracePeriod = () =>
  SetMetadata(ALLOW_GRACE_PERIOD_KEY, true);

@Injectable()
export class ModuleAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private moduleLicensingService: ModuleLicensingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredModule = this.reflector.getAllAndOverride<ModuleKey | ModuleCode>(
      REQUIRED_MODULE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const allowGracePeriod = this.reflector.getAllAndOverride<boolean>(
      ALLOW_GRACE_PERIOD_KEY,
      [context.getHandler(), context.getClass()],
    ) || false;

    if (!requiredModule) {
      // No module requirement specified, allow access
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Superadmins have access to all modules
    if (user.isSuperAdmin) {
      return true;
    }

    const organizationId = user.organizationId;
    if (!organizationId) {
      throw new ForbiddenException('Organization not found');
    }

    // Check role-based access first
    const userRole = (user.roleId || user.role) as UserRole;
    if (!userRole) {
      throw new ForbiddenException('User role not found');
    }

    if (!canAccessModule(userRole, requiredModule as ModuleKey)) {
      throw new ForbiddenException(
        `Your role (${userRole}) does not have access to the ${requiredModule} module`,
      );
    }

    // Check module licensing
    const moduleCode = this.mapModuleKeyToCode(requiredModule);

    // Core modules are always accessible
    if (CORE_MODULES.includes(moduleCode as ModuleCode)) {
      return true;
    }

    // Check if organization has license
    const hasAccess = await this.moduleLicensingService.hasModuleAccess(
      organizationId,
      moduleCode as ModuleCode,
    );

    if (hasAccess) {
      // Track module usage
      await this.trackModuleUsage(organizationId, moduleCode, user.id);
      return true;
    }

    // Check if in grace period (for GET/read-only operations)
    if (allowGracePeriod || request.method === 'GET') {
      const inGracePeriod = await this.checkGracePeriod(organizationId, moduleCode);

      if (inGracePeriod) {
        // Allow read-only access during grace period
        if (request.method !== 'GET') {
          throw new ForbiddenException({
            error: 'Module license expired',
            message: `The ${requiredModule} module license has expired. You have read-only access during the grace period.`,
            gracePeriod: true,
            upgradeUrl: '/pricing',
            contactSupport: true,
          });
        }
        return true;
      }
    }

    // No access - module not licensed
    throw new ForbiddenException({
      error: 'Module not licensed',
      message: `The ${requiredModule} module is not available in your current plan.`,
      upgradeUrl: '/pricing',
      contactSupport: true,
    });
  }

  private mapModuleKeyToCode(moduleKey: ModuleKey | ModuleCode): string {
    // If already a ModuleCode, return as-is
    if (Object.values(ModuleCode).includes(moduleKey as ModuleCode)) {
      return moduleKey;
    }

    // Map ModuleKey to ModuleCode
    const mapping: Record<string, ModuleCode> = {
      'assets': ModuleCode.ASSET_MANAGEMENT_BASIC,
      'work-orders': ModuleCode.WORK_ORDER_BASIC,
      'preventive-maintenance': ModuleCode.PREVENTIVE_MAINTENANCE,
      'inventory': ModuleCode.INVENTORY_MANAGEMENT,
      'purchasing': ModuleCode.PURCHASING_PROCUREMENT,
      'analytics': ModuleCode.ADVANCED_ANALYTICS,
    };

    return mapping[moduleKey] || moduleKey;
  }

  private async checkGracePeriod(organizationId: string, moduleCode: string): Promise<boolean> {
    try {
      const modules = await this.moduleLicensingService.getOrganizationModules(organizationId);
      const module = modules.find(m => m.moduleCode === moduleCode);

      if (!module || !module.expiresAt) {
        return false;
      }

      const now = new Date();
      const expiresAt = new Date(module.expiresAt);
      const gracePeriodEnd = new Date(expiresAt);
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7); // 7-day grace period

      // Check if current date is within grace period
      return now > expiresAt && now <= gracePeriodEnd;
    } catch (error) {
      return false;
    }
  }

  private async trackModuleUsage(organizationId: string, moduleCode: string, userId: string) {
    try {
      // Track API call
      await this.moduleLicensingService.trackModuleUsage(
        organizationId,
        moduleCode,
        { apiCalls: 1 },
      );

      // Log access
      // This is already handled in trackModuleUsage through ModuleAccessLog
    } catch (error) {
      // Don't fail the request if tracking fails
      console.error('Failed to track module usage:', error);
    }
  }
}
