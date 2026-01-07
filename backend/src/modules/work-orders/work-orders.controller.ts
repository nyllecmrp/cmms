import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import type { CreateWorkOrderDto, UpdateWorkOrderDto } from './work-orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SimpleModuleAccessGuard, RequireModule } from '../../common/guards/simple-module-access.guard';
import { ModuleKey } from '../../common/constants/role-permissions.constant';

@Controller('work-orders')
@UseGuards(JwtAuthGuard, SimpleModuleAccessGuard)
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  @RequireModule(ModuleKey.WORK_ORDERS)
  async create(@Body() createWorkOrderDto: CreateWorkOrderDto) {
    try {
      console.log('Creating work order with data:', JSON.stringify(createWorkOrderDto, null, 2));
      return await this.workOrdersService.create(createWorkOrderDto);
    } catch (error) {
      console.error('Work order creation error:', error);
      throw error;
    }
  }

  @Get()
  @RequireModule(ModuleKey.WORK_ORDERS)
  findAll(@Query('organizationId') organizationId: string) {
    return this.workOrdersService.findAll(organizationId);
  }

  @Get(':id')
  @RequireModule(ModuleKey.WORK_ORDERS)
  findOne(@Param('id') id: string) {
    return this.workOrdersService.findOne(id);
  }

  @Patch(':id')
  @RequireModule(ModuleKey.WORK_ORDERS)
  async update(@Param('id') id: string, @Body() updateWorkOrderDto: UpdateWorkOrderDto) {
    try {
      console.log('Updating work order:', id, JSON.stringify(updateWorkOrderDto, null, 2));
      const result = await this.workOrdersService.update(id, updateWorkOrderDto);
      console.log('Update successful');
      return result;
    } catch (error) {
      console.error('Work order update error:', error);
      throw error;
    }
  }

  @Delete(':id')
  @RequireModule(ModuleKey.WORK_ORDERS)
  remove(@Param('id') id: string) {
    return this.workOrdersService.remove(id);
  }

  @Patch(':id/status')
  @RequireModule(ModuleKey.WORK_ORDERS)
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.workOrdersService.updateStatus(id, body.status);
  }
}
