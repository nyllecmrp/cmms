import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleCode, CORE_MODULES } from '../constants/modules.constant';
import { REQUIRE_MODULE_KEY } from '../decorators/require-module.decorator';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Guard to check if user's organization has access to a specific module
 */
@Injectable()
export class ModuleAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredModule = this.reflector.getAllAndOverride<ModuleCode>(
      REQUIRE_MODULE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no module requirement, allow access
    if (!requiredModule) {
      return true;
    }

    // Core modules are always accessible
    if (CORE_MODULES.includes(requiredModule)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assumes authentication guard has already run

    if (!user || !user.organizationId) {
      throw new ForbiddenException('User not authenticated or not associated with an organization');
    }

    // Check if module is licensed and active
    const license = await this.prisma.moduleLicense.findUnique({
      where: {
        organizationId_moduleCode: {
          organizationId: user.organizationId,
          moduleCode: requiredModule,
        },
      },
    });

    if (!license || license.status !== 'active') {
      // Log access attempt
      await this.logAccessAttempt(
        user.organizationId,
        user.id,
        requiredModule,
        'denied',
        request,
      );

      throw new ForbiddenException({
        error: 'Module not licensed',
        message: `The ${requiredModule} module is not available in your current plan.`,
        moduleCode: requiredModule,
        upgradeUrl: '/pricing',
        contactSales: true,
      });
    }

    // Check expiration
    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      await this.logAccessAttempt(
        user.organizationId,
        user.id,
        requiredModule,
        'denied',
        request,
      );

      throw new ForbiddenException({
        error: 'Module license expired',
        message: `Your ${requiredModule} module license has expired.`,
        moduleCode: requiredModule,
        renewUrl: '/billing',
      });
    }

    // Check user limits if specified
    if (license.maxUsers) {
      const activeUsers = await this.getActiveModuleUsers(
        user.organizationId,
        requiredModule,
      );
      if (activeUsers >= license.maxUsers) {
        throw new ForbiddenException({
          error: 'User limit reached',
          message: 'Maximum concurrent users for this module exceeded.',
          moduleCode: requiredModule,
        });
      }
    }

    // Log successful access
    await this.logAccessAttempt(
      user.organizationId,
      user.id,
      requiredModule,
      'accessed',
      request,
    );

    return true;
  }

  private async getActiveModuleUsers(
    organizationId: string,
    moduleCode: string,
  ): Promise<number> {
    // Count unique users who accessed this module in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const accessLogs = await this.prisma.moduleAccessLog.findMany({
      where: {
        organizationId,
        moduleCode,
        action: 'accessed',
        timestamp: {
          gte: fiveMinutesAgo,
        },
      },
      distinct: ['userId'],
    });

    return accessLogs.length;
  }

  private async logAccessAttempt(
    organizationId: string,
    userId: string,
    moduleCode: string,
    action: string,
    request: any,
  ): Promise<void> {
    try {
      await this.prisma.moduleAccessLog.create({
        data: {
          organizationId,
          userId,
          moduleCode,
          action,
          ipAddress: request.ip || request.connection?.remoteAddress,
          userAgent: request.headers['user-agent'],
        },
      });
    } catch (error) {
      // Don't fail the request if logging fails
      console.error('Failed to log module access:', error);
    }
  }
}
