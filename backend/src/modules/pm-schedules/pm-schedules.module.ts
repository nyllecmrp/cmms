import { Module, forwardRef } from '@nestjs/common';
import { PMSchedulesService } from './pm-schedules.service';
import { PMSchedulesController } from './pm-schedules.controller';
import { PMSchedulesPurchaseService } from './pm-schedules-purchase.service';
import { PMSchedulesSchedulerService } from './pm-schedules-scheduler.service';
import { DatabaseModule } from '../../database/database.module';
import { PurchaseRequestsModule } from '../purchase-requests/purchase-requests.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => PurchaseRequestsModule), InventoryModule],
  controllers: [PMSchedulesController],
  providers: [PMSchedulesService, PMSchedulesPurchaseService, PMSchedulesSchedulerService],
  exports: [PMSchedulesService, PMSchedulesPurchaseService, PMSchedulesSchedulerService],
})
export class PMSchedulesModule {}
