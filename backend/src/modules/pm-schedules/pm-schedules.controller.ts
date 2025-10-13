import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PMSchedulesService, type CreatePMScheduleDto, type UpdatePMScheduleDto } from './pm-schedules.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ModuleAccessGuard, RequireModule } from '../../common/guards/module-access.guard';
import { ModuleKey } from '../../common/constants/role-permissions.constant';

@Controller('pm-schedules')
@UseGuards(JwtAuthGuard, ModuleAccessGuard)
export class PMSchedulesController {
  constructor(private readonly pmSchedulesService: PMSchedulesService) {}

  @Post()
  @RequireModule(ModuleKey.PREVENTIVE_MAINTENANCE)
  async create(@Body() createPMScheduleDto: CreatePMScheduleDto) {
    try {
      console.log('Creating PM schedule with data:', JSON.stringify(createPMScheduleDto, null, 2));
      return await this.pmSchedulesService.create(createPMScheduleDto);
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
}