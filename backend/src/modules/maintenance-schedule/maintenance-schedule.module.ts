import { Module } from '@nestjs/common';
import { MaintenanceScheduleController } from './maintenance-schedule.controller';
import { MaintenanceScheduleService } from './maintenance-schedule.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MaintenanceScheduleController],
  providers: [MaintenanceScheduleService],
  exports: [MaintenanceScheduleService],
})
export class MaintenanceScheduleModule {}
