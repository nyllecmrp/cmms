import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ModuleLicensingService } from './module-licensing.service';
import { ModuleCode, SubscriptionTier } from '../../common/constants/modules.constant';

// Note: Add authentication guards in production
// import { AuthGuard } from '@nestjs/passport';
// import { SuperAdminGuard } from '../../common/guards/super-admin.guard';

@Controller('module-licensing')
export class ModuleLicensingController {
  constructor(private readonly moduleLicensingService: ModuleLicensingService) {}

  /**
   * Get all modules for an organization with licensing status
   * GET /module-licensing/organization/:organizationId/modules
   */
  @Get('organization/:organizationId/modules')
  async getOrganizationModules(@Param('organizationId') organizationId: string) {
    return this.moduleLicensingService.getOrganizationModules(organizationId);
  }

  /**
   * Check if organization has access to a specific module
   * GET /module-licensing/organization/:organizationId/module/:moduleCode/access
   */
  @Get('organization/:organizationId/module/:moduleCode/access')
  async checkModuleAccess(
    @Param('organizationId') organizationId: string,
    @Param('moduleCode') moduleCode: ModuleCode,
  ) {
    const hasAccess = await this.moduleLicensingService.hasModuleAccess(
      organizationId,
      moduleCode,
    );
    return { hasAccess, moduleCode };
  }

  /**
   * Activate a module for an organization (Superadmin only)
   * POST /module-licensing/activate
   */
  @Post('activate')
  // @UseGuards(AuthGuard('jwt'), SuperAdminGuard)
  async activateModule(
    @Body()
    body: {
      organizationId: string;
      moduleCode: ModuleCode;
      expiresAt?: string;
      maxUsers?: number;
      usageLimits?: any;
      activatedById: string;
    },
  ) {
    return this.moduleLicensingService.activateModule({
      ...body,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });
  }

  /**
   * Deactivate a module for an organization (Superadmin only)
   * DELETE /module-licensing/deactivate
   */
  @Delete('deactivate')
  // @UseGuards(AuthGuard('jwt'), SuperAdminGuard)
  async deactivateModule(
    @Body()
    body: {
      organizationId: string;
      moduleCode: ModuleCode;
      deactivatedById: string;
    },
  ) {
    return this.moduleLicensingService.deactivateModule(
      body.organizationId,
      body.moduleCode,
      body.deactivatedById,
    );
  }

  /**
   * Activate all modules for a subscription tier (Superadmin only)
   * POST /module-licensing/activate-tier
   */
  @Post('activate-tier')
  // @UseGuards(AuthGuard('jwt'), SuperAdminGuard)
  async activateTierModules(
    @Body()
    body: {
      organizationId: string;
      tier: SubscriptionTier;
      activatedById: string;
      expiresAt?: string;
    },
  ) {
    return this.moduleLicensingService.activateTierModules(
      body.organizationId,
      body.tier,
      body.activatedById,
      body.expiresAt ? new Date(body.expiresAt) : undefined,
    );
  }

  /**
   * Start a trial for a module
   * POST /module-licensing/start-trial
   */
  @Post('start-trial')
  // @UseGuards(AuthGuard('jwt'))
  async startTrial(
    @Body()
    body: {
      organizationId: string;
      moduleCode: ModuleCode;
      userId: string;
      days?: number;
    },
  ) {
    return this.moduleLicensingService.startTrial(
      body.organizationId,
      body.moduleCode,
      body.userId,
      body.days || 30,
    );
  }

  /**
   * Get module usage statistics
   * GET /module-licensing/organization/:organizationId/usage
   */
  @Get('organization/:organizationId/usage')
  // @UseGuards(AuthGuard('jwt'))
  async getModuleUsage(
    @Param('organizationId') organizationId: string,
    @Query('moduleCode') moduleCode?: string,
  ) {
    return this.moduleLicensingService.getModuleUsageStats(organizationId, moduleCode);
  }

  /**
   * Track module usage (internal endpoint)
   * POST /module-licensing/track-usage
   */
  @Post('track-usage')
  async trackModuleUsage(
    @Body()
    body: {
      organizationId: string;
      moduleCode: string;
      activeUsers?: number;
      transactions?: number;
      apiCalls?: number;
      storageUsed?: number;
    },
  ) {
    const { organizationId, moduleCode, ...metrics } = body;
    return this.moduleLicensingService.trackModuleUsage(organizationId, moduleCode, metrics);
  }
}
