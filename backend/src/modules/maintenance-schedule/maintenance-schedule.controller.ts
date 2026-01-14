import { Controller, Get, Post, Patch, Delete, Param, Query, Body } from '@nestjs/common';
import { MaintenanceScheduleService } from './maintenance-schedule.service';

@Controller('maintenance-schedule')
export class MaintenanceScheduleController {
  constructor(private readonly scheduleService: MaintenanceScheduleService) {}

  @Get(':assetId')
  async getSchedule(
    @Param('assetId') assetId: string,
    @Query('year') year: string,
  ) {
    return this.scheduleService.getSchedule(assetId, parseInt(year));
  }

  @Post('generate')
  async generateSchedule(@Body() body: any) {
    return this.scheduleService.generateSchedule(body);
  }

  @Patch(':taskId')
  async updateTask(
    @Param('taskId') taskId: string,
    @Body() updates: any,
  ) {
    return this.scheduleService.updateTask(taskId, updates);
  }

  @Delete(':taskId')
  async deleteTask(@Param('taskId') taskId: string) {
    return this.scheduleService.deleteTask(taskId);
  }
}
