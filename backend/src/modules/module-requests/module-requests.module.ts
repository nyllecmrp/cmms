import { Module } from '@nestjs/common';
import { ModuleRequestsService } from './module-requests.service';
import { ModuleRequestsController } from './module-requests.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ModuleRequestsService],
  controllers: [ModuleRequestsController],
  exports: [ModuleRequestsService],
})
export class ModuleRequestsModule {}
