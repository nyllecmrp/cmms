import { Module } from '@nestjs/common';
import { PMSchedulesService } from './pm-schedules.service';
import { PMSchedulesController } from './pm-schedules.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PMSchedulesController],
  providers: [PMSchedulesService],
  exports: [PMSchedulesService],
})
export class PMSchedulesModule {}