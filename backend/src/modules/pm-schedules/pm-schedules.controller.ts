import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PMSchedulesService, type CreatePMScheduleDto, type UpdatePMScheduleDto } from './pm-schedules.service';
import { PMSchedulesPurchaseService } from './pm-schedules-purchase.service';
import { PMSchedulesSchedulerService } from './pm-schedules-scheduler.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SimpleModuleAccessGuard, RequireModule } from '../../common/guards/simple-module-access.guard';
import { ModuleKey } from '../../common/constants/role-permissions.constant';

@Controller('pm-schedules')
@UseGuards(JwtAuthGuard, SimpleModuleAccessGuard)
export class PMSchedulesController {
  constructor(
    private readonly pmSchedulesService: PMSchedulesService,
    private readonly pmSchedulesPurchaseService: PMSchedulesPurchaseService,
    private readonly pmSchedulesSchedulerService: PMSchedulesSchedulerService,
  ) {}

  @Post()
  @RequireModule(ModuleKey.PREVENTIVE_MAINTENANCE)
  async create(@Body() createPMScheduleDto: CreatePMScheduleDto) {
    try {
      console.log('Creating PM schedule with data:', JSON.stringify(createPMScheduleDto, null, 2));
      const pmSchedule = await this.pmSchedulesService.create(createPMScheduleDto);

      // Auto-generate Purchase Request if PM has parts
      if (pmSchedule && createPMScheduleDto.parts) {
        console.log('PM has parts - auto-generating Purchase Request...');
        try {
          await this.pmSchedulesPurchaseService.createPurchaseRequestForPMSchedule(
            pmSchedule,
            createPMScheduleDto.createdById
          );
          console.log('✅ Purchase Request auto-generated successfully!');
        } catch (prError) {
          console.error('⚠️ Failed to auto-generate Purchase Request:', prError);
          // Don't fail the PM creation if PR generation fails
        }
      }

      return pmSchedule;
    } catch (error) {
      console.error('PM schedule creation error:', error);
      throw error;
    }
  }

  @Get()
  @RequireModule(ModuleKey.PREVENTIVE_MAINTENANCE)
  findAll(@Query('organizationId') organizationId: string) {
    return this.pmSchedulesService.findAll(organizationId);
  }

  @Get('stats')
  @RequireModule(ModuleKey.PREVENTIVE_MAINTENANCE)
  getStats(@Query('organizationId') organizationId: string) {
    return this.pmSchedulesService.getStats(organizationId);
  }

  @Get(':id')
  @RequireModule(ModuleKey.PREVENTIVE_MAINTENANCE)
  findOne(@Param('id') id: string) {
    return this.pmSchedulesService.findOne(id);
  }

  @Patch(':id')
  @RequireModule(ModuleKey.PREVENTIVE_MAINTENANCE)
  async update(@Param('id') id: string, @Body() updatePMScheduleDto: UpdatePMScheduleDto) {
    try {
      console.log('Updating PM schedule:', id, JSON.stringify(updatePMScheduleDto, null, 2));
      const result = await this.pmSchedulesService.update(id, updatePMScheduleDto);
      console.log('PM schedule update successful');
      return result;
    } catch (error) {
      console.error('PM schedule update error:', error);
      throw error;
    }
  }

  @Patch(':id/status')
  @RequireModule(ModuleKey.PREVENTIVE_MAINTENANCE)
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    try {
      console.log('Updating PM schedule status:', id, 'to', status);
      return await this.pmSchedulesService.updateStatus(id, status);
    } catch (error) {
      console.error('PM schedule status update error:', error);
      throw error;
    }
  }

  @Delete(':id')
  @RequireModule(ModuleKey.PREVENTIVE_MAINTENANCE)
  remove(@Param('id') id: string) {
    return this.pmSchedulesService.remove(id);
  }

  @Post(':id/generate-work-order')
  @RequireModule(ModuleKey.PREVENTIVE_MAINTENANCE)
  async generateWorkOrder(@Param('id') id: string, @Body('userId') userId: string) {
    try {
      console.log('Generating work order for PM schedule:', id);
      const result = await this.pmSchedulesService.generateWorkOrder(id, userId);
      console.log('Work order generated successfully');
      return result;
    } catch (error) {
      console.error('Work order generation error:', error);
      throw error;
    }
  }

  @Post(':id/complete')
  @RequireModule(ModuleKey.PREVENTIVE_MAINTENANCE)
  async completePM(@Param('id') id: string) {
    try {
      console.log('Completing PM schedule:', id);
      const result = await this.pmSchedulesService.completePM(id);
      console.log('PM schedule completed and rescheduled:', result.newNextDue);
      return result;
    } catch (error) {
      console.error('PM completion error:', error);
      throw error;
    }
  }

  @Post('auto-generate/trigger')
  @RequireModule(ModuleKey.PREVENTIVE_MAINTENANCE)
  async manualTriggerAutoGenerate() {
    try {
      console.log('Manual trigger for auto-generate work orders...');
      await this.pmSchedulesSchedulerService.manualTrigger();
      return {
        success: true,
        message: 'Auto-generation triggered successfully. Check server logs for details.',
      };
    } catch (error) {
      console.error('Manual trigger error:', error);
      throw error;
    }
  }
}