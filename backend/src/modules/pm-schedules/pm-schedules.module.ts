import { Module } from '@nestjs/common';
import { PMSchedulesService } from './pm-schedules.service';
import { PMSchedulesController } from './pm-schedules.controller';

@Module({
  imports: [],
  controllers: [PMSchedulesController],
  providers: [PMSchedulesService],
  exports: [PMSchedulesService],
})
export class PMSchedulesModule {}
